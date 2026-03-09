import nodemailer from 'nodemailer'
import "dotenv/config"

const transporter = nodemailer.createTransport({
  host: 'email-smtp.ap-south-1.amazonaws.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SES_SMTP_USER,
    pass: process.env.SES_SMTP_PASS,    // gmail app password (not your real password)
  }
})

export const sendOTPEmail = async (to, otp) => {
  await transporter.sendMail({
    from: `"BudgetWise" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your BudgetWise Password Reset OTP',
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: auto;">
        <h2>Password Reset</h2>
        <p>Your OTP is:</p>
        <h1 style="letter-spacing: 8px; color: #10b981;">${otp}</h1>
        <p>This OTP expires in <strong>10 minutes</strong>.</p>
        <p>If you didn't request this, ignore this email.</p>
      </div>
    `
  })
}

export const sendResetEmail = async (to) => {
  await transporter.sendMail({
    from: `"BudgetWise" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your BudgetWise Password is Now Reset',
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: auto;">
        <h2>Password Reset Successful!</h2>
        <p>Your password has been reset successfully! Please Login with your new password.</p>
      </div>
    `
  })
}