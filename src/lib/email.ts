
import nodemailer from 'nodemailer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});


export async function sendVerificationEmail(email: string, token: string) {
  const verificationLink = `${siteUrl}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify your email for SafwanPOS',
    html: `<p>Welcome to SafwanPOS!</p><p>Please click the link below to verify your email address:</p><a href="${verificationLink}">${verificationLink}</a>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
  } catch (error) {
    console.error('Error sending verification email:', error);
    // In a production app, you might want to throw an error or handle it differently
  }
}


export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${siteUrl}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Password Reset Request for SafwanPOS',
    html: `<p>You requested a password reset. Click the link below to set a new password:</p><a href="${resetLink}">${resetLink}</a><p>If you did not request this, please ignore this email.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
}
