
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Car, 
  Shield, 
  Droplets, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

interface HealthMetric {
  name: string;
  value: number;
  maxValue: number;
  status: 'excellent' | 'good' | 'needs-attention' | 'critical';
  lastUpdated: string;
  recommendation: string;
  icon: React.ReactNode;
}

export function CarHealthMonitor() {
  const [selectedCar] = useState('2023 BMW X5');
  const [healthMetrics] = useState<HealthMetric[]>([
    {
      name: 'Paint Protection',
      value: 85,
      maxValue: 100,
      status: 'good',
      lastUpdated: '2 days ago',
      recommendation: 'Wax treatment recommended in 2 weeks',
      icon: <Shield className="w-5 h-5" />
    },
    {
      name: 'Interior Cleanliness',
      value: 92,
      maxValue: 100,
      status: 'excellent',
      lastUpdated: '1 week ago',
      recommendation: 'Excellent condition maintained',
      icon: <Car className="w-5 h-5" />
    },
    {
      name: 'Hydrophobic Coating',
      value: 60,
      maxValue: 100,
      status: 'needs-attention',
      lastUpdated: '3 weeks ago',
      recommendation: 'Reapplication needed within 7 days',
      icon: <Droplets className="w-5 h-5" />
    },
    {
      name: 'Tire Condition',
      value: 78,
      maxValue: 100,
      status: 'good',
      lastUpdated: '1 week ago',
      recommendation: 'Tire shine service available',
      icon: <Zap className="w-5 h-5" />
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'needs-attention': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-4 h-4" />;
      case 'good': return <CheckCircle className="w-4 h-4" />;
      case 'needs-attention': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const overallHealth = Math.round(
    healthMetrics.reduce((sum, metric) => sum + (metric.value / metric.maxValue) * 100, 0) / healthMetrics.length
  );

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Car Health Monitor</h3>
            <p className="text-sm text-gray-600">{selectedCar}</p>
          </div>
        </div>
        <Badge className={`${overallHealth >= 80 ? 'bg-green-100 text-green-700' : 
          overallHealth >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
          {overallHealth}% Health Score
        </Badge>
      </div>

      {/* Overall Health Circle */}
      <div className="flex justify-center mb-8">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - overallHealth / 100)}`}
              className={overallHealth >= 80 ? 'text-green-500' : 
                overallHealth >= 60 ? 'text-yellow-500' : 'text-red-500'}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold">{overallHealth}%</div>
              <div className="text-xs text-gray-500">Overall Health</div>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Metrics */}
      <div className="space-y-4">
        {healthMetrics.map((metric, index) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getStatusColor(metric.status).split(' ')[1]}`}>
                  {metric.icon}
                </div>
                <div>
                  <h4 className="font-medium">{metric.name}</h4>
                  <p className="text-xs text-gray-500">Updated {metric.lastUpdated}</p>
                </div>
              </div>
              <Badge className={getStatusColor(metric.status)} variant="secondary">
                <span className="flex items-center space-x-1">
                  {getStatusIcon(metric.status)}
                  <span className="capitalize">{metric.status.replace('-', ' ')}</span>
                </span>
              </Badge>
            </div>
            
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Condition</span>
                <span>{metric.value}%</span>
              </div>
              <Progress value={metric.value} className="h-2" />
            </div>

            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600">{metric.recommendation}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex space-x-3">
        <Button className="flex-1" size="sm">
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Maintenance
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          View Full Report
        </Button>
      </div>
    </Card>
  );
}
