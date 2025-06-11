
'use server';

import { createTransport } from 'nodemailer';

interface MailData {
  name: string;
  otp: string;
}

export async function sendOtpEmail(email: string, subject: string, data: MailData): Promise<void> {
  if (!process.env.GMAIL || !process.env.GMAIL_PASSWORD) {
    console.error('Gmail credentials (GMAIL, GMAIL_PASSWORD) are not configured in .env');
    throw new Error('Email service is not configured. Please contact support.');
  }

  const transport = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.GMAIL,
      pass: process.env.GMAIL_PASSWORD,
    }
  });

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
            background-color: #f0f0f0; /* Light Gray Background */
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
            color: #4B0082; /* Deep Indigo - Primary Color */
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
            color: #008080; /* Teal - Accent Color */
            margin-bottom: 30px;
            letter-spacing: 2px;
            padding: 10px;
            border: 1px dashed #008080; /* Teal border */
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
        <p>Hello ${data.name},</p>
        <p>Thank you for signing up with TestPrep AI. Please use the following One-Time Password (OTP) to verify your email address and complete your registration. This OTP is valid for 10 minutes.</p>
        <p class="otp-label">Your OTP is:</p>
        <p class="otp">${data.otp}</p>
        <p>If you did not request this OTP, please ignore this email.</p>
        <p class="footer">Best regards,<br/>The TestPrep AI Team</p>
    </div>
</body>
</html>
`;

  try {
    await transport.sendMail({
      from: `"TestPrep AI" <${process.env.GMAIL}>`,
      to: email,
      subject: subject,
      html: html
    });
    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    // Rethrow a more generic error to the client
    throw new Error('Failed to send OTP email. Please try again later.');
  }
}
