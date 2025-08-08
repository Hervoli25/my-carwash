
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Car, 
  CheckCircle, 
  Clock, 
  Camera, 
  MapPin,
  Bell,
  Star,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface TrackingStage {
  id: string;
  name: string;
  icon?: React.ReactNode;
  completed: boolean;
  current: boolean;
  estimatedTime: number;
  actualTime?: number;
  photo?: string;
  notes?: string;
}

interface RealTimeTrackingProps {
  bookingId: string;
  isDemo?: boolean;
}

export function RealTimeTracking({ bookingId, isDemo = false }: RealTimeTrackingProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [stages, setStages] = useState<TrackingStage[]>([]);
  const [totalProgress, setTotalProgress] = useState(0);
  const [estimatedCompletion, setEstimatedCompletion] = useState<string>('');
  const [actualCompletion, setActualCompletion] = useState<string>('');
  const [startsAt, setStartsAt] = useState<string>('');
  const [overdue, setOverdue] = useState<boolean>(false);
  const [overdueMinutes, setOverdueMinutes] = useState<number>(0);

  // Production: fetch tracking data from backend and poll
  useEffect(() => {
    let timer: any;

    async function load() {
      try {
        const res = await fetch(`/api/bookings/${bookingId}/tracking`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        setStages(
          data.stages.map((s: any) => ({
            id: s.id,
            name: s.name,
            completed: !!s.completed,
            current: !!s.current,
            estimatedTime: s.estimatedTime,
          }))
        );
        setTotalProgress(data.totalProgress ?? 0);
        if (data.estimatedCompletion) {
          const d = new Date(data.estimatedCompletion);
          setEstimatedCompletion(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
        if (data.actualCompletion) {
          const d = new Date(data.actualCompletion);
          setActualCompletion(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        } else {
          setActualCompletion('');
        }
      } catch (e) {
        // swallow
      }
    }

    load();
    timer = setInterval(load, 10000); // poll every 10s

    return () => clearInterval(timer);
  }, [bookingId]);

  const completedStages = stages.filter(stage => stage.completed).length;
  const currentStageData = stages.find(stage => stage.current);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-0">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Live Service Tracking</h3>
              <p className="text-sm text-gray-600">Booking #EKH-{bookingId}</p>
              {startsAt && (
                <p className="text-xs text-gray-500">Starts at {new Date(startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              )}
              {overdue && (
                <p className="text-xs text-red-600">Overdue start by {overdueMinutes} min</p>
              )}
            </div>
            <Badge className="bg-green-500 text-white animate-pulse">
              <Bell className="w-3 h-3 mr-1" />
              LIVE
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{completedStages}/{stages.length} stages completed</span>
            </div>
            <Progress value={totalProgress} className="h-2" />
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Estimated completion:</span>
              <span className="font-medium text-blue-600">{estimatedCompletion}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Stage Highlight */}
      {currentStageData && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-blue-500 text-white rounded-full">
                    {currentStageData.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{currentStageData.name}</h4>
                    <p className="text-sm text-gray-600">Currently in progress</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-600">
                      ~{currentStageData.estimatedTime} min
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      Active
                    </div>
                  </div>
                </div>
                {currentStageData.notes && (
                  <p className="text-sm text-gray-600 bg-white rounded p-2 border">
                    {currentStageData.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}

      {/* All Stages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Service Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stages.map((stage, index) => (
              <div key={stage.id} className="flex items-start space-x-4">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className={`
                    p-2 rounded-full border-2 transition-all duration-300
                    ${stage.completed 
                      ? 'bg-green-500 text-white border-green-500' 
                      : stage.current 
                        ? 'bg-blue-500 text-white border-blue-500 animate-pulse' 
                        : 'bg-gray-100 text-gray-400 border-gray-200'
                    }
                  `}>
                    {stage.completed ? <CheckCircle className="w-4 h-4" /> : stage.icon}
                  </div>
                  {index < stages.length - 1 && (
                    <div className={`
                      w-0.5 h-8 mt-2 transition-all duration-300
                      ${stage.completed ? 'bg-green-300' : 'bg-gray-200'}
                    `} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`
                      font-medium transition-colors
                      ${stage.completed 
                        ? 'text-green-700' 
                        : stage.current 
                          ? 'text-blue-700' 
                          : 'text-gray-500'
                      }
                    `}>
                      {stage.name}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs">
                      {stage.actualTime && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          {stage.actualTime} min
                        </Badge>
                      )}
                      {!stage.completed && (
                        <span className="text-gray-500">~{stage.estimatedTime} min</span>
                      )}
                    </div>
                  </div>
                  
                  {stage.notes && (
                    <p className="text-sm text-gray-600 mb-2">{stage.notes}</p>
                  )}
                  
                  {stage.photo && (
                    <div className="mt-2">
                      <Image
                        src={stage.photo}
                        alt={`${stage.name} photo`}
                        width={200}
                        height={120}
                        className="rounded border object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" className="flex-1">
          <Bell className="w-4 h-4 mr-2" />
          Enable Notifications
        </Button>
        <Button variant="outline" className="flex-1">
          <Camera className="w-4 h-4 mr-2" />
          Request Update Photo
        </Button>
      </div>
    </div>
  );
}
