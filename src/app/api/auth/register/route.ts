
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
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

    // The first user to ever register is the system-wide super admin.
    // They don't have a `createdById` and are the root of a tenancy tree.
    const isFirstUser = userCount === 0;

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: isFirstUser ? 'ADMIN' : 'CASHIER',
        emailVerificationToken: isFirstUser ? emailVerificationToken : null, // Only first user needs to verify
        emailVerified: isFirstUser ? null : new Date(), // Staff are auto-verified
        subscriptionStatus: 'TRIAL',
        trialEndsAt: addDays(new Date(), 14), // 14-day trial
      },
    });
    
    // Only send verification email to the first-ever admin user
    if (isFirstUser) {
      await sendVerificationEmail(email, emailVerificationToken);
    }

    const { password: _, ...userWithoutPassword } = newUser;

    const message = isFirstUser 
        ? "Registration successful. Please check your email to verify your account."
        : "User account created successfully.";

    return NextResponse.json({ 
        user: userWithoutPassword,
        message: message
    }, { status: 201 });

  } catch (error) {
    console.error('[REGISTER_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
