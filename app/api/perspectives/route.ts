import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const perspectives = await prisma.perspective.findMany({
      include: {
        topic: true,
        comms: {
          include: {
            user: {
              select: {
                email: true,
                nama: true,
              },
            },
          },
        },
      },
    });
    return NextResponse.json(perspectives);
  } catch (error) {
    console.error('Error fetching perspectives:', error);
    return NextResponse.json({ error: 'Failed to fetch perspectives' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idtopic, content } = body;

    const topic = await prisma.topic.findUnique({
      where: { idtopic: parseInt(idtopic) },
    });

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    const perspective = await prisma.perspective.create({
      data: {
        idtopic,
        content,
      },
      include: {
        topic: true,
      },
    });

    return NextResponse.json(perspective, { status: 201 });
  } catch (error) {
    console.error('Error creating perspective:', error);
    return NextResponse.json({ error: 'Failed to create perspective' }, { status: 500 });
  }
}
