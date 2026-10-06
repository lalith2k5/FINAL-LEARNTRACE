const FROM = process.env.EMAIL_FROM ?? "LearnTrace <noreply@learntrace.app>";
const TRANSPORT = process.env.EMAIL_TRANSPORT ?? "console";

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

async function sendConsole(msg: EmailMessage) {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`[email:console] To: ${msg.to}`);
  console.log(`[email:console] Subject: ${msg.subject}`);
  console.log("───────────────────────────────────────────────────────────────");
  console.log(msg.text);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

async function sendResend(msg: EmailMessage) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY missing but EMAIL_TRANSPORT=resend");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      from: FROM,
      to: msg.to,
      subject: msg.subject,
      text: msg.text,
      html: msg.html,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend error ${res.status}: ${body.slice(0, 200)}`);
  }
}

export async function sendEmail(msg: EmailMessage): Promise<void> {
  if (TRANSPORT === "resend") return sendResend(msg);
  return sendConsole(msg);
}

export function emailTransportName(): string {
  return TRANSPORT;
}
