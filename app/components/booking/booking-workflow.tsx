
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
import { useLanguage } from '@/lib/i18n/use-language';

// Move bookingSchema creation inside component to access translations
const createBookingSchema = (t: (key: string) => string) => z.object({
  // Customer Information
  firstName: z.string().min(2, t('booking.validation.required')),
  lastName: z.string().min(2, t('booking.validation.required')),
  email: z.string().email(t('booking.validation.email')),
  phone: z.string().min(10, t('booking.validation.phone')),
  
  // Vehicle Information
  plateNumber: z.string().min(3, t('booking.validation.plateRequired')).max(10, 'Plate number too long'),
  vehicleMake: z.string().min(2, t('booking.validation.required')),
  vehicleModel: z.string().min(2, t('booking.validation.required')),
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

type BookingFormData = z.infer<ReturnType<typeof createBookingSchema>>;

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

// Holiday and special dates configuration for South Africa
const holidayDates = {
  // 2024 South African Public Holidays
  '2024-01-01': { closed: true, name: 'New Year\'s Day' },
  '2024-03-21': { closed: true, name: 'Human Rights Day' },
  '2024-03-29': { closed: true, name: 'Good Friday' },
  '2024-04-01': { closed: true, name: 'Family Day' },
  '2024-04-27': { closed: true, name: 'Freedom Day' },
  '2024-05-01': { closed: true, name: 'Workers\' Day' },
  '2024-06-16': { closed: true, name: 'Youth Day' },
  '2024-08-09': { closed: true, name: 'National Women\'s Day' },
  '2024-09-24': { closed: true, name: 'Heritage Day' },
  '2024-12-16': { closed: true, name: 'Day of Reconciliation' },
  '2024-12-25': { closed: true, name: 'Christmas Day' },
  '2024-12-26': { closed: true, name: 'Day of Goodwill' },
  
  // 2025 South African Public Holidays
  '2025-01-01': { closed: true, name: 'New Year\'s Day' },
  '2025-03-21': { closed: true, name: 'Human Rights Day' },
  '2025-04-18': { closed: true, name: 'Good Friday' },
  '2025-04-21': { closed: true, name: 'Family Day' },
  '2025-04-27': { closed: true, name: 'Freedom Day' },
  '2025-05-01': { closed: true, name: 'Workers\' Day' },
  '2025-06-16': { closed: true, name: 'Youth Day' },
  '2025-08-09': { closed: true, name: 'National Women\'s Day' },
  '2025-09-24': { closed: true, name: 'Heritage Day' },
  '2025-12-16': { closed: true, name: 'Day of Reconciliation' },
  '2025-12-25': { closed: true, name: 'Christmas Day' },
  '2025-12-26': { closed: true, name: 'Day of Goodwill' },
  
  // Special business dates (early closing, etc.)
  '2024-12-24': { 
    open: '08:00', 
    close: '14:00', 
    name: 'Christmas Eve (Early Close)',
    specialMessage: 'Early closing for Christmas preparations'
  },
  '2024-12-31': { 
    open: '08:00', 
    close: '14:00', 
    name: 'New Year\'s Eve (Early Close)',
    specialMessage: 'Early closing for New Year preparations'
  },
  '2025-12-24': { 
    open: '08:00', 
    close: '14:00', 
    name: 'Christmas Eve (Early Close)',
    specialMessage: 'Early closing for Christmas preparations'
  },
  '2025-12-31': { 
    open: '08:00', 
    close: '14:00', 
    name: 'New Year\'s Eve (Early Close)',
    specialMessage: 'Early closing for New Year preparations'
  }
};

// Realistic capacity configuration - 3-5 cars per slot based on service complexity
const capacityConfig = {
  // Base capacity per time slot
  normalCapacity: 5,    // Normal hours: 5 cars max
  peakCapacity: 3,      // Peak hours: 3 cars max (more complex coordination needed)
  
  // Service-based capacity adjustments
  serviceCapacityLimits: {
    express: 5,     // Quick service - can handle more
    premium: 4,     // Medium complexity
    deluxe: 3,      // Complex service - needs more attention
    executive: 2    // Premium service - maximum care and attention
  },
  
  // Time slot interval (30 minutes)
  slotIntervalMinutes: 30,
  
  // Buffer time between services (staggered start times)
  bufferMinutes: 5,
  
  // Peak hours when operations are more complex
  peakHours: ['12:00', '12:30', '13:00', '13:30'],
  
  // Mixed service penalty (when slot has different service types)
  mixedServicePenalty: 1, // Reduce capacity by 1 when mixing service types
  
  // Same service bonus (when all bookings are same service type)  
  sameServiceBonus: 1     // Add 1 to capacity when all same service
};

export function BookingWorkflow() {
  const { t } = useLanguage();
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
    nextAvailableDay?: Date;
    strictPolicy?: boolean;
    alternativeMessage?: string;
  }>({ isValid: true, message: '' });
  const [slotAvailability, setSlotAvailability] = useState<{[key: string]: {
    available: boolean;
    remainingCapacity: number;
    totalCapacity: number;
    bookingCount: number;
    isPeakHour?: boolean;
    message?: string;
    nextAvailableSlot?: string;
    nextAvailableDay?: Date;
  }}>({});
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);

  // Color coding function for capacity indicators
  const getCapacityColorClass = (remainingCapacity: number): string => {
    if (remainingCapacity === 5) {
      return 'bg-green-100 border-green-300 text-green-800'; // Full capacity - bright green
    } else if (remainingCapacity === 4) {
      return 'bg-green-50 border-green-200 text-green-700'; // Good capacity - light green  
    } else if (remainingCapacity === 3) {
      return 'bg-orange-50 border-orange-200 text-orange-700'; // Medium capacity - orange
    } else if (remainingCapacity === 2) {
      return 'bg-red-50 border-red-200 text-red-700'; // Low capacity - light red
    } else if (remainingCapacity === 1) {
      return 'bg-red-100 border-red-300 text-red-800'; // Very low - red
    } else {
      return 'bg-gray-100 border-gray-300 text-gray-500'; // Full/disabled - gray
    }
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(createBookingSchema(t)),
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

  // Enhanced time validation logic - STRICT business hours enforcement
  const validateBookingTime = (date: Date, timeSlot: string, serviceId: string) => {
    const selectedService = services.find(s => s.id === serviceId);
    if (!selectedService) return { isValid: true, message: '' };

    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const businessHour = businessHours[dayName as keyof typeof businessHours];
    
    if (!businessHour) return { 
      isValid: false, 
      message: 'Business closed on selected day',
      nextAvailableDay: getNextBusinessDay(date)
    };

    // Parse times
    const [startHour, startMinute] = timeSlot.split(':').map(Number);
    const [closeHour, closeMinute] = businessHour.close.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute; // Convert to minutes
    const closeTime = closeHour * 60 + closeMinute;
    const serviceDuration = selectedService.duration;
    const endTime = startTime + serviceDuration;

    // STRICT ENFORCEMENT: No exceptions for premium members or weekends
    if (endTime > closeTime) {
      // Service would run past closing time
      const timeDifference = endTime - closeTime;
      
      // Find alternative services that would fit TODAY
      const suggestions = services.filter(s => 
        s.id !== serviceId && 
        (startTime + s.duration) <= closeTime
      ).sort((a, b) => b.duration - a.duration); // Longest first

      // Special message for Sunday (staff rest priority)
      let staffRestMessage = '';
      if (dayName === 'Sunday') {
        staffRestMessage = ' Our staff need proper rest time to provide excellent service tomorrow.';
      }

      const validation: any = {
        isValid: false,
        message: `Service would end ${timeDifference} minutes after closing time (${businessHour.close}).${staffRestMessage}`,
        suggestions,
        nextAvailableDay: getNextBusinessDay(date),
        // Removed: canCallDirect - NO EXCEPTIONS
        strictPolicy: true,
        alternativeMessage: suggestions.length === 0 
          ? 'No alternative services available today. Please book for the next business day.'
          : 'Alternative services available today, or book for the next business day.'
      };

      return validation;
    }

    return { isValid: true, message: '' };
  };

  // Helper function to get next business day
  const getNextBusinessDay = (currentDate: Date): Date => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // Skip weekends if needed and find next open day
    while (nextDay.getDay() === 0 && nextDay.getHours() >= 14) { // Skip late Sunday
      nextDay.setDate(nextDay.getDate() + 1);
    }
    
    return nextDay;
  };

  // DYNAMIC CAPACITY MANAGEMENT SYSTEM
  
  // Check if a date is a holiday or special date
  const checkHolidayStatus = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const holiday = holidayDates[dateStr as keyof typeof holidayDates];
    
    if (!holiday) return { isHoliday: false };
    
    if ('closed' in holiday && holiday.closed) {
      return {
        isHoliday: true,
        isClosed: true,
        name: holiday.name,
        message: `We are closed on ${holiday.name}`
      };
    }
    
    // Special hours (like early closing)
    return {
      isHoliday: true,
      isClosed: false,
      name: holiday.name,
      specialHours: 'open' in holiday ? { open: holiday.open, close: holiday.close } : undefined,
      message: 'specialMessage' in holiday ? holiday.specialMessage : `Special holiday: ${holiday.name}`
    };
  };

  // Generate available time slots for a specific date and service (with same-day booking intelligence)
  const generateTimeSlots = (date: Date, serviceId: string) => {
    const selectedService = services.find(s => s.id === serviceId);
    if (!selectedService) return [];

    // Check for holidays first
    const holidayStatus = checkHolidayStatus(date);
    if (holidayStatus.isClosed) {
      return []; // No slots available on closed holidays
    }

    // Get business hours (either normal or special holiday hours)
    let businessHour;
    if (holidayStatus.isHoliday && holidayStatus.specialHours) {
      // Use special holiday hours
      businessHour = {
        open: holidayStatus.specialHours.open,
        close: holidayStatus.specialHours.close
      };
    } else {
      // Use normal business hours
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      businessHour = businessHours[dayName as keyof typeof businessHours];
    }
    
    if (!businessHour) return [];

    const slots = [];
    const [openHour, openMinute] = businessHour.open.split(':').map(Number);
    const [closeHour, closeMinute] = businessHour.close.split(':').map(Number);
    
    let startTime = openHour * 60 + openMinute;
    const closeTime = closeHour * 60 + closeMinute;
    const serviceDuration = selectedService.duration;
    
    // For same-day bookings, adjust start time to current time + buffer
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const bufferTime = 30; // 30-minute minimum buffer for same-day bookings
      const earliestSlot = currentTime + bufferTime;
      
      // Round up to next 30-minute interval
      const roundedEarliestSlot = Math.ceil(earliestSlot / 30) * 30;
      
      // Use the later of: business opening time or current time + buffer
      startTime = Math.max(startTime, roundedEarliestSlot);
    }
    
    // Generate 30-minute intervals that allow service to complete before closing
    for (let time = startTime; time + serviceDuration <= closeTime; time += 30) {
      const hours = Math.floor(time / 60);
      const minutes = time % 60;
      const timeSlot = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      slots.push(timeSlot);
    }
    
    return slots;
  };

  // Smart capacity checking based on service complexity and operational reality
  const checkSlotCapacity = async (date: Date, timeSlot: string, requestedServiceId?: string) => {
    try {
      // Get existing bookings for this date and time slot (excluding cancelled bookings)
      const dateStr = date.toISOString().split('T')[0];
      const cacheBuster = Date.now(); // Prevent caching issues
      const response = await fetch(`/api/bookings/availability?date=${dateStr}&timeSlot=${timeSlot}&includeServices=true&_t=${cacheBuster}`);
      
      if (!response.ok) {
        console.error('Failed to fetch availability data');
        return { 
          available: true, 
          remainingCapacity: capacityConfig.normalCapacity, 
          totalCapacity: capacityConfig.normalCapacity, 
          bookingCount: 0 
        };
      }
      
      const availabilityData = await response.json();
      const activeBookings = availabilityData.bookingCount || 0;
      const existingServices = availabilityData.services || [];

      // Debug logging for capacity issues
      console.log('🔍 CAPACITY CHECK:', {
        timeSlot,
        activeBookings,
        existingServices,
        requestedServiceId,
        timestamp: new Date().toISOString()
      });
      
      // Calculate smart capacity based on multiple factors
      let totalCapacity = capacityConfig.normalCapacity; // Start with base capacity
      
      // 1. Peak hour adjustment
      const isPeakHour = capacityConfig.peakHours.includes(timeSlot);
      if (isPeakHour) {
        totalCapacity = capacityConfig.peakCapacity;
      }
      
      // 2. Service complexity adjustment
      if (requestedServiceId) {
        const serviceLimit = capacityConfig.serviceCapacityLimits[requestedServiceId as keyof typeof capacityConfig.serviceCapacityLimits];
        if (serviceLimit && serviceLimit < totalCapacity) {
          totalCapacity = serviceLimit;
        }
      }
      
      // 3. Mixed service penalty/bonus
      if (existingServices.length > 0) {
        const uniqueServices = new Set(existingServices);
        
        if (requestedServiceId && !uniqueServices.has(requestedServiceId)) {
          // Adding a different service type - apply penalty
          totalCapacity = Math.max(2, totalCapacity - capacityConfig.mixedServicePenalty);
        } else if (uniqueServices.size === 1 && requestedServiceId === Array.from(uniqueServices)[0]) {
          // All same service type - apply bonus
          totalCapacity = Math.min(6, totalCapacity + capacityConfig.sameServiceBonus);
        }
      }
      
      const remainingCapacity = Math.max(0, totalCapacity - activeBookings);
      const available = remainingCapacity > 0;
      
      // Calculate operational complexity score
      const complexityScore = calculateComplexityScore(existingServices, requestedServiceId);
      
      return {
        available,
        remainingCapacity,
        totalCapacity,
        bookingCount: activeBookings,
        isPeakHour,
        complexityScore,
        existingServices,
        capacityReason: getCapacityReason(isPeakHour, existingServices, requestedServiceId),
        capacityRange: `${capacityConfig.peakCapacity}-${capacityConfig.normalCapacity} cars per slot`
      };
      
    } catch (error) {
      console.error('Error checking slot capacity:', error);
      // Fallback to conservative capacity
      return { 
        available: true, 
        remainingCapacity: 3, 
        totalCapacity: 3, 
        bookingCount: 0 
      };
    }
  };

  // Calculate operational complexity score
  const calculateComplexityScore = (existingServices: string[], newService?: string): number => {
    const allServices = newService ? [...existingServices, newService] : existingServices;
    const serviceComplexity = {
      express: 1,
      premium: 2, 
      deluxe: 3,
      executive: 4
    };
    
    const totalComplexity = allServices.reduce((sum, service) => {
      return sum + (serviceComplexity[service as keyof typeof serviceComplexity] || 2);
    }, 0);
    
    return Math.round(totalComplexity / Math.max(1, allServices.length));
  };

  // Get capacity reasoning for user feedback
  const getCapacityReason = (isPeakHour: boolean, existingServices: string[], newService?: string): string => {
    if (isPeakHour) return "Peak hour - reduced capacity for better service";
    if (existingServices.length === 0) return "Full capacity available";
    
    const uniqueServices = new Set(existingServices);
    if (newService && !uniqueServices.has(newService)) {
      return "Mixed services - capacity reduced for coordination";
    }
    if (uniqueServices.size === 1) {
      return "Same service batch - optimized capacity";
    }
    
    return "Standard capacity based on current bookings";
  };

  // Get all available time slots with capacity information
  const getAvailableTimeSlotsWithCapacity = async (date: Date, serviceId: string) => {
    if (!date || !serviceId) return;
    
    setLoadingSlots(true);
    const allSlots = generateTimeSlots(date, serviceId);
    const capacityPromises = allSlots.map(slot => checkSlotCapacity(date, slot, serviceId));
    
    try {
      const capacityResults = await Promise.all(capacityPromises);
      const slotCapacityMap: {[key: string]: any} = {};
      const availableSlots: string[] = [];
      
      allSlots.forEach((slot, index) => {
        const capacity = capacityResults[index];
        slotCapacityMap[slot] = capacity;
        
        if (capacity.available) {
          availableSlots.push(slot);
        }
      });
      
      setSlotAvailability(slotCapacityMap);
      setAvailableTimeSlots(availableSlots);
      
      // Find next available slot if current selection is full
      if (availableSlots.length === 0) {
        const nextDay = getNextBusinessDay(date);
        const nextDaySlots = generateTimeSlots(nextDay, serviceId);
        if (nextDaySlots.length > 0) {
          slotCapacityMap['nextDay'] = {
            available: true,
            nextAvailableDay: nextDay,
            nextAvailableSlot: nextDaySlots[0],
            message: `All slots full for ${date.toDateString()}. Next available: ${nextDay.toDateString()} at ${nextDaySlots[0]}`
          };
        }
      }
      
    } catch (error) {
      console.error('Error fetching slot availability:', error);
      // Fallback to showing all generated slots
      setAvailableTimeSlots(allSlots);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Find next available slot across multiple days
  const findNextAvailableSlot = async (startDate: Date, serviceId: string, maxDaysToCheck: number = 7) => {
    for (let i = 0; i < maxDaysToCheck; i++) {
      const checkDate = new Date(startDate);
      checkDate.setDate(startDate.getDate() + i);
      
      // Skip if it's not a business day
      const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'long' });
      if (!businessHours[dayName as keyof typeof businessHours]) continue;
      
      const slots = generateTimeSlots(checkDate, serviceId);
      
      for (const slot of slots) {
        const capacity = await checkSlotCapacity(checkDate, slot, serviceId);
        if (capacity.available) {
          return {
            date: checkDate,
            timeSlot: slot,
            capacity: capacity
          };
        }
      }
    }
    
    return null; // No availability found in the checked period
  };

  // Check membership status
  const isPremiumMember = userProfile?.user?.membership?.plan === 'PREMIUM';

  // Watch for changes in date, time, or service selection to validate
  const watchedDate = watch('preferredDate');
  const watchedTime = watch('preferredTime');
  const watchedService = watch('serviceType');

  // Update available slots when date or service changes
  useEffect(() => {
    if (selectedDate && watchedService) {
      getAvailableTimeSlotsWithCapacity(selectedDate, watchedService);
    }
  }, [selectedDate, watchedService]);

  // Add a manual refresh function for real-time updates
  const refreshSlotCapacity = async () => {
    if (selectedDate && watchedService) {
      await getAvailableTimeSlotsWithCapacity(selectedDate, watchedService);
    }
  };

  useEffect(() => {
    if (watchedDate && watchedTime && watchedService) {
      const date = new Date(watchedDate);
      const validation = validateBookingTime(date, watchedTime, watchedService);
      setTimeValidation(validation);
    } else {
      setTimeValidation({ isValid: true, message: '' });
    }
  }, [watchedDate, watchedTime, watchedService]);

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

      // Immediately refresh capacity to show updated availability
      if (selectedDate && selectedService) {
        // Force refresh with cache-busting parameter
        console.log('🔄 FORCE REFRESH: Updating capacity after booking creation');
        
        // Multiple refresh attempts with increasing delays to handle database lag
        const refreshAttempts = [500, 1000, 2000, 3000]; // Start with 500ms to ensure DB commit
        
        refreshAttempts.forEach((delay, index) => {
          setTimeout(async () => {
            console.log(`🔄 Refresh attempt ${index + 1} after ${delay}ms`);
            try {
              await getAvailableTimeSlotsWithCapacity(selectedDate, selectedService);
              console.log(`✅ Refresh attempt ${index + 1} completed`);
            } catch (error) {
              console.error(`❌ Refresh attempt ${index + 1} failed:`, error);
            }
          }, delay);
        });
      }

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

  // Authentication requirement check - MUST be logged in to book
  if (status !== 'loading' && !session) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto p-6"
      >
        <Card className="text-center bg-blue-50 border-blue-200">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-blue-800">Account Required</CardTitle>
            <CardDescription className="text-blue-700">
              Please sign in or create an account to make a booking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Save your vehicle information</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">View booking history and recommendations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Manage and modify bookings</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Earn loyalty points and rewards</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => window.location.href = '/auth/signin'} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/auth/register'}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                Create Account
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Already have an account? <a href="/auth/signin" className="text-blue-600 hover:underline">Sign in here</a>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

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
                        disabled={(date) => {
                          // Create today's date at midnight for proper comparison
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          
                          // Create selected date at midnight for comparison
                          const selectedDateMidnight = new Date(date);
                          selectedDateMidnight.setHours(0, 0, 0, 0);
                          
                          // Disable past dates (before today)
                          if (selectedDateMidnight < today) return true;
                          
                          // Check for holidays
                          const holidayStatus = checkHolidayStatus(date);
                          if (holidayStatus.isClosed) return true;
                          
                          return false;
                        }}
                        className="rounded-md border"
                      />
                      {errors.preferredDate && (
                        <p className="text-red-500 text-sm">{errors.preferredDate.message}</p>
                      )}
                      
                      {/* Holiday/Special Date Notification */}
                      {selectedDate && (() => {
                        const holidayStatus = checkHolidayStatus(selectedDate);
                        if (holidayStatus.isHoliday && !holidayStatus.isClosed) {
                          return (
                            <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <AlertCircle className="w-4 h-4 text-orange-600" />
                                <span className="font-medium text-orange-800 text-sm">{holidayStatus.name}</span>
                              </div>
                              <p className="text-orange-700 text-sm mt-1">
                                {holidayStatus.message}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="preferredTime">Preferred Time *</Label>
                      {loadingSlots ? (
                        <div className="flex items-center justify-center p-4 border rounded-md">
                          <motion.div
                            className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          <span className="text-sm text-gray-600">Loading available slots...</span>
                        </div>
                      ) : (
                        <>
                          <Select onValueChange={(value) => setValue('preferredTime', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select available time" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableTimeSlots.length > 0 ? (
                                availableTimeSlots.map((time) => {
                                  const slotInfo = slotAvailability[time];
                                  return (
                                    <SelectItem key={time} value={time}>
                                      <div className="flex items-center justify-between w-full">
                                        <span>{time}</span>
                                        <div className="flex items-center space-x-2 ml-4">
                                          {slotInfo?.isPeakHour && (
                                            <Badge variant="outline" className="text-xs bg-orange-50 border-orange-200 text-orange-700">
                                              Peak
                                            </Badge>
                                          )}
                                          <Badge 
                                            variant="outline" 
                                            className={`text-xs font-medium ${getCapacityColorClass(slotInfo?.remainingCapacity || 0)}`}
                                          >
                                            {slotInfo?.remainingCapacity || 0} left
                                          </Badge>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  );
                                })
                              ) : (
                                <div className="px-3 py-2 text-sm text-gray-500">
                                  No available slots for this date and service
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                          
                          {availableTimeSlots.length === 0 && slotAvailability['nextDay'] && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center space-x-2 mb-2">
                                <CalendarIcon className="w-4 h-4 text-blue-600" />
                                <span className="font-medium text-blue-800 text-sm">All Slots Full</span>
                              </div>
                              <p className="text-blue-700 text-sm mb-3">
                                {slotAvailability['nextDay'].message}
                              </p>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <Button
                                  type="button"
                                  onClick={() => {
                                    const nextDay = slotAvailability['nextDay'].nextAvailableDay;
                                    const nextSlot = slotAvailability['nextDay'].nextAvailableSlot;
                                    if (nextDay && nextSlot) {
                                      setSelectedDate(nextDay);
                                      setValue('preferredDate', nextDay.toISOString());
                                      setValue('preferredTime', nextSlot);
                                    }
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                                  size="sm"
                                >
                                  <CalendarIcon className="w-4 h-4 mr-2" />
                                  Book Next Available
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setShowWaitlist(true)}
                                  className="border-blue-200 text-blue-700 hover:bg-blue-50 text-sm"
                                  size="sm"
                                >
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Join Waitlist
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          {/* Same-day booking notification */}
                          {selectedDate && selectedDate.toDateString() === new Date().toDateString() && availableTimeSlots.length > 0 && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center space-x-2 mb-2">
                                <Clock className="w-4 h-4 text-blue-600" />
                                <span className="font-medium text-blue-800 text-sm">Same-Day Booking</span>
                              </div>
                              <p className="text-blue-700 text-sm">
                                Available times are automatically filtered to allow at least 30 minutes preparation time and ensure your service completes before closing.
                              </p>
                            </div>
                          )}

                          {/* Enhanced Capacity Information Display */}
                          {availableTimeSlots.length > 0 && (
                            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <Badge className="bg-green-100 text-green-800 text-xs">
                                    {availableTimeSlots.length} slots available
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    3-5 cars per slot
                                  </Badge>
                                  {selectedDate && selectedDate.toDateString() === new Date().toDateString() && (
                                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                                      Same-day
                                    </Badge>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={refreshSlotCapacity}
                                  className="h-6 px-2 text-xs"
                                  disabled={loadingSlots}
                                >
                                  {loadingSlots ? (
                                    <motion.div
                                      className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full"
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                  ) : (
                                    '🔄 Refresh'
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Service Complexity Notice */}
                          {selectedService && (
                            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="text-blue-700 text-xs">
                                <strong>{services.find(s => s.id === selectedService)?.name}:</strong>
                                {selectedService === 'express' && ' Quick service - higher slot capacity available'}
                                {selectedService === 'premium' && ' Standard service - good availability'}
                                {selectedService === 'deluxe' && ' Detailed service - limited slots for quality focus'}
                                {selectedService === 'executive' && ' Premium service - exclusive attention, very limited slots'}
                              </div>
                            </div>
                          )}
                        </>
                      )}
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

                      {/* Next Business Day Recommendation (Enhanced) */}
                      <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <CalendarIcon className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-green-800">Recommended: Next Business Day</span>
                        </div>
                        <p className="text-green-700 text-sm mb-3">
                          {timeValidation.nextAvailableDay && (
                            <>Book your service on {timeValidation.nextAvailableDay.toDateString()} when we have full availability for all services.</>
                          )}
                        </p>
                        <Button
                          type="button"
                          onClick={() => {
                            if (timeValidation.nextAvailableDay) {
                              setSelectedDate(timeValidation.nextAvailableDay);
                              setValue('preferredDate', timeValidation.nextAvailableDay.toISOString());
                            }
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white text-sm"
                          size="sm"
                        >
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          Book for Next Business Day
                        </Button>
                      </div>

                      {/* Staff Rest Policy Notice (for Sunday bookings) */}
                      {new Date(watchedDate || '').getDay() === 0 && (
                        <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertCircle className="w-5 h-5 text-orange-600" />
                            <span className="font-medium text-orange-800">Sunday Service Hours</span>
                          </div>
                          <p className="text-orange-700 text-sm">
                            We close early on Sundays (2:00 PM) to ensure our staff get proper rest for excellent service throughout the week. 
                            Consider booking for Monday when we're refreshed and ready to provide the best care for your vehicle!
                          </p>
                        </div>
                      )}

                      {/* Emergency Contact (Only for same-day urgent needs) */}
                      <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Phone className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-gray-800">For Urgent Same-Day Needs</span>
                        </div>
                        <p className="text-gray-700 text-sm mb-2">
                          If you have an emergency or urgent same-day requirement, you may call us. Please note: services outside business hours are subject to availability and additional charges.
                        </p>
                        <a
                          href="tel:+27786132969"
                          className="inline-flex items-center space-x-2 bg-gray-600 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Call +27 78 613 2969</span>
                        </a>
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
                    
                    {/* Reminder Schedule Information */}
                    {(watch('emailNotifications') || watch('smsNotifications')) && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-800 text-sm">Automated Reminder Schedule</span>
                        </div>
                        <div className="text-blue-700 text-sm space-y-1">
                          <p>• <strong>24 hours before:</strong> Appointment confirmation reminder</p>
                          <p>• <strong>2 hours before:</strong> "Get ready" reminder with location details</p>
                          <p>• <strong>30 minutes before:</strong> "Time to head out" final reminder</p>
                        </div>
                      </div>
                    )}
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

      {/* Waitlist Modal */}
      {showWaitlist && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowWaitlist(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Join Waitlist</h3>
              <button
                onClick={() => setShowWaitlist(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800 text-sm">Waitlist Benefits</span>
                </div>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>• Get notified if someone cancels their booking</li>
                  <li>• Priority booking for similar time slots</li>
                  <li>• Automatic notification via email and SMS</li>
                  <li>• No charge until you get a confirmed slot</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Date & Time
                  </label>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {selectedDate?.toDateString()} at {watch('preferredTime') || 'any available time'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service
                  </label>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {services.find(s => s.id === selectedService)?.name || 'Selected service'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alternative Times (Optional)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Morning (8AM-12PM)', 'Afternoon (12PM-4PM)', 'Evening (4PM-6PM)'].map((period) => (
                      <label key={period} className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <span className="text-xs text-gray-600">{period}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowWaitlist(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={async () => {
                    setWaitlistSubmitting(true);
                    try {
                      // Submit waitlist request
                      const waitlistData = {
                        customerName: `${watch('firstName')} ${watch('lastName')}`,
                        email: watch('email'),
                        phone: watch('phone'),
                        preferredDate: selectedDate?.toISOString(),
                        preferredTime: watch('preferredTime'),
                        serviceId: selectedService,
                        vehicleInfo: `${watch('vehicleMake')} ${watch('vehicleModel')} (${watch('plateNumber')})`
                      };

                      const response = await fetch('/api/waitlist', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(waitlistData),
                      });

                      if (response.ok) {
                        toast.success('You\'ve been added to the waitlist! We\'ll notify you if a slot becomes available.');
                        setShowWaitlist(false);
                      } else {
                        throw new Error('Failed to join waitlist');
                      }
                    } catch (error) {
                      toast.error('Failed to join waitlist. Please try again.');
                    } finally {
                      setWaitlistSubmitting(false);
                    }
                  }}
                  disabled={waitlistSubmitting}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                >
                  {waitlistSubmitting ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Joining...
                    </>
                  ) : (
                    'Join Waitlist'
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
