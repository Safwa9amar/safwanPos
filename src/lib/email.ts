
import nodemailer from 'nodemailer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const appName = "SafwanPOS";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const generateEmailHtml = ({ title, body, action }: { title: string; body: string; action: { text: string; link: string; } }) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f8f8; }
            .container { width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            .header { background-color: #4c1d95; color: #ffffff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px 20px; text-align: center; color: #333333; line-height: 1.6; }
            .content p { margin: 0 0 20px; }
            .button { display: inline-block; padding: 12px 25px; font-size: 16px; font-weight: bold; color: #ffffff; background-color: #4c1d95; text-decoration: none; border-radius: 5px; }
            .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #999999; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${appName}</h1>
            </div>
            <div class="content">
                <h2>${title}</h2>
                <p>${body}</p>
                <a href="${action.link}" class="button">${action.text}</a>
            </div>
            <div class="footer">
                <p>If you did not request this, please ignore this email.</p>
                <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

export async function sendVerificationEmail(email: string, token: string) {
  const verificationLink = `${siteUrl}/verify-email?token=${token}`;
  
  const html = generateEmailHtml({
    title: 'Welcome aboard!',
    body: `We're excited to have you. Please click the button below to verify your email address and get started with ${appName}.`,
    action: {
      text: 'Verify Your Email',
      link: verificationLink
    }
  });

  const mailOptions = {
    from: `"${appName}" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `Verify your email for ${appName}`,
    html: html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Could not send verification email.');
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${siteUrl}/reset-password?token=${token}`;

  const html = generateEmailHtml({
    title: 'Password Reset Request',
    body: 'You recently requested to reset your password for your SafwanPOS account. Click the button below to proceed.',
    action: {
      text: 'Reset Your Password',
      link: resetLink
    }
  });

  const mailOptions = {
    from: `"${appName}" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `Password Reset Request for ${appName}`,
    html: html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Could not send password reset email.');
  }
}
