
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';
import { addHours } from 'date-fns';

const RequestSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = RequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const { email } = validated.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Don't reveal if user exists for security reasons
      return NextResponse.json({ message: 'If an account with this email exists, a password reset link has been sent.' });
    }

    const passwordResetToken = crypto.randomBytes(32).toString('base64url');
    const passwordResetTokenExpires = addHours(new Date(), 1); // Token expires in 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken,
        passwordResetTokenExpires,
      },
    });

    await sendPasswordResetEmail(email, passwordResetToken);

    return NextResponse.json({ message: 'If an account with this email exists, a password reset link has been sent.' });

  } catch (error) {
    console.error('[REQUEST_PASSWORD_RESET_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
