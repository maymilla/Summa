import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        nama: true,
        // Don't return password for security
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST create new user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, email, pass } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        nama,
        email,
        pass, // In production, hash this password
      },
      select: {
        email: true,
        nama: true,
        // Don't return password
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
