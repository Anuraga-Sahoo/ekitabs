
'use server';

import { createTransport } from 'nodemailer';

interface MailData {
  name: string; // User's name
  otp: string;  // 6-digit OTP
}

// HTML escaping function
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendOtpEmail(email: string, subject: string, data: MailData): Promise<void> {
  if (!process.env.GMAIL || !process.env.GMAIL_PASSWORD) {
    console.error('Email service (GMAIL or GMAIL_PASSWORD) is not configured in .env.');
    throw new Error('Email service is not configured.');
  }

  const transport = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.GMAIL,
      pass: process.env.GMAIL_PASSWORD,
    },
    // Optional: Add timeout settings if needed
    // connectionTimeout: 5000, // 5 seconds
    // greetingTimeout: 5000, // 5 seconds
    // socketTimeout: 10000, // 10 seconds
  });

  const safeName = escapeHtml(data.name);
  const safeOtp = escapeHtml(data.otp);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #F0F0F0; display: flex; justify-content: center; align-items: center; min-height: 100vh; box-sizing: border-box; }
        .container { background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); text-align: center; max-width: 500px; width: 100%; }
        h1 { color: #4B0082; margin-bottom: 15px; } /* Deep Indigo */
        p { margin-bottom: 20px; color: #555; line-height: 1.6; }
        .otp-label { font-size: 18px; color: #333; margin-bottom: 10px; }
        .otp { font-size: 38px; font-weight: bold; color: #008080; margin-bottom: 30px; letter-spacing: 2px; padding: 10px; border: 1px dashed #008080; display: inline-block; border-radius: 4px; } /* Teal */
        .footer { margin-top: 25px; font-size: 12px; color: #888; }
    </style>
</head>
<body>
    <div class="container">
        <h1>OTP Verification</h1>
        <p>Hello ${safeName},</p>
        <p>Your One-Time Password (OTP) for TestPrep AI is:</p>
        <p class="otp">${safeOtp}</p>
        <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
        <p class="footer">Best regards,<br/>The TestPrep AI Team</p>
    </div>
</body>
</html>`;

  try {
    await transport.sendMail({
      from: `"TestPrep AI" <${process.env.GMAIL}>`,
      to: email,
      subject: subject, // e.g., "TestPrep AI - OTP Verification"
      html: html,
    });
    console.log(`OTP email sent successfully to ${email}`);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    // Construct a more specific error message if possible
    let errorMessage = 'Failed to send OTP email.';
    if (error instanceof Error) {
        // Check for common Nodemailer errors
        if ('code' in error && error.code === 'EENVELOPE') {
            errorMessage = 'Failed to send OTP email: Invalid recipient address.';
        } else if ('code' in error && error.code === 'EAUTH') {
            errorMessage = 'Failed to send OTP email: Authentication failed. Check GMAIL_PASSWORD.';
        }
    }
    throw new Error(errorMessage);
  }
}
