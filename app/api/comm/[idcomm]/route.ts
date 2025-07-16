import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ idcomm: string }> }
) {
  try {
    const { idcomm } = await params;
    
    const comm = await prisma.comm.findUnique({
      where: { idcomm: parseInt(idcomm) },
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

    if (!comm) {
      return NextResponse.json({ error: 'Community note not found' }, { status: 404 });
    }

    return NextResponse.json(comm);
  } catch (error) {
    console.error('Error fetching community note:', error);
    return NextResponse.json({ error: 'Failed to fetch community note' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ idcomm: string }> }
) {
  try {
    const { idcomm } = await params;
    const body = await request.json();
    const { notes } = body;

    const comm = await prisma.comm.update({
      where: { idcomm: parseInt(idcomm) },
      data: { notes },
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

    return NextResponse.json(comm);
  } catch (error) {
    console.error('Error updating community note:', error);
    return NextResponse.json({ error: 'Failed to update community note' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ idcomm: string }> }
) {
  try {
    const { idcomm } = await params;

    await prisma.comm.delete({
      where: { idcomm: parseInt(idcomm) },
    });

    return NextResponse.json({ message: 'Community note deleted successfully' });
  } catch (error) {
    console.error('Error deleting community note:', error);
    return NextResponse.json({ error: 'Failed to delete community note' }, { status: 500 });
  }
}
