
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    cookies().delete('token');
    return NextResponse.json({ message: 'Logged out' });
  } catch (error) {
    console.error('[LOGOUT_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
