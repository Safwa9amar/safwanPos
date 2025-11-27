
// In a real app, you would use a service like Resend, SendGrid, or Nodemailer.
// For this example, we'll just log the emails to the console.

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function sendVerificationEmail(email: string, token: string) {
  const verificationLink = `${siteUrl}/verify-email?token=${token}`;
  
  console.log('--- SENDING VERIFICATION EMAIL ---');
  console.log(`To: ${email}`);
  console.log(`Link: ${verificationLink}`);
  console.log('------------------------------------');

  // Here you would add your email sending logic.
  // For example, using Resend:
  // await resend.emails.send({
  //   from: 'onboarding@resend.dev',
  //   to: email,
  //   subject: 'Verify your email address',
  //   html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`
  // });
}


export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${siteUrl}/reset-password?token=${token}`;

  console.log('--- SENDING PASSWORD RESET EMAIL ---');
  console.log(`To: ${email}`);
  console.log(`Link: ${resetLink}`);
  console.log('------------------------------------');

  // Here you would add your email sending logic
}
