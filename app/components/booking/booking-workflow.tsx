
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
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
  FileText,
  Phone,
  Crown,
  ArrowRight
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
  vehicleYear: z.string().optional(),
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

// Business hours configuration
const businessHours = {
  Monday: { open: '08:00', close: '18:00' },
  Tuesday: { open: '08:00', close: '18:00' },
  Wednesday: { open: '08:00', close: '18:00' },
  Thursday: { open: '08:00', close: '18:00' },
  Friday: { open: '08:00', close: '18:00' },
  Saturday: { open: '08:00', close: '17:00' },
  Sunday: { open: '09:00', close: '14:00' }
};

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
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [timeValidation, setTimeValidation] = useState<{
    isValid: boolean;
    message: string;
    suggestions?: any[];
    canCallDirect?: boolean;
  }>({ isValid: true, message: '' });

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

  // Fetch user profile and recommendations
  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.email) {
        try {
          // Fetch user profile with booking history
          const profileResponse = await fetch('/api/profile?include_bookings=true');
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setUserProfile(profileData);

            // Auto-populate form fields
            if (profileData.user) {
              const user = profileData.user;
              setValue('firstName', user.firstName || '');
              setValue('lastName', user.lastName || '');
              setValue('email', user.email || session.user.email);
              setValue('phone', user.phone || '');

              // Auto-populate with most recent vehicle if available
              if (profileData.vehicles && profileData.vehicles.length > 0) {
                const mostRecentVehicle = profileData.vehicles[0];
                setSelectedVehicle(mostRecentVehicle);
                setValue('plateNumber', mostRecentVehicle.licensePlate || '');
                setValue('vehicleMake', mostRecentVehicle.make || '');
                setValue('vehicleModel', mostRecentVehicle.model || '');
                setValue('vehicleYear', mostRecentVehicle.year?.toString() || '');
                setValue('vehicleColor', mostRecentVehicle.color || '');
              }
            }

            // Generate smart recommendations
            if (profileData.bookingHistory) {
              const smartRecommendations = generateRecommendations(profileData.bookingHistory);
              setRecommendations(smartRecommendations);

              // Auto-select most preferred service
              if (smartRecommendations.length > 0) {
                setValue('serviceType', smartRecommendations[0].serviceId);
              }
            }
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      }
      setLoadingProfile(false);
    };

    if (status !== 'loading') {
      fetchUserData();
    }
  }, [session, status, setValue]);

  // Smart recommendation algorithm
  const generateRecommendations = (bookingHistory: any[]) => {
    if (!bookingHistory.length) return [];

    // Analyze user patterns
    const serviceFrequency: Record<string, number> = {};
    const timeSlotPreferences: Record<string, number> = {};
    const addOnPreferences: Record<string, number> = {};
    const dayOfWeekPreferences: Record<number, number> = {};

    bookingHistory.forEach(booking => {
      // Service frequency
      const serviceName = booking.service?.name || '';
      serviceFrequency[serviceName] = (serviceFrequency[serviceName] || 0) + 1;

      // Time preferences
      if (booking.timeSlot) {
        timeSlotPreferences[booking.timeSlot] = (timeSlotPreferences[booking.timeSlot] || 0) + 1;
      }

      // Day of week preferences
      const bookingDay = new Date(booking.bookingDate).getDay();
      dayOfWeekPreferences[bookingDay] = (dayOfWeekPreferences[bookingDay] || 0) + 1;

      // Add-on preferences
      booking.addOns?.forEach((addOn: any) => {
        const addOnName = addOn.addOn?.name || '';
        addOnPreferences[addOnName] = (addOnPreferences[addOnName] || 0) + 1;
      });
    });

    // Calculate recency boost (recent bookings get higher weight)
    const now = new Date().getTime();
    const recentBookings = bookingHistory.filter(booking => {
      const bookingTime = new Date(booking.createdAt).getTime();
      return (now - bookingTime) < (90 * 24 * 60 * 60 * 1000); // Last 90 days
    });

    // Find most frequent service
    const topService = Object.entries(serviceFrequency)
      .sort(([,a], [,b]) => b - a)[0];

    const preferredTimeSlot = Object.entries(timeSlotPreferences)
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    const preferredDay = Object.entries(dayOfWeekPreferences)
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    const topAddOns = Object.entries(addOnPreferences)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([name]) => name);

    // Map service names to service IDs
    const serviceMapping = {
      'Express Exterior Wash': 'express',
      'Premium Wash & Wax': 'premium', 
      'Deluxe Interior & Exterior': 'deluxe',
      'Executive Detail Package': 'executive'
    };

    const recommendations = [];

    if (topService && topService[1] > 1) { // At least 2 bookings
      const serviceId = serviceMapping[topService[0] as keyof typeof serviceMapping] || 'express';
      
      recommendations.push({
        type: 'most_booked',
        title: 'Your Favorite Service',
        description: `You've booked this ${topService[1]} times`,
        serviceId,
        serviceName: topService[0],
        confidence: Math.min(95, 60 + (topService[1] * 10)),
        preferredTimeSlot,
        suggestedAddOns: topAddOns,
        preferredDay: parseInt(preferredDay || '0')
      });
    }

    // Suggest upgrade based on spending pattern
    const avgSpending = bookingHistory.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0) / bookingHistory.length;
    if (avgSpending > 12000) { // R120+ average
      recommendations.push({
        type: 'upgrade_suggestion',
        title: 'Consider Premium Service',
        description: 'Based on your spending, you might enjoy our premium services',
        serviceId: 'executive',
        serviceName: 'Executive Detail Package',
        confidence: 75
      });
    }

    // Seasonal recommendations (enhance later)
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 5 && currentMonth <= 7) { // Winter months
      recommendations.push({
        type: 'seasonal',
        title: 'Winter Special',
        description: 'Interior protection recommended for winter',
        serviceId: 'deluxe',
        serviceName: 'Deluxe Interior & Exterior',
        confidence: 60
      });
    }

    return recommendations;
  };

  // Handle vehicle selection from user's registered vehicles
  const selectVehicle = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setValue('plateNumber', vehicle.licensePlate || '');
    setValue('vehicleMake', vehicle.make || '');
    setValue('vehicleModel', vehicle.model || '');
    setValue('vehicleYear', vehicle.year?.toString() || '');
    setValue('vehicleColor', vehicle.color || '');
  };

  // Time validation logic
  const validateBookingTime = (date: Date, timeSlot: string, serviceId: string, isPremiumMember: boolean = false) => {
    const selectedService = services.find(s => s.id === serviceId);
    if (!selectedService) return { isValid: true, message: '' };

    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const businessHour = businessHours[dayName as keyof typeof businessHours];
    
    if (!businessHour) return { isValid: false, message: 'Business closed on selected day' };

    // Parse times
    const [startHour, startMinute] = timeSlot.split(':').map(Number);
    const [closeHour, closeMinute] = businessHour.close.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute; // Convert to minutes
    const closeTime = closeHour * 60 + closeMinute;
    const serviceDuration = selectedService.duration;
    const endTime = startTime + serviceDuration;

    if (endTime > closeTime) {
      // Service would run past closing time
      const timeDifference = endTime - closeTime;
      
      // Find alternative services that would fit
      const suggestions = services.filter(s => 
        s.id !== serviceId && 
        (startTime + s.duration) <= closeTime
      ).sort((a, b) => b.duration - a.duration); // Longest first

      const validation: any = {
        isValid: false,
        message: `Service would end ${timeDifference} minutes after closing time (${businessHour.close})`,
        suggestions,
        canCallDirect: isPremiumMember
      };

      return validation;
    }

    return { isValid: true, message: '' };
  };

  // Check membership status
  const isPremiumMember = userProfile?.user?.membership?.plan === 'PREMIUM';

  // Watch for changes in date, time, or service selection to validate
  const watchedDate = watch('preferredDate');
  const watchedTime = watch('preferredTime');
  const watchedService = watch('serviceType');

  useEffect(() => {
    if (watchedDate && watchedTime && watchedService) {
      const date = new Date(watchedDate);
      const validation = validateBookingTime(date, watchedTime, watchedService, isPremiumMember);
      setTimeValidation(validation);
    } else {
      setTimeValidation({ isValid: true, message: '' });
    }
  }, [watchedDate, watchedTime, watchedService, isPremiumMember]);

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
    // Prevent submission if time validation fails
    if (!timeValidation.isValid) {
      await Swal.fire({
        icon: 'warning',
        title: 'Booking Time Issue',
        text: 'Please select a valid time or choose an alternative service that fits within business hours.',
        confirmButtonText: 'Ok',
        confirmButtonColor: '#F59E0B'
      });
      return;
    }

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
    // Vehicle year is now optional
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
                        readOnly={session?.user?.email ? true : false}
                        className={session?.user?.email ? "bg-gray-50 cursor-not-allowed" : ""}
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
                  {/* Registered Vehicles Selection */}
                  {userProfile?.vehicles && userProfile.vehicles.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Car className="w-4 h-4 text-blue-600" />
                        <Label className="text-blue-700 font-semibold">Your Registered Vehicles</Label>
                      </div>
                      <div className="grid gap-2 max-h-48 overflow-y-auto">
                        {userProfile.vehicles.map((vehicle: any, index: number) => (
                          <motion.div
                            key={vehicle.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              selectedVehicle?.id === vehicle.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => selectVehicle(vehicle)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                  {vehicle.licensePlate} - {vehicle.make} {vehicle.model}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {vehicle.year && `${vehicle.year} • `}{vehicle.color}
                                </div>
                              </div>
                              {selectedVehicle?.id === vehicle.id && (
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        💡 Click on a vehicle to auto-fill the details below. You can modify any information as needed.
                      </div>
                    </div>
                  )}

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
                      <Label htmlFor="vehicleYear">Year (Optional)</Label>
                      <Input
                        id="vehicleYear"
                        {...register('vehicleYear')}
                        placeholder="e.g., 2020 (optional)"
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
                  {/* Smart Recommendations */}
                  {recommendations.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        <Label className="text-blue-700 font-semibold">✨ Smart Recommendations for You</Label>
                      </div>
                      <div className="grid gap-3">
                        {recommendations.slice(0, 2).map((rec, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-3 border rounded-lg cursor-pointer transition-all bg-gradient-to-r ${
                              rec.type === 'most_booked' ? 'from-green-50 to-green-100 border-green-200' :
                              rec.type === 'upgrade_suggestion' ? 'from-purple-50 to-purple-100 border-purple-200' :
                              'from-blue-50 to-blue-100 border-blue-200'
                            } hover:shadow-md`}
                            onClick={() => {
                              setValue('serviceType', rec.serviceId);
                              if (rec.preferredTimeSlot) {
                                setValue('preferredTime', rec.preferredTimeSlot);
                              }
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-semibold text-gray-900">{rec.title}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {rec.confidence}% match
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">{rec.description}</p>
                                <p className="text-xs font-medium text-gray-700 mt-1">{rec.serviceName}</p>
                              </div>
                              <CheckCircle className="w-4 h-4 text-green-600 opacity-60" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        💡 Based on your booking history and preferences. Click to auto-select.
                      </div>
                    </div>
                  )}

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

                  {/* Time Validation Alert */}
                  {!timeValidation.isValid && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 rounded-lg p-4"
                    >
                      <div className="flex items-center space-x-2 mb-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="font-semibold text-red-800">Booking Time Issue</span>
                      </div>
                      <p className="text-red-700 text-sm mb-4">{timeValidation.message}</p>
                      
                      {/* Alternative Service Suggestions */}
                      {timeValidation.suggestions && timeValidation.suggestions.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-red-800">Alternative Services Available:</h4>
                          <div className="grid gap-2">
                            {timeValidation.suggestions.map((suggestion) => (
                              <button
                                key={suggestion.id}
                                type="button"
                                onClick={() => {
                                  setValue('serviceType', suggestion.id);
                                }}
                                className="flex items-center justify-between p-3 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-all"
                              >
                                <div className="text-left">
                                  <div className="font-medium text-gray-900">{suggestion.name}</div>
                                  <div className="text-sm text-gray-600">{suggestion.duration} minutes • R{suggestion.price}</div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-red-600" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Premium Member Direct Call Option */}
                      {timeValidation.canCallDirect && (
                        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <Crown className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-blue-800">Premium Member Privilege</span>
                          </div>
                          <p className="text-blue-700 text-sm mb-2">
                            As a Premium member, you can call us directly to arrange special accommodation.
                          </p>
                          <a
                            href="tel:+27786132969"
                            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                            <span>Call +27 78 613 2969</span>
                          </a>
                        </div>
                      )}

                      {/* Next Business Day Option */}
                      <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-gray-800">Alternative: Next Business Day</span>
                        </div>
                        <p className="text-gray-700 text-sm">
                          You can also book this service for the next available business day when we have more time slots available.
                        </p>
                      </div>
                    </motion.div>
                  )}

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
                        <SelectItem value="cash">Pay at Location (Recommended)</SelectItem>
                        <SelectItem value="payfast">PayFast - Online Payment</SelectItem>
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
