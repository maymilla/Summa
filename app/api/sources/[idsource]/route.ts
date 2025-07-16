import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ idsource: string }> }
) {
  try {
    const { idsource } = await params;
    const source = await prisma.source.findUnique({
      where: { idsource: parseInt(idsource) },
      include: {
        perspective: {
          include: {
            topic: true,
          },
        },
      },
    });

    if (!source) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }

    return NextResponse.json(source);
  } catch (error) {
    console.error('Error fetching source:', error);
    return NextResponse.json({ error: 'Failed to fetch source' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ idsource: string }> }
) {
  try {
    const { idsource } = await params;
    const body = await request.json();
    const { sources } = body;

    const source = await prisma.source.update({
      where: { idsource: parseInt(idsource) },
      data: { sources },
      include: {
        perspective: {
          include: {
            topic: true,
          },
        },
      },
    });

    return NextResponse.json(source);
  } catch (error) {
    console.error('Error updating source:', error);
    return NextResponse.json({ error: 'Failed to update source' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ idsource: string }> }
) {
  try {
    const { idsource } = await params;
    await prisma.source.delete({
      where: { idsource: parseInt(idsource) },
    });

    return NextResponse.json({ message: 'Source deleted successfully' });
  } catch (error) {
    console.error('Error deleting source:', error);
    return NextResponse.json({ error: 'Failed to delete source' }, { status: 500 });
  }
}
