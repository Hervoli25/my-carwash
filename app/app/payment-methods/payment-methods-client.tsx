'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, Trash2, Edit, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

interface PaymentMethod {
  id: string;
  type: string;
  lastFour: string;
  expiryMonth: number;
  expiryYear: number;
  cardholderName: string | null;
  stripeBrand: string | null;
  isDefault: boolean;
  isActive: boolean;
}

export function PaymentMethodsClient() {
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoPayEnabled, setAutoPayEnabled] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/stripe/setup-intent');
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data.paymentMethods || []);
      }
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = () => {
    router.push('/payment-methods/add');
  };

  const handleEditPaymentMethod = (paymentMethodId: string) => {
    router.push(`/payment-methods/edit/${paymentMethodId}`);
  };

  const handleRemovePaymentMethod = async (paymentMethodId: string) => {
    const result = await Swal.fire({
      title: 'Remove Payment Method?',
      text: 'Are you sure you want to remove this payment method? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Remove',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/stripe/payment-methods/${paymentMethodId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          toast.success('Payment method removed successfully');
          fetchPaymentMethods(); // Refresh the list
        } else {
          toast.error('Failed to remove payment method');
        }
      } catch (error) {
        toast.error('An error occurred while removing payment method');
      }
    }
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      const response = await fetch('/api/stripe/setup-intent', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId,
          isDefault: true,
        }),
      });

      if (response.ok) {
        toast.success('Default payment method updated');
        fetchPaymentMethods(); // Refresh the list
      } else {
        toast.error('Failed to update default payment method');
      }
    } catch (error) {
      toast.error('An error occurred while updating payment method');
    }
  };

  const getBrandColor = (brand: string | null) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return 'bg-blue-600';
      case 'mastercard':
        return 'bg-red-600';
      case 'amex':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getBrandLabel = (brand: string | null) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return 'VISA';
      case 'mastercard':
        return 'MC';
      case 'amex':
        return 'AMEX';
      default:
        return 'CARD';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">Loading payment methods...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <DashboardSidebar activeTab="payment" />
          </div>

          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
              <p className="text-gray-600">Manage your saved payment methods</p>
            </div>

            <div className="space-y-6">
              {/* Saved Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle>Saved Payment Methods</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {paymentMethods.length === 0 ? (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No payment methods saved yet</p>
                      <Button 
                        onClick={handleAddPaymentMethod}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Payment Method
                      </Button>
                    </div>
                  ) : (
                    <>
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-8 ${getBrandColor(method.stripeBrand)} rounded flex items-center justify-center`}>
                              <span className="text-white text-xs font-bold">
                                {getBrandLabel(method.stripeBrand)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">
                                {method.stripeBrand} ****{method.lastFour}
                              </p>
                              <p className="text-sm text-gray-600">
                                Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear.toString().slice(-2)}
                              </p>
                              {method.cardholderName && (
                                <p className="text-xs text-gray-500">{method.cardholderName}</p>
                              )}
                            </div>
                            {method.isDefault && (
                              <Badge className="bg-green-100 text-green-700">Default</Badge>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            {!method.isDefault && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleSetDefault(method.id)}
                              >
                                Set Default
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditPaymentMethod(method.id)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleRemovePaymentMethod(method.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <Button 
                        className="w-full border-dashed" 
                        variant="outline"
                        onClick={handleAddPaymentMethod}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Payment Method
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Auto-Pay Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Auto-Pay Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Enable auto-pay</h4>
                        <p className="text-sm text-gray-600">Automatically pay for recurring services</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={autoPayEnabled}
                          onChange={(e) => setAutoPayEnabled(e.target.checked)}
                          aria-label="Enable auto-pay"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    {paymentMethods.length === 0 && (
                      <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        <p className="text-sm">Add a payment method to enable auto-pay</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
