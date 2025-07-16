import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const topics = await prisma.topic.findMany({
      include: {
        perspectives: {
          include: {
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
        },
      },
    });
    return NextResponse.json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { judul, desc } = body;

    const topic = await prisma.topic.create({
      data: {
        judul,
        desc,
      },
    });

    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    console.error('Error creating topic:', error);
    return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 });
  }
}
