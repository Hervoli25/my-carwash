'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  Receipt, 
  Download, 
  Printer, 
  Calendar, 
  Clock, 
  Car, 
  CreditCard,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
}

interface BookingData {
  id: string;
  bookingDate: Date | string;
  timeSlot: string;
  totalAmount: number;
  baseAmount: number;
  addOnAmount: number;
  notes?: string | null;
  service: {
    name: string;
    description: string;
    category: string;
  };
  vehicle: {
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
  };
  payment?: {
    paymentMethodType?: string | null;
    status: string;
  } | null;
  addOns: Array<{
    addOn: {
      name: string;
      price: number;
    };
    quantity: number;
    price: number;
  }>;
}

interface ReceiptClientProps {
  booking: BookingData;
  user: User;
  receiptNumber: string;
  bookingNumber: string;
}

export function ReceiptClient({ booking, user, receiptNumber, bookingNumber }: ReceiptClientProps) {
  const router = useRouter();

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => router.push('/bookings')}
              className="mb-4"
            >
              ← Back to Bookings
            </Button>
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Receipt className="w-6 h-6 mr-2 text-blue-600" />
                  Service Receipt
                </h1>
                <p className="text-gray-600">Receipt #{receiptNumber}</p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Receipt Card */}
          <Card className="receipt-container">
            <CardHeader className="bg-blue-600 text-white print-header">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold">PRESTIGE Car Wash</CardTitle>
                  <p className="text-blue-100 print-subtitle mt-1">Premium Car Wash Services</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">Receipt Date</p>
                  <p className="font-semibold">{formatDate(new Date())}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              {/* Business Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Business Details</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      30 Lower Piers Road, Wynberg, Cape Town
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      +27 78 613 2969
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      info@prestigecarwash.co.za
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Customer Details</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium">Name:</span> {user.name}</p>
                    <p><span className="font-medium">Email:</span> {user.email}</p>
                    <p><span className="font-medium">Phone:</span> {user.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <hr className="my-6 border-gray-200" />

              {/* Receipt Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Receipt className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Receipt #</p>
                  <p className="font-semibold text-sm">{receiptNumber}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Booking #</p>
                  <p className="font-semibold text-sm">{bookingNumber}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Service Date</p>
                  <p className="font-semibold text-sm">{formatDate(new Date(booking.bookingDate))}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Time</p>
                  <p className="font-semibold text-sm">{booking.timeSlot}</p>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Car className="w-5 h-5 mr-2" />
                  Vehicle Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Make:</span>
                    <span className="ml-2 font-medium">{booking.vehicle.make}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Model:</span>
                    <span className="ml-2 font-medium">{booking.vehicle.model}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">License Plate:</span>
                    <span className="ml-2 font-medium font-mono">{booking.vehicle.licensePlate}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Color:</span>
                    <span className="ml-2 font-medium">{booking.vehicle.color}</span>
                  </div>
                </div>
              </div>

              <hr className="my-6 border-gray-200" />

              {/* Service Details */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Service Details</h3>
                
                {/* Base Service */}
                <div className="bg-white border rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{booking.service.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{booking.service.description}</p>
                      <Badge variant="outline" className="mt-2">{booking.service.category}</Badge>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-lg">{formatCurrency(booking.baseAmount)}</p>
                    </div>
                  </div>
                </div>

                {/* Add-ons */}
                {booking.addOns.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">Add-on Services</h4>
                    {booking.addOns.map((addOn, index) => (
                      <div key={index} className="flex justify-between items-center py-2 px-4 bg-green-50 rounded">
                        <div>
                          <span className="text-sm font-medium">{addOn.addOn.name}</span>
                          <span className="text-xs text-gray-500 ml-2">× {addOn.quantity}</span>
                        </div>
                        <span className="font-medium">{formatCurrency(addOn.price)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <hr className="my-6 border-gray-200" />

              {/* Payment Summary */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">Payment Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Base Service</span>
                    <span>{formatCurrency(booking.baseAmount)}</span>
                  </div>
                  
                  {booking.addOnAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Add-ons</span>
                      <span>{formatCurrency(booking.addOnAmount)}</span>
                    </div>
                  )}
                  
                  <hr className="border-gray-200" />
                  
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Amount</span>
                    <span>{formatCurrency(booking.totalAmount)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Payment Method</span>
                    <span>{booking.payment?.paymentMethodType || 'Cash'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span>Payment Status</span>
                    <Badge 
                      variant={booking.payment?.status === 'COMPLETED' ? 'default' : 'outline'}
                      className={booking.payment?.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : ''}
                    >
                      {booking.payment?.status || 'Pending'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              {booking.notes && (
                <>
                  <hr className="my-6 border-gray-200" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Special Instructions</h3>
                    <p className="text-gray-600 text-sm bg-yellow-50 p-3 rounded">{booking.notes}</p>
                  </div>
                </>
              )}

              {/* Footer */}
              <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
                <p className="mb-2">Thank you for choosing PRESTIGE Car Wash!</p>
                <p>This receipt was generated electronically and is valid without a signature.</p>
                <p className="mt-4">For support, contact us at support@prestigecarwash.co.za</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body { margin: 0; }
          .receipt-container { box-shadow: none !important; margin: 0; }
          button { display: none !important; }
          .print-header { background-color: #f3f4f6 !important; color: #000 !important; }
          .print-subtitle { color: #6b7280 !important; }
        }
      `}</style>
    </>
  );
}