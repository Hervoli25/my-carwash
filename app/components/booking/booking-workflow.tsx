
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Car,
  Calendar as CalendarIcon,
  Clock,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Mail,
  Smartphone,
  MapPin,
  User,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { SMSNotificationService } from '@/components/email/notification-system';
import { DataProcessingNotice } from '@/components/legal/data-processing-notice';

const bookingSchema = z.object({
  // Customer Information
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  
  // Vehicle Information
  plateNumber: z.string().min(3, 'Plate number is required for tracking').max(10, 'Plate number too long'),
  vehicleMake: z.string().min(2, 'Vehicle make is required'),
  vehicleModel: z.string().min(2, 'Vehicle model is required'),
  vehicleYear: z.string().min(4, 'Vehicle year is required'),
  vehicleColor: z.string().min(3, 'Vehicle color is required'),
  
  // Service Information
  serviceType: z.string().min(1, 'Please select a service'),
  addOns: z.array(z.string()).optional(),
  preferredDate: z.string().min(1, 'Please select a preferred date'),
  preferredTime: z.string().min(1, 'Please select a preferred time'),
  
  // Additional Information
  specialInstructions: z.string().optional(),
  membershipTier: z.string().optional(),
  paymentMethod: z.string().min(1, 'Please select a payment method'),
  
  // Agreements & Privacy
  termsAccepted: z.boolean().refine(val => val === true, 'Please accept the terms and conditions'),
  privacyAccepted: z.boolean().refine(val => val === true, 'Please accept the privacy policy and data processing'),
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  marketingConsent: z.boolean().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const services = [
  { id: 'express', name: 'Express Exterior Wash', price: 80, duration: 15 },
  { id: 'premium', name: 'Premium Wash & Wax', price: 150, duration: 30 },
  { id: 'deluxe', name: 'Deluxe Interior & Exterior', price: 200, duration: 60 },
  { id: 'executive', name: 'Executive Detail Package', price: 300, duration: 120 },
];

const addOns = [
  { id: 'tire-shine', name: 'Tire Shine', price: 25 },
  { id: 'air-freshener', name: 'Premium Air Freshener', price: 15 },
  { id: 'dashboard-treatment', name: 'Dashboard Treatment', price: 35 },
  { id: 'floor-mats', name: 'Floor Mat Deep Clean', price: 50 },
  { id: 'engine-bay', name: 'Engine Bay Cleaning', price: 75 },
];

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
];

export function BookingWorkflow() {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      emailNotifications: true,
      smsNotifications: true,
    }
  });

  const selectedService = watch('serviceType');
  const selectedAddOns = watch('addOns') || [];

  // Calculate total price
  useEffect(() => {
    let price = 0;
    if (selectedService) {
      const service = services.find(s => s.id === selectedService);
      if (service) price += service.price;
    }
    
    selectedAddOns.forEach(addOnId => {
      const addOn = addOns.find(a => a.id === addOnId);
      if (addOn) price += addOn.price;
    });
    
    setTotalPrice(price);
  }, [selectedService, selectedAddOns]);

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);

    try {
      // Prepare booking data for API
      const selectedServiceData = services.find(s => s.id === data.serviceType);
      const bookingData = {
        ...data,
        totalPrice: totalPrice,
        serviceType: selectedServiceData?.name || 'Selected Service'
      };

      // Save booking to database
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      const result = await response.json();

      // Prepare notification data
      const notificationData = {
        customerName: `${data.firstName} ${data.lastName}`,
        customerEmail: data.email,
        plateNumber: data.plateNumber,
        serviceType: selectedServiceData?.name || 'Selected Service',
        appointmentDate: new Date(data.preferredDate).toLocaleDateString(),
        appointmentTime: data.preferredTime,
        totalPrice: totalPrice,
        vehicleInfo: `${data.vehicleMake} ${data.vehicleModel} ${data.vehicleYear} (${data.vehicleColor})`,
        specialInstructions: data.specialInstructions
      };

      // Send email notifications
      let emailResult = { success: false };
      try {
        const emailResponse = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'booking_confirmation',
            data: notificationData
          }),
        });

        emailResult = await emailResponse.json();
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
      }

      // Send SMS notification if opted in
      if (data.smsNotifications) {
        try {
          await SMSNotificationService.sendBookingConfirmation(data.phone, notificationData);
        } catch (smsError) {
          console.error('SMS notification failed:', smsError);
        }
      }

      // Show success message with SweetAlert2
      await Swal.fire({
        icon: 'success',
        title: 'Booking Confirmed!',
        html: `
          <div class="text-left">
            <p><strong>Booking ID:</strong> ${result.booking.id.slice(-8).toUpperCase()}</p>
            <p><strong>Service:</strong> ${selectedServiceData?.name}</p>
            <p><strong>Date & Time:</strong> ${notificationData.appointmentDate} at ${data.preferredTime}</p>
            <p><strong>Vehicle:</strong> ${data.plateNumber}</p>
            <p><strong>Total:</strong> R${totalPrice}</p>
            <br>
            <p class="text-sm text-gray-600">
              Your booking has been saved to our system.
              ${emailResult.success
                ? 'Confirmation emails have been sent to you and our team.'
                : 'Email notifications may have failed, but your booking is confirmed.'}
            </p>
          </div>
        `,
        confirmButtonText: 'Great!',
        confirmButtonColor: '#3B82F6',
        timer: 10000,
        timerProgressBar: true
      });

      // Log booking for admin dashboard
      console.log('📋 NEW BOOKING SAVED TO DATABASE:', {
        id: result.booking.id,
        customer: notificationData.customerName,
        email: data.email,
        phone: data.phone,
        vehicle: result.booking.vehicle,
        plate: data.plateNumber,
        service: result.booking.service,
        date: notificationData.appointmentDate,
        time: result.booking.timeSlot,
        price: result.booking.totalAmount,
        status: result.booking.status,
        payment: data.paymentMethod,
        timestamp: new Date().toISOString()
      });

      setBookingConfirmed(true);

      // Reset form for next booking
      setTimeout(() => {
        setStep(1);
        setBookingConfirmed(false);
      }, 6000);

    } catch (error) {
      // Show error message with SweetAlert2
      await Swal.fire({
        icon: 'error',
        title: 'Booking Failed',
        text: 'We encountered an issue while processing your booking. Please check your information and try again.',
        confirmButtonText: 'Try Again',
        confirmButtonColor: '#EF4444'
      });
      console.error('Booking error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = (errors: any) => {
    // Show user-friendly validation errors with SweetAlert2
    const errorMessages = [];

    if (errors.firstName) errorMessages.push('Please enter your first name');
    if (errors.lastName) errorMessages.push('Please enter your last name');
    if (errors.email) errorMessages.push('Please enter a valid email address');
    if (errors.phone) errorMessages.push('Please enter a valid phone number');
    if (errors.plateNumber) errorMessages.push('License plate number is required for vehicle tracking');
    if (errors.vehicleMake) errorMessages.push('Please enter your vehicle make');
    if (errors.vehicleModel) errorMessages.push('Please enter your vehicle model');
    if (errors.vehicleYear) errorMessages.push('Please enter your vehicle year');
    if (errors.vehicleColor) errorMessages.push('Please enter your vehicle color');
    if (errors.serviceType) errorMessages.push('Please select a service');
    if (errors.preferredDate) errorMessages.push('Please select your preferred date');
    if (errors.preferredTime) errorMessages.push('Please select your preferred time');
    if (errors.paymentMethod) errorMessages.push('Please select a payment method');
    if (errors.termsAccepted) errorMessages.push('Please accept the Terms of Service');
    if (errors.privacyAccepted) errorMessages.push('Please accept the Privacy Policy and data processing consent');

    if (errorMessages.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Please Complete Required Fields',
        html: `
          <div class="text-left">
            <ul class="list-disc list-inside space-y-1">
              ${errorMessages.map(msg => `<li>${msg}</li>`).join('')}
            </ul>
          </div>
        `,
        confirmButtonText: 'Got it',
        confirmButtonColor: '#F59E0B'
      });
    }
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  if (bookingConfirmed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto p-6"
      >
        <Card className="text-center bg-green-50 border-green-200">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Booking Confirmed!</CardTitle>
            <CardDescription className="text-green-700">
              Your car wash has been successfully booked
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-700">
                📧 Confirmation email sent to your email address<br/>
                📱 SMS notification will be sent before your appointment<br/>
                👨‍💼 Admin has been notified of your booking
              </p>
            </div>
            <p className="text-sm text-green-600">
              You'll receive reminders and updates about your appointment.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3, 4].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <motion.div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                stepNumber <= step
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
              animate={{ scale: stepNumber === step ? 1.1 : 1 }}
              transition={{ duration: 0.2 }}
            >
              {stepNumber < step ? <CheckCircle className="w-5 h-5" /> : stepNumber}
            </motion.div>
            {stepNumber < 4 && (
              <div className={`w-12 h-1 mx-2 ${stepNumber < step ? 'bg-blue-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Customer Information */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-6 h-6 text-blue-600" />
                    <span>Customer Information</span>
                  </CardTitle>
                  <CardDescription>
                    Please provide your contact details for booking confirmation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        {...register('firstName')}
                        placeholder="Enter your first name"
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-sm">{errors.firstName.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        {...register('lastName')}
                        placeholder="Enter your last name"
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-sm">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="your.email@example.com"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm">{errors.email.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        {...register('phone')}
                        placeholder="+27 123 456 7890"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Vehicle Information */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Car className="w-6 h-6 text-blue-600" />
                    <span>Vehicle Information</span>
                  </CardTitle>
                  <CardDescription>
                    Plate number is mandatory for tracking and service quality assurance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <p className="text-yellow-800 font-medium">Plate Number Required</p>
                    </div>
                    <p className="text-yellow-700 text-sm mt-1">
                      We require your plate number for tracking purposes, service quality assurance, and to maintain our service records.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="plateNumber">License Plate Number *</Label>
                    <Input
                      id="plateNumber"
                      {...register('plateNumber')}
                      placeholder="e.g., CA 123-456"
                      className="font-mono text-lg"
                    />
                    {errors.plateNumber && (
                      <p className="text-red-500 text-sm">{errors.plateNumber.message}</p>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicleMake">Make *</Label>
                      <Input
                        id="vehicleMake"
                        {...register('vehicleMake')}
                        placeholder="e.g., Toyota"
                      />
                      {errors.vehicleMake && (
                        <p className="text-red-500 text-sm">{errors.vehicleMake.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="vehicleModel">Model *</Label>
                      <Input
                        id="vehicleModel"
                        {...register('vehicleModel')}
                        placeholder="e.g., Camry"
                      />
                      {errors.vehicleModel && (
                        <p className="text-red-500 text-sm">{errors.vehicleModel.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="vehicleYear">Year *</Label>
                      <Input
                        id="vehicleYear"
                        {...register('vehicleYear')}
                        placeholder="e.g., 2020"
                        maxLength={4}
                      />
                      {errors.vehicleYear && (
                        <p className="text-red-500 text-sm">{errors.vehicleYear.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vehicleColor">Color *</Label>
                    <Input
                      id="vehicleColor"
                      {...register('vehicleColor')}
                      placeholder="e.g., Silver"
                    />
                    {errors.vehicleColor && (
                      <p className="text-red-500 text-sm">{errors.vehicleColor.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Service Selection */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Car className="w-6 h-6 text-blue-600" />
                    <span>Service Selection</span>
                  </CardTitle>
                  <CardDescription>
                    Choose your service package and preferred appointment time
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Service Selection */}
                  <div className="space-y-4">
                    <Label>Service Package *</Label>
                    <div className="grid md:grid-cols-2 gap-4">
                      {services.map((service) => (
                        <motion.div
                          key={service.id}
                          whileHover={{ scale: 1.02 }}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedService === service.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setValue('serviceType', service.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{service.name}</h4>
                            <Badge>R{service.price}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{service.duration} minutes</p>
                        </motion.div>
                      ))}
                    </div>
                    {errors.serviceType && (
                      <p className="text-red-500 text-sm">{errors.serviceType.message}</p>
                    )}
                  </div>

                  {/* Add-ons */}
                  <div className="space-y-4">
                    <Label>Add-on Services (Optional)</Label>
                    <div className="grid md:grid-cols-2 gap-2">
                      {addOns.map((addOn) => (
                        <label
                          key={addOn.id}
                          className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                          <Checkbox
                            checked={selectedAddOns.includes(addOn.id)}
                            onCheckedChange={(checked: boolean) => {
                              if (checked) {
                                setValue('addOns', [...selectedAddOns, addOn.id]);
                              } else {
                                setValue('addOns', selectedAddOns.filter((id: string) => id !== addOn.id));
                              }
                            }}
                          />
                          <span className="flex-1">{addOn.name}</span>
                          <Badge variant="outline">R{addOn.price}</Badge>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Date and Time Selection */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Preferred Date *</Label>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          setValue('preferredDate', date?.toISOString() || '');
                        }}
                        disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
                        className="rounded-md border"
                      />
                      {errors.preferredDate && (
                        <p className="text-red-500 text-sm">{errors.preferredDate.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="preferredTime">Preferred Time *</Label>
                      <Select onValueChange={(value) => setValue('preferredTime', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.preferredTime && (
                        <p className="text-red-500 text-sm">{errors.preferredTime.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div className="space-y-2">
                    <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                    <Textarea
                      id="specialInstructions"
                      {...register('specialInstructions')}
                      placeholder="Any special requests or instructions for our team..."
                      rows={3}
                    />
                  </div>

                  {/* Total Price */}
                  {totalPrice > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-blue-800">Total Price:</span>
                        <span className="text-2xl font-bold text-blue-600">R{totalPrice}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Payment and Confirmation */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                    <span>Payment & Confirmation</span>
                  </CardTitle>
                  <CardDescription>
                    Choose payment method and confirm your booking
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Payment Method */}
                  <div className="space-y-4">
                    <Label>Payment Method *</Label>
                    <Select onValueChange={(value) => setValue('paymentMethod', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="payfast">PayFast</SelectItem>
                        <SelectItem value="cash">Pay at Location</SelectItem>
                        <SelectItem value="eft">Bank Transfer (EFT)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.paymentMethod && (
                      <p className="text-red-500 text-sm">{errors.paymentMethod.message}</p>
                    )}
                  </div>

                  {/* Notification Preferences */}
                  <div className="space-y-4">
                    <Label>Notification Preferences</Label>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <Checkbox
                          checked={watch('emailNotifications')}
                          onCheckedChange={(checked) => setValue('emailNotifications', !!checked)}
                        />
                        <Mail className="w-4 h-4 text-gray-600" />
                        <span>Email notifications (booking confirmations, reminders)</span>
                      </label>

                      <label className="flex items-center space-x-3">
                        <Checkbox
                          checked={watch('smsNotifications')}
                          onCheckedChange={(checked) => setValue('smsNotifications', !!checked)}
                        />
                        <Smartphone className="w-4 h-4 text-gray-600" />
                        <span>SMS notifications (appointment reminders)</span>
                      </label>
                    </div>
                  </div>

                  {/* Data Processing Notice */}
                  <DataProcessingNotice compact={true} />

                  {/* Legal Agreements */}
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-medium text-gray-900">Required Agreements</h4>
                    
                    <label className="flex items-start space-x-3">
                      <Checkbox
                        checked={watch('termsAccepted')}
                        onCheckedChange={(checked) => setValue('termsAccepted', !!checked)}
                        className="mt-1"
                      />
                      <div className="space-y-1">
                        <span className="text-sm">
                          I accept the <a href="/terms-of-service" target="_blank" className="text-blue-600 hover:underline">Terms of Service</a> *
                        </span>
                        {errors.termsAccepted && (
                          <p className="text-red-500 text-sm">{errors.termsAccepted.message}</p>
                        )}
                      </div>
                    </label>

                    <label className="flex items-start space-x-3">
                      <Checkbox
                        checked={watch('privacyAccepted')}
                        onCheckedChange={(checked) => setValue('privacyAccepted', !!checked)}
                        className="mt-1"
                      />
                      <div className="space-y-1">
                        <span className="text-sm">
                          I consent to the processing of my personal data as described in the{' '}
                          <a href="/privacy-policy" target="_blank" className="text-blue-600 hover:underline">Privacy Policy</a>.{' '}
                          License plate information is mandatory for vehicle tracking. *
                        </span>
                        {errors.privacyAccepted && (
                          <p className="text-red-500 text-sm">{errors.privacyAccepted.message}</p>
                        )}
                      </div>
                    </label>

                    <label className="flex items-start space-x-3">
                      <Checkbox
                        checked={watch('marketingConsent')}
                        onCheckedChange={(checked) => setValue('marketingConsent', !!checked)}
                        className="mt-1"
                      />
                      <div className="space-y-1">
                        <span className="text-sm">
                          I consent to receive marketing communications, promotional offers, and membership rewards updates (optional)
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Booking Summary */}
                  <div className="bg-gray-50 border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Booking Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Service:</span>
                        <span>{services.find(s => s.id === selectedService)?.name || 'Not selected'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Price:</span>
                        <span className="font-semibold">R{totalPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date & Time:</span>
                        <span>{selectedDate?.toDateString()} at {watch('preferredTime')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
          >
            Previous
          </Button>
          
          {step < 4 ? (
            <Button type="button" onClick={nextStep}>
              Next Step
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Confirming Booking...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Booking
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
