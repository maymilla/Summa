import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ idpers: string }> }
) {
  try {
    const { idpers } = await params;
    const perspective = await prisma.perspective.findUnique({
      where: { idpers: parseInt(idpers) },
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

    if (!perspective) {
      return NextResponse.json({ error: 'Perspective not found' }, { status: 404 });
    }

    return NextResponse.json(perspective);
  } catch (error) {
    console.error('Error fetching perspective:', error);
    return NextResponse.json({ error: 'Failed to fetch perspective' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ idpers: string }> }
) {
  try {
    const { idpers } = await params;
    const body = await request.json();
    const { content } = body;

    const perspective = await prisma.perspective.update({
      where: { idpers: parseInt(idpers) },
      data: { content },
      include: {
        topic: true,
      },
    });

    return NextResponse.json(perspective);
  } catch (error) {
    console.error('Error updating perspective:', error);
    return NextResponse.json({ error: 'Failed to update perspective' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ idpers: string }> }
) {
  try {
    const { idpers } = await params;
    await prisma.perspective.delete({
      where: { idpers: parseInt(idpers) },
    });

    return NextResponse.json({ message: 'Perspective deleted successfully' });
  } catch (error) {
    console.error('Error deleting perspective:', error);
    return NextResponse.json({ error: 'Failed to delete perspective' }, { status: 500 });
  }
}
