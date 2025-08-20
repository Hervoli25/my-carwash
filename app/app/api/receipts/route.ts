import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getReceiptsByUser, searchReceipts } from '@/lib/receipt-generator';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const userId = searchParams.get('userId');

    if (query) {
      // Search receipts by receipt number, customer name, email, or vehicle plate
      const receipts = await searchReceipts(query);
      return NextResponse.json({ receipts });
    } else if (userId) {
      // Get receipts for specific user
      const receipts = await getReceiptsByUser(userId);
      return NextResponse.json({ receipts });
    } else {
      // Get current user's receipts
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const receipts = await getReceiptsByUser(user.id);
      return NextResponse.json({ receipts });
    }

  } catch (error) {
    console.error('Receipt fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch receipts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}