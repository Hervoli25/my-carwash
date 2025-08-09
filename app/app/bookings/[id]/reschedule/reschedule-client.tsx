'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  Calendar,
  Clock,
  Car,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface BookingData {
  id: string;
  bookingDate: Date | string;
  timeSlot: string;
  status: string;
  totalAmount: number;
  baseAmount: number;
  addOnAmount: number;
  notes?: string | null;
  service: {
    name: string;
    description: string;
    category: string;
    duration: number;
  };
  vehicle: {
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
  };
  addOns: Array<{
    addOn: {
      name: string;
      price: number;
    };
    quantity: number;
    price: number;
  }>;
}

interface RescheduleClientProps {
  booking: BookingData;
}

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30'
];

export function RescheduleClient({ booking }: RescheduleClientProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTimeSlot) {
      setError('Please select both date and time');
      return;
    }

    // Check if selected date/time is different from current
    const currentDate = new Date(booking.bookingDate);
    const isSameDate = selectedDate.toDateString() === currentDate.toDateString();
    const isSameTime = selectedTimeSlot === booking.timeSlot;
    
    if (isSameDate && isSameTime) {
      setError('Please select a different date or time');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/bookings/${booking.id}/reschedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingDate: selectedDate.toISOString(),
          timeSlot: selectedTimeSlot,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reschedule booking');
      }

      // Success - redirect back to bookings with success message
      router.push('/bookings?rescheduled=true');
      
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Disable past dates and today (need at least 24h notice)
    return date < today;
  };

  const currentDate = new Date(booking.bookingDate);
  const isToday = currentDate.toDateString() === new Date().toDateString();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => router.push('/bookings')}
            className="mb-4"
          >
            ← Back to Bookings
          </Button>
          
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-blue-600" />
            Reschedule Booking
          </h1>
          <p className="text-gray-600">Change your appointment date and time</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Booking Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Car className="w-5 h-5 mr-2 text-blue-600" />
                  Current Booking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{booking.service.name}</h3>
                    <Badge variant="outline">{booking.service.category}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium">{formatDate(currentDate)}</p>
                        <p className="text-gray-500">Current Date</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium">{booking.timeSlot}</p>
                        <p className="text-gray-500">Current Time</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm font-medium">Vehicle: {booking.vehicle.make} {booking.vehicle.model}</p>
                    <p className="text-sm text-gray-600">License: {booking.vehicle.licensePlate}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Total: {formatCurrency(booking.totalAmount)}</p>
                    <p className="text-xs text-gray-500">
                      Base: {formatCurrency(booking.baseAmount)}
                      {booking.addOnAmount > 0 && ` + Add-ons: ${formatCurrency(booking.addOnAmount)}`}
                    </p>
                  </div>

                  {isToday && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                        <p className="text-sm text-yellow-800">
                          Your appointment is scheduled for today. Please reschedule at least 2 hours in advance.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reschedule Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ArrowRight className="w-5 h-5 mr-2 text-green-600" />
                  Select New Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                )}

                {/* Date Selection */}
                <div>
                  <Label className="text-base font-medium">Select New Date</Label>
                  <p className="text-sm text-gray-500 mb-3">Choose a date at least 24 hours in advance</p>
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={isDateDisabled}
                    className="rounded-md border"
                  />
                </div>

                <hr className="border-gray-200" />

                {/* Time Selection */}
                <div>
                  <Label className="text-base font-medium">Select New Time</Label>
                  <p className="text-sm text-gray-500 mb-3">Available time slots</p>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTimeSlot === time ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTimeSlot(time)}
                        className={`text-center ${
                          selectedTimeSlot === time
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'hover:bg-blue-50'
                        }`}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>

                {selectedDate && selectedTimeSlot && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <p className="font-medium text-green-800">New Appointment Details</p>
                    </div>
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium">Date:</span> {formatDate(selectedDate)}</p>
                      <p><span className="font-medium">Time:</span> {selectedTimeSlot}</p>
                      <p><span className="font-medium">Duration:</span> ~{booking.service.duration} minutes</p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={handleReschedule}
                    disabled={!selectedDate || !selectedTimeSlot || isLoading}
                    className="flex-1"
                  >
                    {isLoading ? 'Rescheduling...' : 'Confirm Reschedule'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/bookings')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>

                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                  <p><strong>Note:</strong> Rescheduling is free of charge. You will receive a confirmation email once your booking is updated. If you need to reschedule within 2 hours of your appointment, please call us directly.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}