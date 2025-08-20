import { prisma } from '@/lib/db';

export interface ReceiptData {
  bookingId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceName: string;
  serviceCategory: string;
  vehiclePlate: string;
  vehicleDetails: {
    make: string;
    model: string;
    year: number;
    color: string;
  };
  baseAmount: number;
  addOnAmount: number;
  totalAmount: number;
  paymentMethod?: string;
  paymentStatus: string;
  addOns?: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  bookingDate: Date;
  timeSlot: string;
  notes?: string;
}

export async function generateAndStoreReceipt(receiptData: ReceiptData): Promise<string> {
  // Generate receipt number in format RCT-XXXXXXXX
  const receiptNumber = `RCT-${receiptData.bookingId.slice(-8).toUpperCase()}`;
  
  // Check if receipt already exists
  const existingReceipt = await prisma.receipt.findUnique({
    where: { receiptNumber }
  });
  
  if (existingReceipt) {
    return receiptNumber; // Return existing receipt number
  }
  
  // Prepare receipt data for storage
  const completeReceiptData = {
    ...receiptData,
    receiptNumber,
    generatedAt: new Date(),
    business: {
      name: "PRESTIGE Car Wash",
      address: "30 Lower Piers Road, Wynberg, Cape Town",
      phone: "+27 78 613 2969",
      email: "info@prestigecarwash.co.za"
    }
  };
  
  // Store receipt in database
  await prisma.receipt.create({
    data: {
      receiptNumber,
      bookingId: receiptData.bookingId,
      userId: receiptData.userId,
      customerName: receiptData.customerName,
      customerEmail: receiptData.customerEmail,
      customerPhone: receiptData.customerPhone,
      serviceName: receiptData.serviceName,
      serviceCategory: receiptData.serviceCategory,
      vehiclePlate: receiptData.vehiclePlate,
      vehicleDetails: JSON.stringify(receiptData.vehicleDetails),
      baseAmount: receiptData.baseAmount,
      addOnAmount: receiptData.addOnAmount,
      totalAmount: receiptData.totalAmount,
      paymentMethod: receiptData.paymentMethod,
      paymentStatus: receiptData.paymentStatus,
      receiptData: JSON.stringify(completeReceiptData),
    }
  });
  
  return receiptNumber;
}

export async function getReceiptByNumber(receiptNumber: string) {
  const receipt = await prisma.receipt.findUnique({
    where: { receiptNumber },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true
        }
      },
      booking: {
        include: {
          service: true,
          vehicle: true,
          payment: true,
          addOns: {
            include: {
              addOn: true
            }
          }
        }
      }
    }
  });
  
  return receipt;
}

export async function getReceiptsByUser(userId: string) {
  const receipts = await prisma.receipt.findMany({
    where: { userId },
    orderBy: { generatedAt: 'desc' },
    include: {
      booking: {
        select: {
          id: true,
          bookingDate: true,
          timeSlot: true,
          status: true
        }
      }
    }
  });
  
  return receipts;
}

export async function trackReceiptDownload(receiptNumber: string) {
  await prisma.receipt.update({
    where: { receiptNumber },
    data: {
      downloadedAt: new Date(),
      downloadCount: {
        increment: 1
      }
    }
  });
}

export async function trackReceiptEmail(receiptNumber: string) {
  await prisma.receipt.update({
    where: { receiptNumber },
    data: {
      emailedAt: new Date(),
      emailCount: {
        increment: 1
      }
    }
  });
}

export async function searchReceipts(query: string) {
  const receipts = await prisma.receipt.findMany({
    where: {
      OR: [
        { receiptNumber: { contains: query, mode: 'insensitive' } },
        { customerName: { contains: query, mode: 'insensitive' } },
        { customerEmail: { contains: query, mode: 'insensitive' } },
        { vehiclePlate: { contains: query, mode: 'insensitive' } }
      ]
    },
    orderBy: { generatedAt: 'desc' },
    take: 50,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      booking: {
        select: {
          id: true,
          bookingDate: true,
          timeSlot: true,
          status: true
        }
      }
    }
  });
  
  return receipts;
}