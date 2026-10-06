import type { EmailMessage } from "./transport";

function wrap(body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; background:#08080A; color:#F4F4F5; margin:0; padding:32px 16px; }
    .card { max-width:520px; margin:0 auto; background:#0E0E11; border:1px solid #27272E; border-radius:12px; padding:32px; }
    .brand { font-family:ui-monospace,monospace; font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:#71717A; margin-bottom:24px; }
    h1 { font-size:20px; font-weight:600; margin:0 0 12px; letter-spacing:-0.01em; }
    p { font-size:14px; line-height:1.6; color:#A1A1AA; margin:0 0 16px; }
    .btn { display:inline-block; padding:10px 18px; background:#1877F2; color:#fff; border-radius:8px; text-decoration:none; font-size:14px; font-weight:500; }
    .link { color:#5EB8FF; word-break:break-all; font-family:ui-monospace,monospace; font-size:12px; }
    .footer { margin-top:32px; padding-top:16px; border-top:1px solid #1F1F24; font-size:11px; color:#52525B; }
  </style></head><body><div class="card">
    <div class="brand">LearnTrace</div>
    ${body}
    <div class="footer">You received this because someone used this address on learntrace.app. If that wasn&apos;t you, ignore this email.</div>
  </div></body></html>`;
}

export function verifyEmail(params: {
  to: string;
  url: string;
}): EmailMessage {
  const { to, url } = params;
  const text = `Verify your LearnTrace email\n\nClick the link below to confirm this address:\n${url}\n\nThe link expires in 24 hours.`;
  const html = wrap(`
    <h1>Verify your email</h1>
    <p>Click the button below to confirm your LearnTrace account. This link expires in 24 hours.</p>
    <p><a href="${url}" class="btn">Verify email</a></p>
    <p>Or paste this URL into your browser:</p>
    <p class="link">${url}</p>
  `);
  return { to, subject: "Verify your LearnTrace email", text, html };
}

export function resetPassword(params: {
  to: string;
  url: string;
}): EmailMessage {
  const { to, url } = params;
  const text = `Reset your LearnTrace password\n\nClick the link below to choose a new password:\n${url}\n\nThe link expires in 1 hour. If you didn&apos;t request this, ignore this email.`;
  const html = wrap(`
    <h1>Reset your password</h1>
    <p>Click the button below to choose a new password. This link expires in 1 hour.</p>
    <p><a href="${url}" class="btn">Reset password</a></p>
    <p>Or paste this URL into your browser:</p>
    <p class="link">${url}</p>
    <p style="color:#71717A;font-size:12px;margin-top:24px">If you didn&apos;t request this, you can safely ignore this email.</p>
  `);
  return { to, subject: "Reset your LearnTrace password", text, html };
}
