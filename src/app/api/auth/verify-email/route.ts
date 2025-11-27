
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const TokenSchema = z.string().min(1);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedToken = TokenSchema.safeParse(body.token);

    if (!validatedToken.success) {
      return NextResponse.json({ error: 'Invalid token provided.' }, { status: 400 });
    }
    
    const token = validatedToken.data;

    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid verification token.' }, { status: 400 });
    }

    if (user.emailVerified) {
        return NextResponse.json({ message: 'Email already verified.' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null, // Invalidate the token
      },
    });

    return NextResponse.json({ message: 'Email verified successfully.' });
  } catch (error) {
    console.error('[VERIFY_EMAIL_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
