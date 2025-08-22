
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  // Always assume the amount is in cents and convert to rands
  // For membership prices: 0 cents = FREE, 9900 cents = R99, 19900 cents = R199
  const rands = Math.round(amount / 100);
  return `R${rands}`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function formatTime(timeString: string): string {
  return timeString;
}

export function getVehicleTypePrice(basePrice: number, vehicleType: string): number {
  const priceMultipliers = {
    'Sedan': 1.0,
    'Hatchback': 0.9,
    'SUV': 1.1,
    'Bakkie': 1.15,
  };
  
  return Math.round(basePrice * (priceMultipliers[vehicleType as keyof typeof priceMultipliers] || 1.0));
}
