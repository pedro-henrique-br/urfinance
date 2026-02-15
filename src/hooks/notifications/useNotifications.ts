import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/user/useAuth';
import { useIncomes } from '@/hooks/incomes/useIncomes';
import { useNotificationsSettings } from '@/hooks/notifications/useNotificationsSettings';
import * as notificationsApi from '@/api/notifications';
import type { Notification } from '@/types/notifications';
import { addDays, isAfter, isBefore, parseISO } from 'date-fns';
import { supabase } from '@/config/supabase';

export const useNotifications = () => {
  const { user } = useAuth();
  const { incomes } = useIncomes();
  const { settings, loading: settingsLoading } = useNotificationsSettings();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar notificações do banco
  const loadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await notificationsApi.getNotifications({ limit: 50 });
      
      if (error) throw error;
      
      setNotifications(data || []);
      
      // Atualizar contador de não lidas
      const count = await notificationsApi.getUnreadCount();
      setUnreadCount(count);
    } catch (err: any) {
      console.error('Erro ao carregar notificações:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Verificar entradas vencidas e próximas
  const checkIncomesForNotifications = useCallback(async () => {
    if (!user || !settings || settingsLoading) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const income of incomes) {
      // Ignorar entradas já recebidas
      if (income.is_received) continue;

      const dueDate = parseISO(income.income_date);
      dueDate.setHours(0, 0, 0, 0);

      // Verificar se já existe notificação para esta entrada
      const existingNotification = notifications.find(
        n => n.reference_id === income.id && 
        (n.type === 'income_overdue' || n.type === 'income_upcoming')
      );

      // NOTIFICAÇÃO DE VENCIMENTO (entrada passou da data)
      if (settings.overdue_alerts && isBefore(dueDate, today)) {
        if (!existingNotification || existingNotification.type !== 'income_overdue') {
          await createIncomeNotification({
            type: 'income_overdue',
            income,
            dueDate,
          });
        }
      }

      // NOTIFICAÇÃO DE PROXIMIDADE (entrada próxima do vencimento)
      if (settings.upcoming_alerts) {
        const upcomingDate = addDays(today, settings.upcoming_days);
        
        if (isAfter(dueDate, today) && isBefore(dueDate, upcomingDate)) {
          if (!existingNotification || existingNotification.type !== 'income_upcoming') {
            await createIncomeNotification({
              type: 'income_upcoming',
              income,
              dueDate,
            });
          }
        }
      }
    }
  }, [user, incomes, settings, settingsLoading, notifications]);

  // Criar notificação para entrada
  const createIncomeNotification = useCallback(async ({
    type,
    income,
    dueDate,
  }: {
    type: 'income_overdue' | 'income_upcoming';
    income: any;
    dueDate: Date;
  }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let title = '';
    let message = '';
    
    if (type === 'income_overdue') {
      const daysLate = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      title = '💰 Entrada atrasada';
      message = `"${income.description}" está ${daysLate} ${daysLate === 1 ? 'dia' : 'dias'} atrasada. Verifique o pagamento!`;
    } else if (type === 'income_upcoming') {
      const daysUntil = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      title = '⏰ Entrada próxima';
      message = `"${income.description}" vence em ${daysUntil} ${daysUntil === 1 ? 'dia' : 'dias'}. Prepare-se para receber!`;
    }

    // Criar notificação no banco
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        type,
        title,
        message,
        reference_id: income.id,
        reference_type: 'income',
        expires_at: type === 'income_overdue' 
          ? addDays(new Date(), 30).toISOString() // Expira em 30 dias
          : dueDate.toISOString(), // Expira na data de vencimento
      })
      .select()
      .single();

    if (!error && data) {
      setNotifications(prev => [data, ...prev]);
      setUnreadCount(prev => prev + 1);
    }
  }, [user]);

  // Marcar notificação como lida
  const markAsRead = useCallback(async (id: string) => {
    try {
      const { data } = await notificationsApi.markNotificationAsRead(id);
      
      if (data) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err);
    }
  }, []);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllNotificationsAsRead();
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Erro ao marcar todas como lidas:', err);
    }
  }, []);

  // Deletar notificação
  const deleteNotification = useCallback(async (id: string) => {
    try {
      const notification = notifications.find(n => n.id === id);
      await notificationsApi.deleteNotification(id);
      
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Erro ao deletar notificação:', err);
    }
  }, [notifications]);

  // Carregar notificações ao montar
  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user, loadNotifications]);

  // Verificar entradas periodicamente
  useEffect(() => {
    if (!user || !settings) return;

    // Verificar imediatamente
    checkIncomesForNotifications();

    // Verificar a cada hora
    const interval = setInterval(checkIncomesForNotifications, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, settings, checkIncomesForNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: loadNotifications,
  };
};