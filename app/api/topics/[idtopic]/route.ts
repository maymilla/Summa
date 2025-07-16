import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ idtopic: string }> }
) {
  try {
    const { idtopic } = await params;
    const topic = await prisma.topic.findUnique({
      where: { idtopic: parseInt(idtopic) },
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

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    return NextResponse.json(topic);
  } catch (error) {
    console.error('Error fetching topic:', error);
    return NextResponse.json({ error: 'Failed to fetch topic' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ idtopic: string }> }
) {
  try {
    const { idtopic } = await params;
    const body = await request.json();
    const { judul, desc } = body;

    const topic = await prisma.topic.update({
      where: { idtopic: parseInt(idtopic) },
      data: {
        judul,
        desc,
      },
    });

    return NextResponse.json(topic);
  } catch (error) {
    console.error('Error updating topic:', error);
    return NextResponse.json({ error: 'Failed to update topic' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ idtopic: string }> }
) {
  try {
    const { idtopic } = await params;
    await prisma.topic.delete({
      where: { idtopic: parseInt(idtopic) },
    });

    return NextResponse.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    console.error('Error deleting topic:', error);
    return NextResponse.json({ error: 'Failed to delete topic' }, { status: 500 });
  }
}
