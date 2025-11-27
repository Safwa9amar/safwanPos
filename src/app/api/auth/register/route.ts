
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { UserRole, SubscriptionStatus } from '@prisma/client';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';
import { addDays } from 'date-fns';

const RegisterSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = RegisterSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { name, email, password } = validated.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userCount = await prisma.user.count();
    const emailVerificationToken = crypto.randomBytes(32).toString('base64url');

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userCount === 0 ? UserRole.ADMIN : UserRole.CASHIER,
        emailVerificationToken,
        subscriptionStatus: SubscriptionStatus.TRIAL,
        trialEndsAt: addDays(new Date(), 14), // 14-day trial
      },
    });

    // Send verification email
    await sendVerificationEmail(email, emailVerificationToken);

    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({ 
        user: userWithoutPassword,
        message: "Registration successful. Please check your email to verify your account."
    }, { status: 201 });

  } catch (error) {
    console.error('[REGISTER_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
