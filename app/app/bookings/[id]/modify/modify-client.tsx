'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/utils';
import { 
  Settings,
  Car,
  Package,
  Calculator,
  AlertCircle,
  CheckCircle,
  Plus,
  Minus
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  shortDesc: string;
  price: number;
  duration: number;
  category: string;
  features: string[];
}

interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface BookingData {
  id: string;
  serviceId: string;
  totalAmount: number;
  baseAmount: number;
  addOnAmount: number;
  notes?: string | null;
  service: {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
  };
  vehicle: {
    make: string;
    model: string;
    licensePlate: string;
  };
  addOns: Array<{
    addOnId: string;
    addOn: {
      id: string;
      name: string;
      price: number;
    };
    quantity: number;
    price: number;
  }>;
}

interface ModifyClientProps {
  booking: BookingData;
  services: Service[];
  addOns: AddOn[];
}

export function ModifyClient({ booking, services, addOns }: ModifyClientProps) {
  const router = useRouter();
  const [selectedServiceId, setSelectedServiceId] = useState(booking.serviceId);
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState(booking.notes || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Initialize selected add-ons from current booking
  useEffect(() => {
    const currentAddOns: Record<string, number> = {};
    booking.addOns.forEach(addOn => {
      currentAddOns[addOn.addOnId] = addOn.quantity;
    });
    setSelectedAddOns(currentAddOns);
  }, [booking.addOns]);

  const selectedService = services.find(s => s.id === selectedServiceId);
  
  // Calculate totals
  const baseAmount = selectedService?.price || 0;
  const addOnAmount = Object.entries(selectedAddOns).reduce((total, [addOnId, quantity]) => {
    const addOn = addOns.find(a => a.id === addOnId);
    return total + (addOn ? addOn.price * quantity : 0);
  }, 0);
  const totalAmount = baseAmount + addOnAmount;

  const handleAddOnChange = (addOnId: string, quantity: number) => {
    setSelectedAddOns(prev => {
      const updated = { ...prev };
      if (quantity <= 0) {
        delete updated[addOnId];
      } else {
        updated[addOnId] = Math.min(quantity, 5); // Max 5 of each add-on
      }
      return updated;
    });
  };

  const handleModify = async () => {
    if (!selectedServiceId) {
      setError('Please select a service');
      return;
    }

    // Check if anything has changed
    const currentService = booking.service.id;
    const currentAddOnIds = new Set(booking.addOns.map(a => a.addOnId));
    const newAddOnIds = new Set(Object.keys(selectedAddOns));
    const currentNotes = booking.notes || '';

    const serviceChanged = currentService !== selectedServiceId;
    const addOnsChanged = 
      currentAddOnIds.size !== newAddOnIds.size ||
      [...currentAddOnIds].some(id => !newAddOnIds.has(id)) ||
      [...newAddOnIds].some(id => !currentAddOnIds.has(id)) ||
      booking.addOns.some(addOn => selectedAddOns[addOn.addOnId] !== addOn.quantity);
    const notesChanged = currentNotes !== notes;

    if (!serviceChanged && !addOnsChanged && !notesChanged) {
      setError('No changes detected. Please make some changes before saving.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/bookings/${booking.id}/modify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: selectedServiceId,
          addOns: Object.entries(selectedAddOns).map(([addOnId, quantity]) => ({
            addOnId,
            quantity
          })),
          notes: notes.trim() || null,
          totalAmount,
          baseAmount,
          addOnAmount
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to modify booking');
      }

      // Success - redirect back to bookings with success message
      router.push('/bookings?modified=true');
      
    } catch (error) {
      console.error('Error modifying booking:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const priceDifference = totalAmount - booking.totalAmount;

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
            <Settings className="w-6 h-6 mr-2 text-blue-600" />
            Modify Booking
          </h1>
          <p className="text-gray-600">Update your service selection and add-ons</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Booking Info */}
          <div className="lg:col-span-1">
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
                    <h3 className="font-semibold">{booking.service.name}</h3>
                    <Badge variant="outline">{booking.service.category}</Badge>
                  </div>
                  
                  <div className="text-sm space-y-2">
                    <p><span className="font-medium">Vehicle:</span> {booking.vehicle.make} {booking.vehicle.model}</p>
                    <p><span className="font-medium">License:</span> {booking.vehicle.licensePlate}</p>
                    <p><span className="font-medium">Current Total:</span> {formatCurrency(booking.totalAmount)}</p>
                  </div>

                  {booking.addOns.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Current Add-ons:</h4>
                      <div className="space-y-1 text-xs">
                        {booking.addOns.map((addOn, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{addOn.addOn.name} × {addOn.quantity}</span>
                            <span>{formatCurrency(addOn.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Price Summary */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-green-600" />
                  New Price Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base Service</span>
                    <span>{formatCurrency(baseAmount)}</span>
                  </div>
                  {addOnAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Add-ons</span>
                      <span>{formatCurrency(addOnAmount)}</span>
                    </div>
                  )}
                  <hr className="border-gray-200" />
                  <div className="flex justify-between font-semibold">
                    <span>New Total</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                  {priceDifference !== 0 && (
                    <div className={`flex justify-between text-sm ${priceDifference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      <span>Difference</span>
                      <span>
                        {priceDifference > 0 ? '+' : ''}
                        {formatCurrency(priceDifference)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Service Selection */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Service</CardTitle>
                <p className="text-sm text-gray-600">Choose your car wash service</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedServiceId === service.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedServiceId(service.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{service.name}</h3>
                        <Badge variant="outline">{service.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{service.shortDesc}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg">{formatCurrency(service.price)}</span>
                        <span className="text-sm text-gray-500">{service.duration} min</span>
                      </div>
                      {selectedServiceId === service.id && (
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-2" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Add-ons Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Add-on Services
                </CardTitle>
                <p className="text-sm text-gray-600">Enhance your car wash experience</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {addOns.map((addOn) => {
                    const quantity = selectedAddOns[addOn.id] || 0;
                    return (
                      <div key={addOn.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={quantity > 0}
                              onCheckedChange={(checked) => {
                                handleAddOnChange(addOn.id, checked ? 1 : 0);
                              }}
                            />
                            <div>
                              <Label className="font-medium">{addOn.name}</Label>
                              <p className="text-sm text-gray-600">{addOn.description}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <span className="font-semibold">{formatCurrency(addOn.price)}</span>
                          
                          {quantity > 0 && (
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddOnChange(addOn.id, quantity - 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="text-sm font-medium w-8 text-center">{quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddOnChange(addOn.id, quantity + 1)}
                                className="h-8 w-8 p-0"
                                disabled={quantity >= 5}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Special Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Special Instructions</CardTitle>
                <p className="text-sm text-gray-600">Any special requirements or notes</p>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="e.g., Please pay special attention to the interior, remove pet hair, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-2">{notes.length}/500 characters</p>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button
                onClick={handleModify}
                disabled={isLoading}
                className="flex-1"
                size="lg"
              >
                {isLoading ? 'Updating...' : 'Update Booking'}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/bookings')}
                className="flex-1"
                size="lg"
              >
                Cancel Changes
              </Button>
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <p><strong>Note:</strong> Changes to your booking may result in a price difference. If the new total is higher, you'll be charged the difference. If lower, we'll process a refund. All modifications are subject to availability.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}