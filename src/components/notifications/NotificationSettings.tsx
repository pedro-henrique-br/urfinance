import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Bell, AlertCircle } from 'lucide-react';
import { useNotificationsSettings } from '@/hooks/notifications/useNotificationsSettings';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const NotificationSettings = () => {
  const { settings, loading, updateSettings } = useNotificationsSettings();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleToggle = async (key: string, value: boolean) => {
    setSaving(true);
    const result = await updateSettings({ [key]: value });
    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  };

  const handleUpcomingDaysChange = async (days: number) => {
    if (days < 1 || days > 30) return;
    
    setSaving(true);
    const result = await updateSettings({ upcoming_days: days });
    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Preferências de Notificação
        </CardTitle>
        <CardDescription>
          Configure como e quando você quer ser notificado sobre suas entradas
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {success && (
          <Alert className="bg-green-50 border-green-200">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              Configurações salvas com sucesso!
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {/* Notificações por Email */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Notificações por e-mail</Label>
              <p className="text-sm text-muted-foreground">
                Receba alertas importantes no seu e-mail
              </p>
            </div>
            <Switch
              checked={settings?.email_notifications}
              onCheckedChange={(value) => handleToggle('email_notifications', value)}
              disabled={saving}
            />
          </div>

          {/* Notificações Push */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Notificações push</Label>
              <p className="text-sm text-muted-foreground">
                Receba notificações no navegador
              </p>
            </div>
            <Switch
              checked={settings?.push_notifications}
              onCheckedChange={(value) => handleToggle('push_notifications', value)}
              disabled={saving}
            />
          </div>

          {/* Alertas de vencimento */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Alertas de vencimento</Label>
              <p className="text-sm text-muted-foreground">
                Notificar quando uma entrada estiver vencida
              </p>
            </div>
            <Switch
              checked={settings?.overdue_alerts}
              onCheckedChange={(value) => handleToggle('overdue_alerts', value)}
              disabled={saving}
            />
          </div>

          {/* Alertas de proximidade */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Alertas de proximidade</Label>
              <p className="text-sm text-muted-foreground">
                Notificar quando uma entrada estiver próxima do vencimento
              </p>
            </div>
            <Switch
              checked={settings?.upcoming_alerts}
              onCheckedChange={(value) => handleToggle('upcoming_alerts', value)}
              disabled={saving}
            />
          </div>

          {/* Dias de antecedência */}
          {settings?.upcoming_alerts && (
            <div className="rounded-lg border p-4">
              <div className="space-y-2">
                <Label htmlFor="upcoming-days" className="text-base">
                  Dias de antecedência
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receber alertas com quantos dias de antecedência?
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    id="upcoming-days"
                    type="number"
                    min="1"
                    max="30"
                    value={settings.upcoming_days}
                    onChange={(e) => handleUpcomingDaysChange(parseInt(e.target.value))}
                    className="w-24"
                    disabled={saving}
                  />
                  <span className="text-sm text-muted-foreground">dias</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {saving && (
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Salvando configurações...
          </div>
        )}
      </CardContent>
    </Card>
  );
};