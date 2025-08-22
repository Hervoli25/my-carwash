'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { DigitalMembershipCard } from '@/components/membership/digital-membership-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Gift, 
  Calendar,
  TrendingUp,
  Crown,
  Zap
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface MembershipInfo {
  plan: string;
  planDisplayName: string;
  qrCode: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  price: number;
  features: string[];
  discountRate: number;
  paymentMethod: string;
}

interface MembershipPlans {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  popular: boolean;
}

export default function MembershipDashboard() {
  const { data: session, status } = useSession();
  const [membershipInfo, setMembershipInfo] = useState<MembershipInfo | null>(null);
  const [availablePlans, setAvailablePlans] = useState<MembershipPlans[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin');
    }
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchMembershipData();
    }
  }, [status]);

  const fetchMembershipData = async () => {
    try {
      const response = await fetch('/api/membership');
      const data = await response.json();

      if (data.currentMembership) {
        setMembershipInfo(data.currentMembership);
      }
      setAvailablePlans(data.plans || []);
    } catch (error) {
      console.error('Failed to fetch membership data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    try {
      const response = await fetch('/api/membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (data.requiresPaymentSelection) {
        // Redirect to payment page or show payment options
        alert('Payment options will be shown here');
      } else if (data.requiresPayment === false) {
        // Free plan activation
        alert(data.message);
        fetchMembershipData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to upgrade membership:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const getPlanIcon = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'premium':
        return Star;
      case 'elite':
        return Crown;
      default:
        return Zap;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Membership</h1>
        <p className="text-gray-600">Manage your Ekhaya Car Wash membership and view benefits</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Digital Membership Card */}
        <div className="lg:col-span-1">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Digital Membership Card</h2>
            <DigitalMembershipCard />
          </div>
        </div>

        {/* Membership Details & Benefits */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Membership Status */}
          {membershipInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-full">
                    {React.createElement(getPlanIcon(membershipInfo.plan), {
                      className: "w-5 h-5 text-blue-600"
                    })}
                  </div>
                  <span>{membershipInfo.planDisplayName}</span>
                  <Badge variant={membershipInfo.isActive ? "default" : "secondary"}>
                    {membershipInfo.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Discount Rate</p>
                    <p className="font-semibold">{(membershipInfo.discountRate * 100)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Monthly Cost</p>
                    <p className="font-semibold">
                      {membershipInfo.price === 0 ? 'FREE' : formatCurrency(membershipInfo.price)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">Membership Benefits</p>
                  <ul className="space-y-1">
                    {membershipInfo.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <Star className="w-4 h-4 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upgrade Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Upgrade Your Membership</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {availablePlans
                  .filter(plan => plan.id !== membershipInfo?.plan)
                  .map((plan) => (
                    <div key={plan.id} className="border rounded-lg p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold">{plan.name}</h4>
                          {plan.popular && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              Most Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                        <p className="font-bold text-lg">
                          {plan.price === 0 ? 'FREE' : formatCurrency(plan.price)}/month
                        </p>
                      </div>
                      <Button 
                        onClick={() => handleUpgrade(plan.id)}
                        className="ml-4"
                      >
                        {plan.price === 0 ? 'Switch to Free' : 'Upgrade'}
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Calendar className="w-6 h-6 mb-2" />
                  <span>Book Service</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Gift className="w-6 h-6 mb-2" />
                  <span>View Rewards</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}