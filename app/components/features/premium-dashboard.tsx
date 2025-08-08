
'use client';

import { motion } from 'framer-motion';
import { LiveQueueTracker } from './live-queue-tracker';
import { SmartNotifications } from './smart-notifications';
import { CarHealthMonitor } from './car-health-monitor';

export function PremiumDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-12">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Premium Customer Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the future of car care with real-time tracking, smart notifications, 
            and comprehensive vehicle health monitoring.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="xl:col-span-1"
          >
            <LiveQueueTracker />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="xl:col-span-1"
          >
            <SmartNotifications />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="xl:col-span-1"
          >
            <CarHealthMonitor />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
