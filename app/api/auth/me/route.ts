import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check for session cookie
    const sessionCookie = request.cookies.get('session');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userEmail = request.cookies.get('userEmail')?.value;
    
    if (!userEmail) {
      return NextResponse.json(
        { message: 'No user data found' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        email: true,
        nama: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
