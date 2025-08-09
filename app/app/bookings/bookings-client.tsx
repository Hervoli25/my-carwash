'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { Header } from '@/components/header';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Car, Clock, CreditCard, CheckCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface BookingData {
  id: string;
  bookingDate: Date | string;
  timeSlot: string;
  status: string;
  totalAmount: number;
  baseAmount: number;
  addOnAmount: number;
  notes?: string | null;
  createdAt: Date | string;
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
    amount: number;
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

interface BookingsClientProps {
  bookings: BookingData[];
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return <Badge className="bg-blue-100 text-blue-700">Confirmed</Badge>;
    case 'COMPLETED':
      return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
    case 'CANCELLED':
      return <Badge className="bg-red-100 text-red-700">Cancelled</Badge>;
    case 'IN_PROGRESS':
      return <Badge className="bg-yellow-100 text-yellow-700">In Progress</Badge>;
    case 'NO_SHOW':
      return <Badge className="bg-gray-100 text-gray-700">No Show</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getPaymentMethodLabel = (method?: string) => {
  switch (method) {
    case 'card':
      return 'Credit/Debit Card';
    case 'cash':
      return 'Pay at Location';
    case 'eft':
      return 'Bank Transfer (EFT)';
    case 'payfast':
      return 'PayFast';
    default:
      return method || 'Not specified';
  }
};

export function BookingsClient({ bookings }: BookingsClientProps) {
  const [filter, setFilter] = useState('all');
  const router = useRouter();
  
  // Check for success messages from URL params
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('rescheduled')) {
      setSuccessMessage('Booking rescheduled successfully!');
      // Clean up URL
      router.replace('/bookings');
    } else if (urlParams.get('modified')) {
      setSuccessMessage('Booking modified successfully!');
      router.replace('/bookings');
    } else if (urlParams.get('cancelled')) {
      setSuccessMessage('Booking cancelled successfully!');
      router.replace('/bookings');
    }
  }, [router]);

  const handleViewReceipt = (bookingId: string) => {
    // Open receipt in new window/tab
    window.open(`/bookings/${bookingId}/receipt`, '_blank');
  };

  const handleReschedule = (bookingId: string) => {
    router.push(`/bookings/${bookingId}/reschedule`);
  };

  const handleModify = (bookingId: string) => {
    router.push(`/bookings/${bookingId}/modify`);
  };

  const handleLeaveReview = (bookingId: string) => {
    router.push(`/bookings/${bookingId}/review`);
  };

  const handleCancel = async (bookingId: string) => {
    const result = await Swal.fire({
      title: 'Cancel Booking?',
      text: 'Are you sure you want to cancel this booking? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Cancel Booking',
      cancelButtonText: 'Keep Booking',
      reverseButtons: true,
      allowOutsideClick: false,
      allowEscapeKey: true,
      buttonsStyling: true,
      customClass: {
        popup: 'font-sans !important',
        title: 'text-gray-900 font-semibold !important',
        htmlContainer: 'text-gray-600 !important',
        confirmButton: 'swal2-confirm !important',
        cancelButton: 'swal2-cancel !important',
        actions: 'swal2-actions !important'
      },
      didOpen: () => {
        // Ensure buttons are visible
        const confirmBtn = document.querySelector('.swal2-confirm') as HTMLElement;
        const cancelBtn = document.querySelector('.swal2-cancel') as HTMLElement;
        const actionsContainer = document.querySelector('.swal2-actions') as HTMLElement;

        if (confirmBtn) {
          confirmBtn.style.display = 'inline-block';
          confirmBtn.style.margin = '0 8px';
        }
        if (cancelBtn) {
          cancelBtn.style.display = 'inline-block';
          cancelBtn.style.margin = '0 8px';
        }
        if (actionsContainer) {
          actionsContainer.style.display = 'flex';
          actionsContainer.style.justifyContent = 'center';
          actionsContainer.style.gap = '16px';
        }
      }
    });

    if (result.isConfirmed) {
      // Show loading
      Swal.fire({
        title: 'Cancelling...',
        text: 'Please wait while we cancel your booking.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
          method: 'POST',
        });
        
        if (response.ok) {
          await Swal.fire({
            title: 'Booking Cancelled!',
            text: 'Your booking has been successfully cancelled.',
            icon: 'success',
            confirmButtonColor: '#10b981',
            confirmButtonText: 'OK'
          });
          router.push('/bookings?cancelled=true');
        } else {
          const data = await response.json();
          await Swal.fire({
            title: 'Cancellation Failed',
            text: data.error || 'Failed to cancel booking. Please try again.',
            icon: 'error',
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'OK'
          });
        }
      } catch (error) {
        await Swal.fire({
          title: 'Error',
          text: 'An error occurred while canceling the booking. Please try again.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'OK'
        });
      }
    }
  };


  const filteredBookings = bookings.filter((booking) => {
    switch (filter) {
      case 'upcoming':
        return booking.status === 'CONFIRMED' && new Date(booking.bookingDate) >= new Date();
      case 'completed':
        return booking.status === 'COMPLETED';
      case 'cancelled':
        return booking.status === 'CANCELLED';
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <DashboardSidebar activeTab="bookings" />
          </div>

          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-600">Manage your car wash appointments</p>
              
              {successMessage && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <p className="text-green-800 font-medium">{successMessage}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Booking Status Tabs */}
            <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1">
              <Button 
                variant={filter === 'all' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setFilter('all')}
              >
                All ({bookings.length})
              </Button>
              <Button 
                variant={filter === 'upcoming' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setFilter('upcoming')}
              >
                Upcoming
              </Button>
              <Button 
                variant={filter === 'completed' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setFilter('completed')}
              >
                Completed
              </Button>
              <Button 
                variant={filter === 'cancelled' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setFilter('cancelled')}
              >
                Cancelled
              </Button>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
                </h3>
                <p className="text-gray-500 mb-6">
                  {filter === 'all' 
                    ? "You haven't made any bookings yet. Ready to get your car sparkling clean?"
                    : `No ${filter} bookings found.`}
                </p>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => router.push('/book')}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book New Service
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredBookings.map((booking) => (
                  <Card key={booking.id} className="overflow-hidden">
                    <CardHeader className="bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center text-lg">
                            <Car className="w-5 h-5 mr-2 text-blue-600" />
                            {booking.service.name}
                          </CardTitle>
                          <p className="text-gray-600 mt-1">
                            Booking #{booking.id.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Booked on {formatDate(new Date(booking.createdAt))}
                          </p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      {/* Booking Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <div className="flex items-start space-x-3">
                          <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {formatDate(new Date(booking.bookingDate))}
                            </p>
                            <p className="text-sm text-gray-500">Date</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {booking.timeSlot}
                            </p>
                            <p className="text-sm text-gray-500">Time</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <Car className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {booking.vehicle.make} {booking.vehicle.model}
                            </p>
                            <p className="text-sm text-gray-500 font-mono">
                              {booking.vehicle.licensePlate}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {formatCurrency(booking.totalAmount)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {getPaymentMethodLabel(booking.payment?.paymentMethodType ?? undefined)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Vehicle Details */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Vehicle Details</h4>
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
                            <span className="text-gray-500">Year:</span>
                            <span className="ml-2 font-medium">{booking.vehicle.year}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Color:</span>
                            <span className="ml-2 font-medium">{booking.vehicle.color}</span>
                          </div>
                        </div>
                      </div>

                      {/* Service Details */}
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Service Details</h4>
                        <p className="text-sm text-gray-600 mb-2">{booking.service.description}</p>
                        <div className="flex justify-between items-center text-sm">
                          <span>Base Service: {formatCurrency(booking.baseAmount)}</span>
                          {booking.addOnAmount > 0 && (
                            <span>Add-ons: {formatCurrency(booking.addOnAmount)}</span>
                          )}
                        </div>
                      </div>

                      {/* Add-ons */}
                      {booking.addOns.length > 0 && (
                        <div className="bg-green-50 rounded-lg p-4 mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Add-on Services</h4>
                          <div className="space-y-1">
                            {booking.addOns.map((addOn, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{addOn.addOn.name}</span>
                                <span>{formatCurrency(addOn.price)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Special Instructions */}
                      {booking.notes && (
                        <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Special Instructions</h4>
                          <p className="text-sm text-gray-600">{booking.notes}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-4 border-t">
                        <Button size="sm" variant="outline" onClick={() => handleViewReceipt(booking.id)}>
                          View Receipt
                        </Button>
                        {booking.status === 'CONFIRMED' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleReschedule(booking.id)}>
                              Reschedule
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleModify(booking.id)}>
                              Modify
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleCancel(booking.id)}>
                              Cancel
                            </Button>
                          </>
                        )}
                        {booking.status === 'COMPLETED' && (
                          <Button size="sm" variant="outline" onClick={() => handleLeaveReview(booking.id)}>
                            Leave Review
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredBookings.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Need another car wash service?</p>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => router.push('/book')}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book New Service
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}