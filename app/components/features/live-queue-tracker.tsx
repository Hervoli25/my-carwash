
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Car, Users, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QueueItem {
  id: string;
  customerName: string;
  service: string;
  estimatedTime: number;
  status: 'waiting' | 'in-progress' | 'completed';
  position: number;
}

export function LiveQueueTracker() {
  const [queueData, setQueueData] = useState<QueueItem[]>([
    { id: '1', customerName: 'John D.', service: 'Premium Wash & Wax', estimatedTime: 45, status: 'in-progress', position: 1 },
    { id: '2', customerName: 'Sarah M.', service: 'Express Wash', estimatedTime: 20, status: 'waiting', position: 2 },
    { id: '3', customerName: 'Mike R.', service: 'Deluxe Detail', estimatedTime: 90, status: 'waiting', position: 3 },
    { id: '4', customerName: 'Lisa K.', service: 'Executive Package', estimatedTime: 120, status: 'waiting', position: 4 },
  ]);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // Simulate queue updates
      setQueueData(prev => prev.map(item => ({
        ...item,
        estimatedTime: item.status === 'in-progress' ? Math.max(0, item.estimatedTime - 1) : item.estimatedTime
      })));
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress': return 'bg-blue-500';
      case 'waiting': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-progress': return <Car className="w-4 h-4" />;
      case 'waiting': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <Users className="w-6 h-6 mr-2 text-blue-600" />
          Live Queue Status
        </h3>
        <Badge variant="outline" className="text-xs">
          Updated: {currentTime.toLocaleTimeString()}
        </Badge>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {queueData.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`} />
                  <span className="font-medium">#{item.position}</span>
                </div>
                <div>
                  <p className="font-medium">{item.customerName}</p>
                  <p className="text-sm text-gray-600">{item.service}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="flex items-center text-sm">
                    {getStatusIcon(item.status)}
                    <span className="ml-1 capitalize">{item.status.replace('-', ' ')}</span>
                  </div>
                  {item.status !== 'completed' && (
                    <p className="text-xs text-gray-500">
                      ~{item.estimatedTime} min
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800 text-center">
          <Clock className="w-4 h-4 inline mr-1" />
          Average wait time: 15 minutes | Current queue: {queueData.length} customers
        </p>
      </div>
    </Card>
  );
}
