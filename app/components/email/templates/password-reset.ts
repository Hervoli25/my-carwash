export function buildPasswordResetEmail(resetUrl: string, userName?: string) {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Reset your PRESTIGE Car Wash password</title>
      <style>
        body { font-family: Arial, sans-serif; background:#f5f7fb; margin:0; padding:0; }
        .container { max-width:600px; margin:0 auto; padding:24px; }
        .card { background:#ffffff; border-radius:12px; box-shadow:0 6px 16px rgba(0,0,0,0.06); overflow:hidden; }
        .header { background:linear-gradient(135deg,#3b82f6,#8b5cf6,#ef4444); color:#fff; padding:20px; text-align:center; }
        .content { padding:24px; color:#333; }
        .btn { display:inline-block; padding:12px 20px; background:#2563eb; color:#fff; text-decoration:none; border-radius:8px; }
        .muted { color:#6b7280; font-size:13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <h2>PRESTIGE Car Wash</h2>
          </div>
          <div class="content">
            <p>Hello ${userName ?? 'there'},</p>
            <p>We received a request to reset your password. Click the button below to set a new password.</p>
            <p style="text-align:center; margin:28px 0;">
              <a class="btn" href="${resetUrl}">Reset your password</a>
            </p>
            <p class="muted">If the button doesn't work, copy and paste this link into your browser:</p>
            <p class="muted" style="word-break:break-all;">${resetUrl}</p>
            <p class="muted">This link will expire in 1 hour. If you didn't request a password reset, you can ignore this email.</p>
            <p>— PRESTIGE Car Wash Team</p>
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
}

