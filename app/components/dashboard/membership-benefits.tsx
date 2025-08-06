
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown,
  Plus,
  Settings
} from 'lucide-react';

export function MembershipBenefits() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Membership Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Crown className="w-5 h-5 mr-2 text-amber-600" />
            Membership Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Premium Wash</h4>
                <Badge className="bg-blue-100 text-blue-700">Active</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">Apr 25, 2024 10:00 AM</p>
              <p className="text-xs text-gray-500 mb-3">1254 Elm St.</p>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Settings className="w-4 h-4 mr-1" />
                  Modify
                </Button>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Services
                </Button>
              </div>
            </div>
          </div>
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
                  <span className="text-white text-sm font-bold">9</span>
                </div>
                <span className="text-sm font-medium text-gray-900">Total Services</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">R45</span>
                </div>
                <span className="text-sm font-medium text-gray-900">Money Saved</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">76%</span>
                </div>
                <span className="text-sm font-medium text-gray-900">Carbon Footprint</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-amber-50 rounded-lg">
            <h4 className="text-sm font-medium text-amber-900 mb-2">Profile Completion</h4>
            <p className="text-xs text-amber-700">
              Complete your profile for a better experience
            </p>
            <div className="w-full bg-amber-200 rounded-full h-2 mt-2">
              <div className="bg-amber-600 h-2 rounded-full" style={{ width: '78%' }}></div>
            </div>
            <p className="text-xs text-amber-600 mt-1">78% complete</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
