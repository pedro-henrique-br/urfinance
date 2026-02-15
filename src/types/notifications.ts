export interface NotificationSettings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  overdue_alerts: boolean;
  upcoming_alerts: boolean;
  upcoming_days: number;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'income_overdue' | 'income_upcoming' | 'income_received' | 'income_created';
  title: string;
  message: string;
  reference_id: string | null;
  reference_type: 'income' | null;
  is_read: boolean;
  created_at: string;
  expires_at: string | null;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  overdue_alerts: boolean;
  upcoming_alerts: boolean;
  upcoming_days: number;
}

export interface NotificationCount {
  total: number;
  unread: number;
}

export type NotificationType = 'income_overdue' | 'income_upcoming' | 'income_received' | 'income_created';