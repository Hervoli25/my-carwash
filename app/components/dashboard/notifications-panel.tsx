
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bell,
  Calendar,
  Gift,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsPanelProps {
  notifications: Notification[];
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'booking':
      return <Calendar className="w-4 h-4 text-blue-600" />;
    case 'promotion':
      return <Gift className="w-4 h-4 text-green-600" />;
    case 'reminder':
      return <Bell className="w-4 h-4 text-yellow-600" />;
    case 'system':
      return <CheckCircle className="w-4 h-4 text-gray-600" />;
    default:
      return <AlertCircle className="w-4 h-4 text-gray-600" />;
  }
};

const getNotificationBadge = (type: string) => {
  switch (type) {
    case 'booking':
      return <Badge variant="outline" className="text-xs">Booking</Badge>;
    case 'promotion':
      return <Badge className="bg-green-100 text-green-700 text-xs">Promotion</Badge>;
    case 'reminder':
      return <Badge className="bg-yellow-100 text-yellow-700 text-xs">Reminder</Badge>;
    case 'system':
      return <Badge variant="outline" className="text-xs">System</Badge>;
    default:
      return <Badge variant="outline" className="text-xs">{type}</Badge>;
  }
};

export function NotificationsPanel({ notifications }: NotificationsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Notifications</CardTitle>
          <Badge variant="outline" className="text-xs">
            {notifications.filter(n => !n.isRead).length} new
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No notifications</p>
        ) : (
          <div className="space-y-4">
            {notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${
                  notification.isRead ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </p>
                      {getNotificationBadge(notification.type)}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(new Date(notification.createdAt))}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {notifications.length > 5 && (
              <div className="text-center pt-2">
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  View all notifications
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
