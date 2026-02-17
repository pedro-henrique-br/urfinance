import { supabase } from "@/config/supabase";
import type { NotificationSettings } from "@/types/notifications";
import { user } from "./auth";

export async function getNotificationSettings() {
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const { data, error } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('user_id', user?.user?.id)
    .maybeSingle();

  if (error) throw error;

  // Se não existir configuração, criar uma padrão
  if (!data) {
    return createDefaultNotificationSettings();
  }

  return { data, error: null };
}

export async function createDefaultNotificationSettings() {
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const defaultSettings = {
    user_id: user?.user?.id,
    email_notifications: true,
    push_notifications: true,
    overdue_alerts: true,
    upcoming_alerts: true,
    upcoming_days: 3,
  };

  const { data, error } = await supabase
    .from('notification_settings')
    .insert(defaultSettings)
    .select()
    .single();

  if (error) throw error;
  return { data, error: null };
}

export async function updateNotificationSettings(settings: Partial<NotificationSettings>) {
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  // Primeiro, tenta obter o registro existente
  const { data: existing, error: fetchError } = await supabase
    .from('notification_settings')
    .select('id')
    .eq('user_id', user?.user?.id)
    .maybeSingle();

  if (fetchError) throw fetchError;

  let result;
  if (!existing) {
    // Se não existe, cria um novo com os settings + padrões
    const defaultSettings = {
      user_id: user?.user?.id,
      email_notifications: true,
      push_notifications: true,
      overdue_alerts: true,
      upcoming_alerts: true,
      upcoming_days: 3,
      ...settings, // sobrescreve com os settings passados
    };
    const { data, error } = await supabase
      .from('notification_settings')
      .insert(defaultSettings)
      .select()
      .single();
    if (error) throw error;
    result = data;
  } else {
    // Se existe, atualiza
    const { data, error } = await supabase
      .from('notification_settings')
      .update(settings)
      .eq('user_id', user?.user?.id)
      .select()
      .single();
    if (error) throw error;
    result = data;
  }

  return { data: result, error: null };
}

// ==================== NOTIFICATIONS ====================

export async function getNotifications(options?: { unreadOnly?: boolean; limit?: number }) {
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user?.user?.id)
    .order('created_at', { ascending: false });

  if (options?.unreadOnly) {
    query = query.eq('is_read', false);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return { data, error: null };
}

export async function markNotificationAsRead(id: string) {
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .eq('user_id', user?.user?.id)
    .select()
    .single();

  if (error) throw error;
  return { data, error: null };
}

export async function markAllNotificationsAsRead() {
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user?.user?.id)
    .eq('is_read', false);

  if (error) throw error;
  return { success: true };
}

export async function deleteNotification(id: string) {
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id)
    .eq('user_id', user?.user?.id);

  if (error) throw error;
  return { success: true };
}

export async function getUnreadCount(): Promise<number> {
  if (!user) {
    return 0;
  }

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.user?.id)
    .eq('is_read', false);

  if (error) return 0;
  return count || 0;
}

export async function createIncomeNotification({
  type,
  title,
  message,
  reference_id,
}: {
  type: string;
  title: string;
  message: string;
  reference_id: string;
}) {
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: user?.user?.id,
      type,
      title,
      message,
      reference_id,
      reference_type: 'income',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}