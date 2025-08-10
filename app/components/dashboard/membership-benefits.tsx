
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown,
  Plus,
  Settings,
  Star,
  ArrowRight,
  Users
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface MembershipData {
  plan?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  benefits?: string[];
}

interface StatsData {
  totalServices: number;
  moneySaved: number;
  carbonFootprint: number;
  profileCompletion: number;
  profileFields: {
    total: number;
    completed: number;
    missing: number;
  };
}

interface MembershipBenefitsProps {
  membership?: MembershipData;
  stats: StatsData;
  isAdmin?: boolean;
}

export function MembershipBenefits({ membership, stats, isAdmin = false }: MembershipBenefitsProps) {
  const getMembershipPlanDetails = (plan: string) => {
    switch (plan) {
      case 'PREMIUM':
        return {
          name: 'Premium Member',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          badgeBgColor: 'bg-blue-100',
          badgeTextColor: 'text-blue-700',
          benefits: ['15% discount on all services', 'Priority booking', '2x loyalty points', 'Free tire shine']
        };
      case 'ELITE':
        return {
          name: 'Elite Member',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          badgeBgColor: 'bg-purple-100',
          badgeTextColor: 'text-purple-700',
          benefits: ['25% discount on all services', 'VIP priority booking', '3x loyalty points', 'Free add-ons', 'Monthly detailing']
        };
      default:
        return {
          name: 'Basic Member',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          badgeBgColor: 'bg-gray-100',
          badgeTextColor: 'text-gray-700',
          benefits: ['10% discount on all services', 'Standard booking', '1x loyalty points']
        };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Membership Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Crown className="w-5 h-5 mr-2 text-amber-600" />
            Membership Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {membership && membership.isActive ? (
            <div className="space-y-4">
              <div className={`p-4 ${getMembershipPlanDetails(membership.plan!).bgColor} rounded-lg border ${getMembershipPlanDetails(membership.plan!).borderColor}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">
                    {getMembershipPlanDetails(membership.plan!).name}
                    {isAdmin && <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">ADMIN</span>}
                  </h4>
                  <Badge className={`${getMembershipPlanDetails(membership.plan!).badgeBgColor} ${getMembershipPlanDetails(membership.plan!).badgeTextColor}`}>
                    Active
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Member since {formatDate(new Date(membership.startDate!))}
                </p>
                {membership.endDate && (
                  <p className="text-xs text-gray-500 mb-3">
                    Expires: {formatDate(new Date(membership.endDate))}
                  </p>
                )}
                
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Benefits:</h5>
                  <ul className="space-y-1">
                    {getMembershipPlanDetails(membership.plan!).benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center text-xs text-gray-600">
                        <Star className="w-3 h-3 mr-2 text-amber-500" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => window.location.href = '/membership/manage'}>
                    <Settings className="w-4 h-4 mr-1" />
                    Manage Plan
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => window.location.href = '/membership/manage'}>
                    <Plus className="w-4 h-4 mr-1" />
                    Upgrade
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h4 className="font-medium text-gray-900 mb-2">No Active Membership</h4>
              <p className="text-sm text-gray-600 mb-4">
                Join our membership program to save money and get exclusive benefits!
              </p>
              <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => window.location.href = '/membership/manage'}>
                <Crown className="w-4 h-4 mr-2" />
                Join Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{stats.totalServices}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">Total Services</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{formatCurrency(stats.moneySaved)}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">Money Saved</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{stats.carbonFootprint}%</span>
                </div>
                <span className="text-sm font-medium text-gray-900">Carbon Saved</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-amber-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-amber-900">Profile Completion</h4>
              <span className="text-xs font-medium text-amber-700">
                {stats.profileFields.completed}/{stats.profileFields.total} fields
              </span>
            </div>
            <p className="text-xs text-amber-700 mb-2">
              {stats.profileCompletion < 100 ? 
                `Complete ${stats.profileFields.missing} more fields for better service` : 
                'Your profile is complete!'
              }
            </p>
            <div className="w-full bg-amber-200 rounded-full h-2 mt-2">
              <div 
                className="bg-amber-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${stats.profileCompletion}%` }}
              ></div>
            </div>
            <p className="text-xs text-amber-600 mt-1">{stats.profileCompletion}% complete</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
