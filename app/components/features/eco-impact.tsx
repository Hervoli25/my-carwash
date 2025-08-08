
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Leaf, 
  Droplets, 
  Recycle, 
  TreePine,
  Globe,
  Award,
  TrendingUp,
  Users,
  Target,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface EcoMetric {
  label: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  improvement: number;
  target: number;
  description: string;
}

export function EcoImpactDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  
  const personalMetrics: EcoMetric[] = [
    {
      label: 'Water Saved',
      value: 1250,
      unit: 'liters',
      icon: <Droplets className="w-6 h-6 text-blue-500" />,
      improvement: 15,
      target: 2000,
      description: 'Using our eco-wash technology vs traditional methods'
    },
    {
      label: 'CO₂ Reduced',
      value: 45.8,
      unit: 'kg CO₂',
      icon: <Leaf className="w-6 h-6 text-green-500" />,
      improvement: 22,
      target: 100,
      description: 'Equivalent to planting 2.3 trees this year'
    },
    {
      label: 'Chemical Reduction',
      value: 85,
      unit: '% reduction',
      icon: <Recycle className="w-6 h-6 text-purple-500" />,
      improvement: 8,
      target: 90,
      description: 'Biodegradable products used in all services'
    },
    {
      label: 'Energy Efficiency',
      value: 78,
      unit: '% efficient',
      icon: <Globe className="w-6 h-6 text-orange-500" />,
      improvement: 12,
      target: 85,
      description: 'Solar-powered equipment and LED lighting'
    }
  ];

  const communityStats = {
    totalWaterSaved: 2547830,
    totalCO2Reduced: 89420,
    membersParticipating: 15847,
    treesEquivalent: 4471
  };

  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Water Saved (L)',
        data: [180, 195, 210, 185, 220, 235, 250],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'CO₂ Reduced (kg)',
        data: [5.2, 6.1, 6.8, 5.9, 7.2, 7.8, 8.1],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4
      }
    ]
  };

  const impactComparison = {
    labels: ['Traditional Wash', 'PRESTIGE Eco-Wash'],
    datasets: [
      {
        label: 'Water Usage (L)',
        data: [150, 45],
        backgroundColor: ['rgba(239, 68, 68, 0.8)', 'rgba(34, 197, 94, 0.8)'],
      }
    ]
  };

  const achievements = [
    {
      id: 'water-saver',
      title: 'Water Conservation Hero',
      description: 'Saved over 1000L of water',
      icon: <Droplets className="w-8 h-8 text-blue-500" />,
      unlocked: true,
      date: '2024-06-15'
    },
    {
      id: 'eco-warrior',
      title: 'Eco Warrior',
      description: 'Reduced CO₂ by 25kg this year',
      icon: <Leaf className="w-8 h-8 text-green-500" />,
      unlocked: true,
      date: '2024-07-20'
    },
    {
      id: 'green-streak',
      title: 'Green Streak Champion',
      description: 'Used eco services for 30 days straight',
      icon: <TreePine className="w-8 h-8 text-emerald-500" />,
      unlocked: false,
      progress: 12,
      maxProgress: 30
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 border-0">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Environmental Impact Dashboard</h3>
              <p className="text-sm text-gray-600">Track your positive impact on the planet</p>
            </div>
            <Badge className="bg-green-500 text-white">
              <Leaf className="w-3 h-3 mr-1" />
              ECO CERTIFIED
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{personalMetrics[0].value}L</div>
              <div className="text-sm text-gray-600">Water Saved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{personalMetrics[1].value}kg</div>
              <div className="text-sm text-gray-600">CO₂ Reduced</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{personalMetrics[2].value}%</div>
              <div className="text-sm text-gray-600">Less Chemicals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{personalMetrics[3].value}%</div>
              <div className="text-sm text-gray-600">Energy Efficient</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal Impact</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          {/* Personal Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personalMetrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {metric.icon}
                        <div>
                          <h4 className="font-medium text-gray-900">{metric.label}</h4>
                          <p className="text-xs text-gray-600">{metric.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-700">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{metric.improvement}%
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-2xl font-bold text-gray-900">
                          {metric.value} {metric.unit}
                        </span>
                        <span className="text-sm text-gray-500">
                          Goal: {metric.target} {metric.unit}
                        </span>
                      </div>
                      <Progress 
                        value={(metric.value / metric.target) * 100} 
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Environmental Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Line
                  data={monthlyData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="community" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-500" />
                Community Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Droplets className="w-12 h-12 mx-auto text-blue-500 mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    {(communityStats.totalWaterSaved / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-sm text-gray-600">Liters Water Saved</div>
                  <div className="text-xs text-gray-500 mt-1">
                    By all PRESTIGE members
                  </div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Leaf className="w-12 h-12 mx-auto text-green-500 mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {(communityStats.totalCO2Reduced / 1000).toFixed(1)}T
                  </div>
                  <div className="text-sm text-gray-600">CO₂ Reduced</div>
                  <div className="text-xs text-gray-500 mt-1">
                    This year alone
                  </div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Users className="w-12 h-12 mx-auto text-purple-500 mb-2" />
                  <div className="text-2xl font-bold text-purple-600">
                    {communityStats.membersParticipating.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Eco Members</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Active participants
                  </div>
                </div>
                
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <TreePine className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
                  <div className="text-2xl font-bold text-emerald-600">
                    {communityStats.treesEquivalent.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Trees Equivalent</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Environmental benefit
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Community Goal 2024</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Together, let's save 5 million liters of water and reduce CO₂ emissions by 150 tons!
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Water Conservation Progress</span>
                    <span>{((communityStats.totalWaterSaved / 5000000) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(communityStats.totalWaterSaved / 5000000) * 100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-500" />
                Environmental Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      p-4 rounded-lg border transition-all
                      ${achievement.unlocked 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                      }
                    `}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`
                        p-2 rounded-full
                        ${achievement.unlocked ? 'bg-green-100' : 'bg-gray-100'}
                      `}>
                        {achievement.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                          {achievement.unlocked && (
                            <Badge className="bg-green-500 text-white">
                              <Award className="w-3 h-3 mr-1" />
                              Unlocked
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                        
                        {achievement.unlocked ? (
                          <div className="text-xs text-green-600">
                            Earned on {new Date(achievement.date!).toLocaleDateString()}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-medium">
                                {achievement.progress}/{achievement.maxProgress}
                              </span>
                            </div>
                            <Progress 
                              value={(achievement.progress! / achievement.maxProgress!) * 100} 
                              className="h-1.5"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eco-Wash vs Traditional Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Water Usage Comparison */}
                <div>
                  <h4 className="font-medium mb-4">Water Usage per Wash</h4>
                  <div className="h-64">
                    <Bar
                      data={impactComparison}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Liters'
                            }
                          },
                        },
                      }}
                    />
                  </div>
                </div>
                
                {/* Impact Summary */}
                <div>
                  <h4 className="font-medium mb-4">Your Environmental Choice Impact</h4>
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Droplets className="w-5 h-5 text-blue-500" />
                        <span className="font-medium text-blue-900">Water Conservation</span>
                      </div>
                      <p className="text-sm text-blue-800">
                        Our eco-wash uses 70% less water than traditional methods. 
                        Your 15 washes this year saved 1,575 liters!
                      </p>
                    </div>
                    
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Recycle className="w-5 h-5 text-green-500" />
                        <span className="font-medium text-green-900">Chemical Reduction</span>
                      </div>
                      <p className="text-sm text-green-800">
                        100% biodegradable products mean zero harmful runoff. 
                        You've prevented 2.3kg of chemicals from entering waterways.
                      </p>
                    </div>
                    
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Globe className="w-5 h-5 text-purple-500" />
                        <span className="font-medium text-purple-900">Energy Efficiency</span>
                      </div>
                      <p className="text-sm text-purple-800">
                        Solar-powered equipment and LED lighting reduce energy consumption by 45%. 
                        That's 67kWh saved from your visits.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
