import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Upvote a community note
export async function POST(
  request: Request,
  { params }: { params: Promise<{ idcomm: string }> }
) {
  try {
    const { idcomm } = await params;
    const body = await request.json();
    const { action } = body; // 'upvote' or 'downvote'

    if (!action || (action !== 'upvote' && action !== 'downvote')) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "upvote" or "downvote"' },
        { status: 400 }
      );
    }

    // Check if community note exists
    const existingComm = await prisma.comm.findUnique({
      where: { idcomm: parseInt(idcomm) },
    });

    if (!existingComm) {
      return NextResponse.json(
        { error: 'Community note not found' },
        { status: 404 }
      );
    }

    // Use raw query to update votes since Prisma types aren't updated yet
    if (action === 'upvote') {
      await prisma.$executeRaw`
        UPDATE comm SET upvote = upvote + 1 WHERE idcomm = ${parseInt(idcomm)}
      `;
    } else {
      await prisma.$executeRaw`
        UPDATE comm SET downvote = downvote + 1 WHERE idcomm = ${parseInt(idcomm)}
      `;
    }

    // Fetch the updated record
    const result = await prisma.comm.findUnique({
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

    return NextResponse.json({
      message: `${action} successful`,
      comm: result,
    });
  } catch (error) {
    console.error(`Error processing vote:`, error);
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    );
  }
}
