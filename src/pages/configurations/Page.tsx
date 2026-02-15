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
import { NotificationSettings } from "@/components/notifications/NotificationSettings";

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
            <NotificationSettings />
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
