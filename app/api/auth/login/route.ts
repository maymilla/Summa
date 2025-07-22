import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.pass);

    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const response = NextResponse.json(
      { 
        message: 'Login successful', 
        user: { 
          email: user.email, 
          nama: user.nama 
        } 
      },
      { status: 200 }
    );

    response.cookies.set('session', 'mock-session-token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
    });

    // Also set user email for the /me endpoint
    response.cookies.set('userEmail', user.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
