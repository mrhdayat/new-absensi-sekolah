import nodemailer from "nodemailer";

// Simple interface for email options
interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Smart Email Sender
 * - Monitors SMTP_HOST env var.
 * - If present: Sends real email via Nodemailer.
 * - If missing: Logs email content to server console (Mock Mode).
 */
export async function sendEmail({ to, subject, html }: MailOptions): Promise<boolean> {
  // 1. Check for SMTP Configuration
  const hasSmtp = !!process.env.SMTP_HOST;

  if (!hasSmtp) {
    // === MOCK MODE ===
    console.log(`\n📧 [MOCK EMAIL] -----------------------------`);
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`CONTENT:`);
    console.log(html.replace(/<[^>]*>/g, '')); // Strip HTML for readable log
    console.log(`---------------------------------------------\n`);
    return true;
  }

  // === REAL MODE ===
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false // Often needed for development SMTP servers
      }
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Attendly System" <no-reply@attendly.id>',
      to,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.error("❌ Failed to send email via SMTP:", error);
    return false;
  }
}

/**
 * Specialized OTP Email Template
 */
export async function sendOtpEmail(to: string, code: string, purpose: string = "Verifikasi Akun") {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #2563eb; padding: 20px; text-align: center; color: white;">
        <h1 style="margin: 0;">ATTENDLY</h1>
      </div>
      <div style="padding: 20px;">
        <h2 style="color: #333;">Kode Verifikasi Anda</h2>
        <p style="color: #666; line-height: 1.6;">
          Halo, <br/>
          Gunakan kode OTP berikut untuk <strong>${purpose}</strong>. 
          Kode ini berlaku selama 15 menit.
        </p>
        <div style="background-color: #f8fafc; padding: 15px; text-align: center; margin: 25px 0; border-radius: 8px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563eb;">${code}</span>
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.
        </p>
      </div>
      <div style="background-color: #f1f5f9; padding: 15px; text-align: center; color: #64748b; font-size: 12px;">
        &copy; ${new Date().getFullYear()} Attendly School System
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: `🔐 Kode OTP: ${code} - ${purpose}`,
    html,
  });
}
