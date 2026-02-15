import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/user/useAuth';
import * as notificationsApi from '@/api/notifications';
import type { NotificationSettings, NotificationPreferences } from '@/types/notifications';

export const useNotificationsSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await notificationsApi.getNotificationSettings();
      
      if (error) throw error;
      
      setSettings(data);
    } catch (err: any) {
      console.error('Erro ao carregar configurações:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateSettings = useCallback(async (newSettings: Partial<NotificationPreferences>) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    try {
      setLoading(true);
      const { data, error } = await notificationsApi.updateNotificationSettings(newSettings);
      
      if (error) throw error;
      
      setSettings(data);
      return { success: true, data };
    } catch (err: any) {
      console.error('Erro ao atualizar configurações:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    refresh: loadSettings,
  };
};