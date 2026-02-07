import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PasswordConfirmDialog } from "@/components/settings/PasswordConfirmDialog";
import { useUserSettings } from "@/hooks/user/useUserSettings";
import { User, Bell, Camera, Loader2, X } from "lucide-react";
import { useAvatarContext } from "@/contexts/AvatarContext";

export const Page = () => {
  const [showProfileConfirm, setShowProfileConfirm] = useState(false);

  const { avatarPreview, avatarUrl, isLoadingAvatar, avatarError, handleAvatarSelect, cancelAvatarPreview } = useAvatarContext();

  const {
    fullName,
    setFullName,
    email,
    setEmail,
    pendingAvatarFile,
    profileErrors,
    savingProfile,
    // notificationSettings,
    // updateNotificationSettings,
    saveProfile,
  } = useUserSettings();

  const handleSaveProfileClick = () => {
    setShowProfileConfirm(true);
  };

  const displayAvatar = avatarPreview || avatarUrl;

  return (
    <MainLayout title="Configurações" subtitle="Gerencie seu perfil e preferências">
      <div className="container mx-auto max-w-4xl py-8">
        <h1 className="mb-8 font-display text-3xl font-bold text-foreground">Configurações</h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      {!isLoadingAvatar && <>
                        <AvatarImage src={displayAvatar} alt={"Avatar"} />
                        {!displayAvatar && (
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {<User className="h-5 w-5" />}
                          </AvatarFallback>
                        )}
                      </>}
                    </Avatar>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
                    >
                      <Camera className="h-4 w-4" />
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      className="hidden"
                      onChange={handleAvatarSelect}
                    />

                    {avatarPreview && (
                      <button
                        onClick={cancelAvatarPreview}
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-lg"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Foto do Perfil</h3>
                    <p className="text-sm text-muted-foreground">
                      {avatarPreview
                        ? "Prévia da nova foto - clique em Salvar para aplicar"
                        : "Clique no ícone para alterar sua foto (PNG, JPEG ou JPG)"
                      }
                    </p>
                    {avatarError && (
                      <p className="mt-1 text-sm text-destructive">{avatarError}</p>
                    )}
                    {pendingAvatarFile && (
                      <p className="mt-1 text-sm text-primary">
                        Arquivo selecionado: {pendingAvatarFile.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome completo</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Seu nome completo"
                      className={profileErrors.fullName ? "border-destructive" : ""}
                    />
                    {profileErrors.fullName && (
                      <p className="text-sm text-destructive">{profileErrors.fullName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className={profileErrors.email ? "border-destructive" : ""}
                    />
                    {profileErrors.email && (
                      <p className="text-sm text-destructive">{profileErrors.email}</p>
                    )}
                  </div>
                </div>

                <Button className="cursor-pointer" onClick={handleSaveProfileClick} disabled={savingProfile}>
                  {savingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar alterações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
                <CardDescription>
                  Configure quais notificações você deseja receber
                </CardDescription>
              </CardHeader>
              {/* <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <h4 className="font-medium text-foreground">Notificações por e-mail</h4>
                      <p className="text-sm text-muted-foreground">
                        Receba resumos e alertas por e-mail
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.email_notifications}
                      onCheckedChange={(value) =>
                        updateNotificationSettings("email_notifications", value)
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <h4 className="font-medium text-foreground">Notificações push</h4>
                      <p className="text-sm text-muted-foreground">
                        Receba notificações no navegador
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.push_notifications}
                      onCheckedChange={(value) =>
                        updateNotificationSettings("push_notifications", value)
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <h4 className="font-medium text-foreground">Alertas de vencimento</h4>
                      <p className="text-sm text-muted-foreground">
                        Parcelas, despesas e entradas vencidas
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.overdue_alerts}
                      onCheckedChange={(value) =>
                        updateNotificationSettings("overdue_alerts", value)
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <h4 className="font-medium text-foreground">Alertas de proximidade</h4>
                      <p className="text-sm text-muted-foreground">
                        Notificações de itens próximos ao vencimento
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.upcoming_alerts}
                      onCheckedChange={(value) =>
                        updateNotificationSettings("upcoming_alerts", value)
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <h4 className="font-medium text-foreground">Alertas de espaços</h4>
                      <p className="text-sm text-muted-foreground">
                        Notificações de espaços compartilhados
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.space_alerts}
                      onCheckedChange={(value) =>
                        updateNotificationSettings("space_alerts", value)
                      }
                    />
                  </div>
                </div>
              </CardContent> */}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <PasswordConfirmDialog
        open={showProfileConfirm}
        onOpenChange={setShowProfileConfirm}
        onConfirm={saveProfile}
        title="Confirmar alterações"
        description="Digite sua senha atual para salvar as alterações no perfil."
      />

    </MainLayout>
  );
}
