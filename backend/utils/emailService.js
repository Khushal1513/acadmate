// Email Service - Send OTP emails using nodemailer
const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter (using Gmail SMTP)
const getGmailPassword = () => {
  const password = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS;
  // Remove spaces from app password (Gmail app passwords sometimes have spaces)
  return password ? password.replace(/\s+/g, '') : password;
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || process.env.EMAIL_USER, // Your Gmail address
    pass: getGmailPassword(), // Your Gmail App Password (spaces removed)
  },
});

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"AcadMate" <${process.env.GMAIL_USER || process.env.EMAIL_USER || process.env.SENDGRID_FROM_EMAIL}>`,
      to: email,
      subject: 'AcadMate - Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fbf9f1;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #f4b30c; margin: 0;">AcadMate</h1>
            </div>
            <h2 style="color: #1a1200; margin-bottom: 20px;">Email Verification</h2>
            <p style="color: #1a1200; font-size: 16px; line-height: 1.6;">
              Thank you for registering with AcadMate! Please use the following OTP to verify your email address:
            </p>
            <div style="background-color: #f4b30c; color: #1a1200; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
              <h1 style="margin: 0; font-size: 36px; letter-spacing: 5px; font-weight: bold;">${otp}</h1>
            </div>
            <p style="color: #1a1200; font-size: 14px; line-height: 1.6;">
              This OTP will expire in <strong>5 minutes</strong>. If you didn't request this OTP, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #ddd9c5; margin: 30px 0;">
            <p style="color: #666; font-size: 12px; text-align: center; margin: 0;">
              © 2025 AcadMate. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send OTP email');
  }
};

module.exports = {
  sendOTPEmail,
};

