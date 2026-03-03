import express from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../prisma/client.js'
import { sendOTPEmail } from '../utils/mailer.js'
import crypto from 'crypto'

const router = express.Router()

// STEP 1: Send OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    console.log('Forgot password request for:', email)

    const user = await prisma.user.findUnique({ where: { email } })
    console.log('User found:', user)

    if (!user) {
      // Don't reveal if email exists or not — security best practice
      return res.json({ message: 'If this email exists, an OTP has been sent.' })
    }

    const otp = crypto.randomInt(100000, 1000000).toString()

    // Set expiry — 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    // Delete any existing OTP for this email first
    await prisma.password_reset.deleteMany({ where: { email } })
    console.log('Deleted old OTPs')

    // Save new OTP to DB
    await prisma.password_reset.create({ data: { email, otp, expiresAt } })
    console.log('Created new OTP:', otp)

    await sendOTPEmail(email, otp)
    console.log('Email sent')

    res.json({ message: 'If this email exists, an OTP has been sent.' })

  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// STEP 2: Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body

    const record = await prisma.password_reset.findFirst({
      where: { email }
    })

    if (!record) {
      return res.status(400).json({ message: 'No OTP found for this email.' })
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP.' })
    }

    // Check OTP not expired
    if (new Date() > record.expiresAt) {
      await prisma.password_reset.delete({ where: { id: record.id } })
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' })
    }

    res.json({ message: 'OTP verified successfully.' })

  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

// STEP 3: Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body

    const record = await prisma.password_reset.findFirst({
      where: { email }
    })

    // Re-verify OTP before actually changing password
    // The reason we re-verify on the backend in /reset-password is security — without it, someone could skip the /verify-otp call entirely and hit /reset-password directly via Postman with a guessed OTP. Re-checking on the final step ensures the OTP was genuinely verified before the password changes.
    // So from the user's perspective — they type the OTP once. From the backend's perspective — it checks it twice.
    if (!record || record.otp !== otp || new Date() > record.expiresAt) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    })

    await prisma.password_reset.deleteMany({ where: { email } })

    res.json({ message: 'Password reset successfully.' })

  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

export default router