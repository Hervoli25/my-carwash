'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/header';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown,
  Check,
  Star,
  ArrowRight,
  Settings,
  Calendar,
  CreditCard,
  Shield,
  Zap,
  MapPin
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  popular: boolean;
}

interface CurrentMembership {
  plan: string;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  price: number;
}

interface MembershipData {
  plans: MembershipPlan[];
  currentMembership?: CurrentMembership;
  isAdmin: boolean;
}

export function MembershipClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const [data, setData] = useState<MembershipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState<{show: boolean, planId: string, payFastData: any, amount: number} | null>(null);

  useEffect(() => {
    const fetchMembershipData = async () => {
      try {
        const response = await fetch('/api/membership');
        if (response.ok) {
          const membershipData = await response.json();
          setData(membershipData);
        }
      } catch (error) {
        console.error('Failed to fetch membership data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembershipData();
  }, []);

  const handleSubscribe = async (planId: string) => {
    setSubscribing(planId);
    try {
      const response = await fetch('/api/membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      const result = await response.json();
      
      if (response.ok) {
        if (result.requiresPaymentSelection) {
          // Show payment method selection modal
          setShowPaymentOptions({
            show: true,
            planId: result.planId,
            payFastData: result.payFastData,
            amount: result.amount
          });
          return;
        } else {
          // Admin gets free membership - refresh data
          const refreshResponse = await fetch('/api/membership');
          if (refreshResponse.ok) {
            const updatedData = await refreshResponse.json();
            setData(updatedData);
          }
          alert(result.message);
        }
      } else {
        alert(result.error || 'Failed to subscribe to membership');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('An error occurred while subscribing');
    } finally {
      setSubscribing(null);
    }
  };

  const handlePayAtLocation = async () => {
    if (!showPaymentOptions) return;

    setSubscribing(showPaymentOptions.planId);
    try {
      const response = await fetch('/api/membership/pay-at-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId: showPaymentOptions.planId }),
      });

      const result = await response.json();
      
      if (response.ok) {
        // Close payment options modal
        setShowPaymentOptions(null);
        
        // Refresh membership data
        const refreshResponse = await fetch('/api/membership');
        if (refreshResponse.ok) {
          const updatedData = await refreshResponse.json();
          setData(updatedData);
        }
        
        alert(`${result.message}\n\nPayment Instructions:\nAmount: ${result.paymentInstructions.amount}\nMembership ID: ${result.paymentInstructions.membershipId}\n\n${result.paymentInstructions.instructions}`);
      } else {
        alert(result.error || 'Failed to create pay-at-location membership');
      }
    } catch (error) {
      console.error('Pay at location error:', error);
      alert('An error occurred while creating pay-at-location membership');
    } finally {
      setSubscribing(null);
    }
  };

  const handlePayFastPayment = () => {
    if (!showPaymentOptions) return;

    // Create and submit PayFast form
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://sandbox.payfast.co.za/eng/process'; // Use sandbox for testing, change to 'https://www.payfast.co.za/eng/process' for production

    Object.entries(showPaymentOptions.payFastData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value as string;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    
    setShowPaymentOptions(null);
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'BASIC':
        return <Shield className="w-6 h-6 text-gray-600" />;
      case 'PREMIUM':
        return <Star className="w-6 h-6 text-blue-600" />;
      default:
        return <Shield className="w-6 h-6 text-gray-600" />;
    }
  };

  const getPlanColors = (planId: string, popular = false) => {
    if (popular) {
      return {
        border: 'border-blue-500 shadow-blue-100',
        header: 'bg-blue-600 text-white',
        button: 'bg-blue-600 hover:bg-blue-700 text-white'
      };
    }
    
    switch (planId) {
      case 'BASIC':
        return {
          border: 'border-gray-200',
          header: 'bg-gray-50 text-gray-900',
          button: 'bg-gray-600 hover:bg-gray-700 text-white'
        };
      case 'PREMIUM':
        return {
          border: 'border-blue-200',
          header: 'bg-blue-50 text-blue-900',
          button: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
      default:
        return {
          border: 'border-gray-200',
          header: 'bg-gray-50 text-gray-900',
          button: 'bg-gray-600 hover:bg-gray-700 text-white'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
              <div className="lg:col-span-3">
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">Failed to load membership data</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Payment Method Selection Modal */}
      {showPaymentOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
              Choose Payment Method
            </h3>
            <p className="text-gray-600 mb-6">
              Select how you'd like to pay for your {showPaymentOptions.planId} membership 
              (R{(showPaymentOptions.amount / 100).toFixed(2)}/month)
            </p>
            
            <div className="space-y-3">
              {/* Pay at Location - Default/Recommended */}
              <button
                onClick={handlePayAtLocation}
                disabled={subscribing !== null}
                className="w-full p-4 border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-all"
              >
                <div className="flex items-center">
                  <MapPin className="w-6 h-6 text-blue-600 mr-3" />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-blue-900">Pay at Location</div>
                    <div className="text-sm text-blue-700">Recommended • No online fees</div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">Default</Badge>
                </div>
              </button>
              
              {/* PayFast Online Payment */}
              <button
                onClick={handlePayFastPayment}
                disabled={subscribing !== null}
                className="w-full p-4 border rounded-lg hover:bg-gray-50 transition-all"
              >
                <div className="flex items-center">
                  <CreditCard className="w-6 h-6 text-green-600 mr-3" />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">PayFast Online</div>
                    <div className="text-sm text-gray-600">Card, EFT, or instant payment</div>
                  </div>
                </div>
              </button>
            </div>
            
            <div className="mt-6 flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowPaymentOptions(null)}
                disabled={subscribing !== null}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
            
            {subscribing && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Processing...
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <DashboardSidebar activeTab="membership" />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                <Crown className="w-7 h-7 mr-3 text-amber-600" />
                Membership Plans
              </h1>
              <p className="text-gray-600">
                Choose the perfect plan for your car care needs and start saving today!
              </p>
            </div>

            {/* Current Membership Status */}
            {data.currentMembership && (
              <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center text-amber-800">
                    <Star className="w-5 h-5 mr-2" />
                    Your Current Membership
                    {data.isAdmin && <Badge className="ml-3 bg-red-100 text-red-700">ADMIN</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="font-medium text-amber-900">
                          {data.currentMembership.plan} Plan
                        </p>
                        <p className="text-sm text-amber-700">
                          Since {formatDate(new Date(data.currentMembership.startDate))}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="font-medium text-amber-900">
                          {data.currentMembership.price === 0 ? 'FREE' : formatCurrency(data.currentMembership.price)}/month
                        </p>
                        <p className="text-sm text-amber-700">
                          {data.currentMembership.autoRenew ? 'Auto-renew enabled' : 'Manual renewal'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Zap className="w-5 h-5 text-amber-600" />
                      <div>
                        <Badge className="bg-green-100 text-green-700">
                          Active
                        </Badge>
                        {data.currentMembership.endDate && (
                          <p className="text-sm text-amber-700 mt-1">
                            Expires {formatDate(new Date(data.currentMembership.endDate))}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Membership Plans */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {data.plans.map((plan) => {
                const colors = getPlanColors(plan.id, plan.popular);
                const isCurrentPlan = data.currentMembership?.plan === plan.id;
                const isUpgrade = data.currentMembership && 
                  (data.currentMembership.plan === 'BASIC' && plan.id === 'PREMIUM');
                const isDowngrade = data.currentMembership && 
                  (data.currentMembership.plan === 'PREMIUM' && plan.id === 'BASIC');

                return (
                  <Card key={plan.id} className={`relative ${colors.border} ${plan.popular ? 'shadow-lg' : ''}`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                      </div>
                    )}
                    
                    <CardHeader className={`${colors.header} rounded-t-lg`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getPlanIcon(plan.id)}
                          <div>
                            <CardTitle className="text-lg">{plan.name}</CardTitle>
                            <p className="text-sm opacity-80">{plan.description}</p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6">
                      <div className="text-center mb-6">
                        <div className="text-3xl font-bold text-gray-900">
                          {data.isAdmin && plan.id === data.currentMembership?.plan ? 
                            'FREE' : formatCurrency(plan.price)
                          }
                        </div>
                        <p className="text-gray-600">per month</p>
                      </div>
                      
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="space-y-2">
                        {isCurrentPlan ? (
                          <Button disabled className="w-full">
                            <Check className="w-4 h-4 mr-2" />
                            Current Plan
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleSubscribe(plan.id)}
                            disabled={subscribing !== null}
                            className={`w-full ${colors.button}`}
                          >
                            {subscribing === plan.id ? (
                              'Processing...'
                            ) : (
                              <>
                                {isUpgrade ? 'Upgrade' : isDowngrade ? 'Downgrade' : 'Subscribe'}
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </>
                            )}
                          </Button>
                        )}
                        
                        {data.isAdmin && (
                          <p className="text-center text-xs text-gray-500">
                            Admin gets this plan for FREE
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Benefits Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-amber-600" />
                  Why Choose Membership?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CreditCard className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">Save Money</h4>
                    <p className="text-sm text-gray-600">Get discounts on every service</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">Priority Booking</h4>
                    <p className="text-sm text-gray-600">Get your preferred time slots</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Star className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">Loyalty Rewards</h4>
                    <p className="text-sm text-gray-600">Earn points faster with every service</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Settings className="w-6 h-6 text-amber-600" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">Exclusive Perks</h4>
                    <p className="text-sm text-gray-600">Free add-ons and special offers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}