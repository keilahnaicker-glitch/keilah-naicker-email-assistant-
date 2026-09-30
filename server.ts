import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI SDK
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });

  // Healthcheck endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Antigravity Gmail Automation Server" });
  });

  // Endpoint: Classify emails for operational urgency and generate draft responses
  app.post("/api/classify", async (req, res) => {
    try {
      const { emails } = req.body;
      if (!Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({ error: "Missing array of emails in request body." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("GEMINI_API_KEY not configured. Falling back to heuristic classification.");
      }

      const prompt = `You are an AI Agent running inside Google Antigravity 2.0.
Your task is to analyze the following email bodies to evaluate if each represents:
- An urgent system issue (tag: 'CRITICAL_SYSTEM', label: 'Critical System Outage/Alert')
- A high-priority bug report (tag: 'HIGH_BUG', label: 'High Priority Bug')
- An active customer request (tag: 'ACTIVE_CUSTOMER', label: 'Escalated Customer Request')
- Non-urgent or standard informational email (tag: 'LOW', label: 'Low Urgency / Informational')

User Email / Recipient: keilahnaicker@gmail.com (Name: Keilah Naicker).

Here are the emails to evaluate:
${JSON.stringify(emails, null, 2)}

Return a JSON array containing objects with the exact schema:
[
  {
    "emailId": "string (matching email.id)",
    "subject": "string",
    "sender": "string",
    "senderEmail": "string",
    "urgency": "CRITICAL_SYSTEM" | "HIGH_BUG" | "ACTIVE_CUSTOMER" | "LOW",
    "urgencyLabel": "string",
    "summary": "1 sentence executive summary of the issue",
    "reason": "1-2 sentence operational explanation why this is urgent or low priority",
    "suggestedSubject": "Re: [ACK] original subject or professional response subject",
    "proposedReply": "A complete, highly professional, empathetic draft response ready to send, written from Keilah Naicker. Keep tone direct, professional, reassuring, and specify concrete investigation/next steps."
  }
]

IMPORTANT: Return ONLY valid, parseable JSON code block or array without commentary.`;

      if (apiKey) {
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.2,
          }
        });

        const rawText = response.text || "[]";
        let parsed;
        try {
          parsed = JSON.parse(rawText);
        } catch (e) {
          console.error("JSON parse error from Gemini response:", e);
          const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
          parsed = JSON.parse(cleaned);
        }
        return res.json({ classifications: parsed });
      } else {
        // Fallback heuristic classification if API key is pending
        const classifications = emails.map((e: any) => {
          const lowerSub = (e.subject || "").toLowerCase();
          const lowerBody = (e.body || "").toLowerCase();
          const isCrit = lowerSub.includes("critical") || lowerBody.includes("outage") || lowerSub.includes("db latency");
          const isBug = lowerSub.includes("bug") || lowerSub.includes("failing") || lowerBody.includes("502");
          const isCust = lowerSub.includes("escalation") || lowerSub.includes("urgent") || lowerBody.includes("assistance");

          let urgency = 'LOW';
          let label = 'Low Urgency / Informational';
          if (isCrit) { urgency = 'CRITICAL_SYSTEM'; label = 'Critical System Outage/Alert'; }
          else if (isBug) { urgency = 'HIGH_BUG'; label = 'High Priority Bug'; }
          else if (isCust) { urgency = 'ACTIVE_CUSTOMER'; label = 'Escalated Customer Request'; }

          return {
            emailId: e.id,
            subject: e.subject,
            sender: e.sender,
            senderEmail: e.senderEmail || e.sender,
            urgency,
            urgencyLabel: label,
            summary: e.snippet || "Email payload analyzed.",
            reason: urgency === 'LOW' ? "Standard informational email." : "Detected operational urgency keywords.",
            suggestedSubject: `Re: ${e.subject}`,
            proposedReply: `Hi,\n\nThank you for bringing this to my attention. I am actively reviewing this request and will provide an update shortly.\n\nBest regards,\nKeilah Naicker`
          };
        });
        return res.json({ classifications });
      }
    } catch (err: any) {
      console.error("Classification error:", err);
      res.status(500).json({ error: err.message || "Failed to classify emails." });
    }
  });

  // Endpoint: Fetch last 10 unread emails from real Gmail API
  app.get("/api/gmail/unread", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing Google OAuth Access Token in Authorization header." });
      }

      const accessToken = authHeader.split(" ")[1];

      // Call Gmail API: list unread messages
      const listRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread&maxResults=10", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!listRes.ok) {
        const errorData = await listRes.json().catch(() => ({}));
        return res.status(listRes.status).json({
          error: errorData.error?.message || "Failed to query Gmail API.",
          details: errorData
        });
      }

      const listData = await listRes.json();
      const messagesSummary = listData.messages || [];

      if (messagesSummary.length === 0) {
        return res.json({ messages: [], count: 0 });
      }

      // Fetch message details in parallel
      const emailDetails = await Promise.all(
        messagesSummary.map(async (item: { id: string, threadId: string }) => {
          const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}?format=full`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (!detailRes.ok) return null;
          const msg = await detailRes.json();

          const headers = msg.payload?.headers || [];
          const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || "";

          let bodyText = msg.snippet || "";
          if (msg.payload?.parts) {
            const textPart = msg.payload.parts.find((p: any) => p.mimeType === "text/plain");
            if (textPart?.body?.data) {
              bodyText = Buffer.from(textPart.body.data, "base64url").toString("utf-8");
            }
          } else if (msg.payload?.body?.data) {
            bodyText = Buffer.from(msg.payload.body.data, "base64url").toString("utf-8");
          }

          return {
            id: msg.id,
            threadId: msg.threadId,
            sender: getHeader("From") || "Unknown Sender",
            senderEmail: getHeader("From"),
            subject: getHeader("Subject") || "(No Subject)",
            date: getHeader("Date") || new Date().toISOString(),
            snippet: msg.snippet || "",
            body: bodyText || msg.snippet || "",
            isUnread: true,
            isSample: false
          };
        })
      );

      const validEmails = emailDetails.filter(Boolean);
      return res.json({ messages: validEmails, count: validEmails.length });
    } catch (err: any) {
      console.error("Gmail unread fetch error:", err);
      res.status(500).json({ error: err.message || "Internal server error fetching Gmail unread emails." });
    }
  });

  // Endpoint: Create draft in user's Gmail
  app.post("/api/gmail/draft", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing Google OAuth Access Token in Authorization header." });
      }

      const accessToken = authHeader.split(" ")[1];
      const { to, subject, body, threadId } = req.body;

      if (!to || !subject || !body) {
        return res.status(400).json({ error: "Missing required draft fields: to, subject, or body." });
      }

      // Format RFC 822 MIME message
      const mimeLines = [
        `To: ${to}`,
        `Subject: ${subject}`,
        `Content-Type: text/plain; charset=utf-8`,
        `MIME-Version: 1.0`,
        ``,
        body
      ];

      const mimeString = mimeLines.join("\r\n");
      const base64Encoded = Buffer.from(mimeString)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const payload: any = {
        message: {
          raw: base64Encoded
        }
      };

      if (threadId) {
        payload.message.threadId = threadId;
      }

      const draftRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/drafts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!draftRes.ok) {
        const errorData = await draftRes.json().catch(() => ({}));
        return res.status(draftRes.status).json({
          error: errorData.error?.message || "Failed to create draft in Gmail.",
          details: errorData
        });
      }

      const draftData = await draftRes.json();
      return res.json({
        success: true,
        draftId: draftData.id,
        messageId: draftData.message?.id,
        threadId: draftData.message?.threadId
      });
    } catch (err: any) {
      console.error("Gmail draft creation error:", err);
      res.status(500).json({ error: err.message || "Failed to create draft in Gmail." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Antigravity Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
