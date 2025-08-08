
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Car, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  X,
  Settings 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  type: 'service' | 'weather' | 'promotion' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
}

export function SmartNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'service',
      title: 'Service Complete',
      message: 'Your Premium Wash & Wax is ready for pickup!',
      timestamp: new Date(Date.now() - 5 * 60000),
      isRead: false,
      priority: 'high'
    },
    {
      id: '2',
      type: 'weather',
      title: 'Weather Alert',
      message: 'Rain expected tomorrow. Perfect time for interior detailing!',
      timestamp: new Date(Date.now() - 30 * 60000),
      isRead: false,
      priority: 'medium'
    },
    {
      id: '3',
      type: 'promotion',
      title: 'Special Offer',
      message: '20% off Executive Package this weekend only!',
      timestamp: new Date(Date.now() - 2 * 3600000),
      isRead: true,
      priority: 'medium'
    },
    {
      id: '4',
      type: 'reminder',
      title: 'Maintenance Reminder',
      message: 'Its been 30 days since your last wax treatment.',
      timestamp: new Date(Date.now() - 24 * 3600000),
      isRead: false,
      priority: 'low'
    }
  ]);

  const [showSettings, setShowSettings] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'service': return <Car className="w-5 h-5 text-blue-600" />;
      case 'weather': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'promotion': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'reminder': return <Clock className="w-5 h-5 text-purple-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bell className="w-6 h-6 text-blue-600" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <h3 className="text-xl font-semibold">Smart Notifications</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} bg-gray-50 rounded-r-lg ${
                !notification.isRead ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className={`font-medium ${!notification.isRead ? 'font-semibold' : ''}`}>
                        {notification.title}
                      </h4>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                    <p className="text-xs text-gray-500">
                      {formatTimestamp(notification.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs"
                    >
                      Mark read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissNotification(notification.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {showSettings && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-gray-50 rounded-lg"
        >
          <h4 className="font-medium mb-3">Notification Preferences</h4>
          <div className="space-y-2 text-sm">
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span>Service updates</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span>Weather alerts</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span>Promotions & offers</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span>Maintenance reminders</span>
            </label>
          </div>
        </motion.div>
      )}
    </Card>
  );
}
