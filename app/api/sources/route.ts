import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const sources = await prisma.source.findMany({
      include: {
        perspective: {
          include: {
            topic: true,
          },
        },
      },
    });
    
    return NextResponse.json(sources);
  } catch (error) {
    console.error('Error fetching sources:', error);
    return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idpers, sources } = body;

    const perspective = await prisma.perspective.findUnique({
      where: { idpers: parseInt(idpers) },
    });

    if (!perspective) {
      return NextResponse.json({ error: 'Perspective not found' }, { status: 404 });
    }

    const source = await prisma.source.create({
      data: {
        idpers: parseInt(idpers),
        sources,
      },
      include: {
        perspective: {
          include: {
            topic: true,
          },
        },
      },
    });

    return NextResponse.json(source, { status: 201 });
  } catch (error) {
    console.error('Error creating source:', error);
    return NextResponse.json({ error: 'Failed to create source' }, { status: 500 });
  }
}
