'use server';

import { createTransport } from 'nodemailer';

interface MailData {
  name: string;
  otp: string;
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
    throw new Error('Email service is not configured.');
  }

  const transport = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL,
      pass: process.env.GMAIL_PASSWORD,
    }
  });

  // Escape user inputs
  const safeName = escapeHtml(data.name);
  const safeOtp = escapeHtml(data.otp);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f0f0f0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            box-sizing: border-box;
        }
        .container {
            background-color: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 500px;
            width: 100%;
        }
        h1 {
            color: #4B0082;
            margin-bottom: 15px;
        }
        p {
            margin-bottom: 20px;
            color: #555;
            line-height: 1.6;
        }
        .otp-label {
            font-size: 18px;
            color: #333;
            margin-bottom: 10px;
        }
        .otp {
            font-size: 38px;
            font-weight: bold;
            color: #008080;
            margin-bottom: 30px;
            letter-spacing: 2px;
            padding: 10px;
            border: 1px dashed #008080;
            display: inline-block;
            border-radius: 4px;
        }
        .footer {
            margin-top: 25px;
            font-size: 12px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>OTP Verification</h1>
        <p>Hello ${safeName},</p>
        <p>Thank you for signing up with TestPrep AI. Please use the following One-Time Password (OTP) to verify your email address. This OTP is valid for 10 minutes.</p>
        <p class="otp-label">Your OTP is:</p>
        <p class="otp">${safeOtp}</p>
        <p>If you did not request this OTP, please ignore this email.</p>
        <p class="footer">Best regards,<br/>The TestPrep AI Team</p>
    </div>
</body>
</html>`;

  try {
    await transport.sendMail({
      from: `"TestPrep AI" <${process.env.GMAIL}>`,
      to: email,
      subject: subject,
      html: html
    });
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email.');
  }
}