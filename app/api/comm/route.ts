import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const comms = await prisma.comm.findMany({
      include: {
        perspective: {
          include: {
            topic: true,
          },
        },
        user: {
          select: {
            email: true,
            nama: true,
          },
        },
      },
    });
    return NextResponse.json(comms);
  } catch (error) {
    console.error('Error fetching community notes:', error);
    return NextResponse.json({ error: 'Failed to fetch community notes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idpers, notes, userEmail } = body;

    const perspective = await prisma.perspective.findUnique({
      where: { idpers: parseInt(idpers) },
    });

    if (!perspective) {
      return NextResponse.json({ error: 'Perspective not found' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const comm = await prisma.comm.create({
      data: {
        idpers,
        notes,
        userEmail,
      },
      include: {
        perspective: {
          include: {
            topic: true,
          },
        },
        user: {
          select: {
            email: true,
            nama: true,
          },
        },
      },
    });

    return NextResponse.json(comm, { status: 201 });
  } catch (error) {
    console.error('Error creating community note:', error);
    return NextResponse.json({ error: 'Failed to create community note' }, { status: 500 });
  }
}
