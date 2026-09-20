import nodemailer from 'nodemailer';

let transporterPromise: Promise<nodemailer.Transporter> | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporterPromise) return transporterPromise;

  transporterPromise = (async () => {
    // If custom SMTP credentials are provided in environment
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }

    // Otherwise, generate a dedicated real test inbox on Ethereal Email
    const testAccount = await nodemailer.createTestAccount();
    console.log('[Email Service] Created real Ethereal test inbox:', testAccount.user);

    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  })();

  return transporterPromise;
}

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendMailOptions) {
  try {
    const transporter = await getTransporter();
    const fromAddress = process.env.EMAIL_FROM || 'Project Apex <no-reply@apex.local>';

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, ''),
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[Email Service] Delivered email to ${to}: "${subject}"`);
    if (previewUrl) {
      console.log(`[Email Service] 📩 Real Web Email Preview URL: ${previewUrl}`);
    }

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error('[Email Service] Error delivering email:', error);
    return { success: false, error };
  }
}

export async function sendVerificationEmail(email: string, url: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; margin: 0; padding: 24px; color: #111827; }
          .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb; padding: 32px; }
          .logo { font-size: 24px; font-weight: 900; color: #131921; text-decoration: none; }
          .logo span { color: #f08804; }
          .badge { display: inline-block; background-color: #fef3c7; color: #92400e; font-size: 11px; font-weight: bold; padding: 2px 8px; border-radius: 4px; margin-top: 8px; }
          h1 { font-size: 20px; font-weight: 700; color: #111827; margin-top: 20px; margin-bottom: 12px; }
          p { font-size: 14px; line-height: 1.6; color: #4b5563; margin-bottom: 24px; }
          .button { display: inline-block; background-color: #ffd814; color: #0f1111; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 9999px; text-decoration: none; text-align: center; border: 1px solid #fcd34d; }
          .footer { font-size: 12px; color: #9ca3af; margin-top: 32px; border-top: 1px solid #e5e7eb; pt: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <a href="#" class="logo">apex<span>.</span></a>
          <div><span class="badge">Security Verification</span></div>
          <h1>Verify your Project Apex email address</h1>
          <p>Thank you for creating an account with Project Apex. To complete your registration and secure your account, please verify your email address by clicking the button below. This single-use link will expire in 24 hours.</p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${url}" class="button">Verify Email Address</a>
          </div>
          <p style="font-size: 12px; color: #6b7280;">If you did not request this account, please disregard this message.</p>
          <div class="footer">
            <p>© 2026 Project Apex, Inc. Built for 8x assignment.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Verify your Project Apex email address',
    html,
  });
}

export async function sendPasswordResetEmail(email: string, url: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; margin: 0; padding: 24px; color: #111827; }
          .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb; padding: 32px; }
          .logo { font-size: 24px; font-weight: 900; color: #131921; text-decoration: none; }
          .logo span { color: #f08804; }
          .badge { display: inline-block; background-color: #fee2e2; color: #b91c1c; font-size: 11px; font-weight: bold; padding: 2px 8px; border-radius: 4px; margin-top: 8px; }
          h1 { font-size: 20px; font-weight: 700; color: #111827; margin-top: 20px; margin-bottom: 12px; }
          p { font-size: 14px; line-height: 1.6; color: #4b5563; margin-bottom: 24px; }
          .button { display: inline-block; background-color: #ffd814; color: #0f1111; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 9999px; text-decoration: none; text-align: center; border: 1px solid #fcd34d; }
          .footer { font-size: 12px; color: #9ca3af; margin-top: 32px; border-top: 1px solid #e5e7eb; pt: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <a href="#" class="logo">apex<span>.</span></a>
          <div><span class="badge">Password Assistance</span></div>
          <h1>Reset your Project Apex password</h1>
          <p>We received a request to reset the password associated with your account. Click the button below to choose a new, secure password. For security, this single-use link expires in 1 hour.</p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${url}" class="button">Reset Password</a>
          </div>
          <p style="font-size: 12px; color: #6b7280;">If you didn't request a password reset, you can safely ignore this email. Your password will not change.</p>
          <div class="footer">
            <p>© 2026 Project Apex, Inc. Built for 8x assignment.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Project Apex password assistance',
    html,
  });
}
