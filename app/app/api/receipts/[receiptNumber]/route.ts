import { NextRequest, NextResponse } from 'next/server';
import { getReceiptByNumber, trackReceiptDownload, trackReceiptEmail } from '@/lib/receipt-generator';

interface Params {
  receiptNumber: string;
}

export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const { receiptNumber } = params;
    
    const receipt = await getReceiptByNumber(receiptNumber);
    
    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    // Parse the stored receipt data
    let receiptData;
    try {
      receiptData = JSON.parse(receipt.receiptData);
    } catch (parseError) {
      receiptData = {
        receiptNumber: receipt.receiptNumber,
        customerName: receipt.customerName,
        customerEmail: receipt.customerEmail,
        serviceName: receipt.serviceName,
        vehiclePlate: receipt.vehiclePlate,
        totalAmount: receipt.totalAmount,
        generatedAt: receipt.generatedAt
      };
    }

    return NextResponse.json({ 
      receipt: {
        ...receipt,
        receiptData
      }
    });

  } catch (error) {
    console.error('Receipt fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch receipt',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Params }) {
  try {
    const { receiptNumber } = params;
    const { action } = await request.json();

    if (action === 'download') {
      await trackReceiptDownload(receiptNumber);
      return NextResponse.json({ success: true, action: 'download_tracked' });
    } else if (action === 'email') {
      await trackReceiptEmail(receiptNumber);
      return NextResponse.json({ success: true, action: 'email_tracked' });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Receipt action error:', error);
    return NextResponse.json({ 
      error: 'Failed to track receipt action',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}