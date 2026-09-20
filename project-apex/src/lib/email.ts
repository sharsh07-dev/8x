import nodemailer, { type Transporter } from 'nodemailer';

let transporterPromise: Promise<Transporter> | null = null;

async function getTransporter(): Promise<Transporter> {
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

export async function sendSecurityAlertEmail(to: string, userName: string, action: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
      <h2 style="color: #0f1111;">Project Apex Security Alert</h2>
      <p>Hello ${userName},</p>
      <p>This is a security confirmation that your account experienced the following action: <strong>${action}</strong>.</p>
      <p>If you did not perform this action, please immediately reset your password and sign out of all active sessions.</p>
      <hr style="border: none; border-top: 1px solid #e7e7e7; margin: 24px 0;" />
      <p style="font-size: 12px; color: #565959;">Project Apex Team</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Security Alert: ${action}`,
    html,
  });
}

export async function sendOrderConfirmationEmail(
  to: string,
  userName: string,
  orderNumber: string,
  orderTotal: number,
  estimatedDelivery: string,
  items: { title: string; quantity: number; price: number }[]
) {
  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.title}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111; border: 1px solid #e7e7e7; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0f172a; padding: 20px; text-align: center;">
        <h1 style="color: #f59e0b; margin: 0; font-size: 24px;">Project Apex</h1>
      </div>
      <div style="padding: 24px;">
        <h2 style="color: #065f46; margin-top: 0;">Order Confirmed!</h2>
        <p>Hello ${userName},</p>
        <p>Thank you for shopping with Project Apex! We've received your order and our fulfillment team is preparing it for delivery.</p>
        
        <div style="background-color: #f8fafc; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Order Number:</strong> <span style="font-family: monospace; color: #0f172a;">${orderNumber}</span></p>
          <p style="margin: 0 0 8px 0;"><strong>Estimated Delivery:</strong> <span style="color: #059669; font-weight: bold;">${estimatedDelivery}</span></p>
          <p style="margin: 0;"><strong>Order Total:</strong> $${orderTotal.toFixed(2)}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
          <thead>
            <tr style="background-color: #f1f5f9; text-align: left;">
              <th style="padding: 8px;">Item</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders/confirmation/${orderNumber}" 
             style="background-color: #f59e0b; color: #0f172a; padding: 12px 24px; border-radius: 6px; font-weight: bold; text-decoration: none; display: inline-block;">
            View Your Order
          </a>
        </div>
      </div>
      <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0;">Project Apex E-Commerce Platform • Simulation Mode</p>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Order Confirmation - ${orderNumber}`,
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
