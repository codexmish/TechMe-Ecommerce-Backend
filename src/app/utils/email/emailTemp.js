const escapeHtml = (value = "") =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );

const copyByPurpose = {
  "verify-email": {
    subject: "Verify your TechMe account",
    title: "Verify your email",
    intro: "Use this one-time code to finish creating your TechMe account.",
  },
  "reset-password": {
    subject: "Reset your TechMe password",
    title: "Password reset code",
    intro:
      "We received a request to reset your TechMe password. Use this code to continue.",
  },
};

export const emailTemp = ({ name, otp, purpose, expiresInMinutes = 10 }) => {
  const copy = copyByPurpose[purpose];
  if (!copy) throw new Error("Unsupported email OTP purpose");
  const safeName = escapeHtml(name || "there");
  const safeOtp = escapeHtml(otp);
  const subject = copy.subject;
  const text = `Hi ${name || "there"},\n\n${copy.intro}\n\nYour verification code is: ${otp}\n\nThis code expires in ${expiresInMinutes} minutes. If you did not request this, you can ignore this email.\n\nTechMe`;
  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>${escapeHtml(copy.title)}</title></head>
<body style="margin:0;background:#f3f6fb;font-family:Arial,Helvetica,sans-serif;color:#172033;-webkit-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f6fb;padding:36px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr><td style="background:#102a43;padding:24px 32px;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:.3px;">TechMe<span style="color:#55c2a3">.</span></td></tr>
        <tr><td style="padding:36px 32px 18px;"><p style="margin:0 0 10px;color:#607086;font-size:14px;">Hi ${safeName},</p><h1 style="margin:0 0 14px;font-size:25px;line-height:1.3;color:#102a43;">${escapeHtml(copy.title)}</h1><p style="margin:0;color:#536277;font-size:15px;line-height:1.7;">${escapeHtml(copy.intro)}</p></td></tr>
        <tr><td align="center" style="padding:14px 32px 24px;"><div style="display:inline-block;background:#eef8f5;border:1px solid #d6eee6;border-radius:12px;padding:16px 28px;color:#087e68;font-size:32px;font-weight:700;letter-spacing:9px;">${safeOtp}</div><p style="margin:14px 0 0;color:#738197;font-size:13px;">This code expires in ${expiresInMinutes} minutes.</p></td></tr>
        <tr><td style="padding:0 32px 30px;"><p style="margin:0;border-top:1px solid #e8edf3;padding-top:20px;color:#738197;font-size:13px;line-height:1.6;">If you did not request this code, you can ignore this email. For your security, do not share this code with anyone.</p></td></tr>
      </table>
      <p style="margin:18px 0 0;color:#8b97a8;font-size:12px;">© ${new Date().getFullYear()} TechMe</p>
    </td></tr>
  </table>
</body>
</html>`;
  return { subject, text, html };
};
