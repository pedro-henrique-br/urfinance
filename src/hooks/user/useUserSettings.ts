import { useEffect, useState } from "react";
import { supabase } from "@/config/supabase";
import { useAuth } from "@/hooks/user/useAuth";
import { toast } from "react-toastify";
import { reauthenticate } from "@/api/auth";
import { profileSchema } from "@/schemas/userSettings.schema";
import { useAvatarContext } from "@/contexts/AvatarContext";

export function useUserSettings() {
  const { user } = useAuth();
  const { cleanUserAvatars, cancelAvatarPreview, pendingAvatarFile, avatarUrl, setAvatarUrl } = useAvatarContext();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [originalFullName, setOriginalFullName] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");

  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!user) return;

    const name = user.user_metadata?.full_name ?? "";
    const mail = user.email ?? "";

    setFullName(name);
    setEmail(mail);

    setOriginalFullName(name);
    setOriginalEmail(mail);
  }, [user]);


  const validateProfile = () => {
    const parsed = profileSchema.safeParse({ fullName, email });

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.errors.forEach(err => {
        errors[String(err.path[0])] = err.message;
      });
      setProfileErrors(errors);
      return false;
    }

    setProfileErrors({});
    return true;
  };

  const saveProfile = async (password: string) => {
    if (!validateProfile()) return false;

    const hasChanges =
      fullName !== originalFullName ||
      email !== originalEmail ||
      !!pendingAvatarFile;

    if (!hasChanges) {
      toast.info("Nenhuma alteração para salvar");
      return false;
    }

    const confirmed = await reauthenticate(user?.email as string, password);
    if (!confirmed) return false;

    setSavingProfile(true);

    try {
      let newAvatarUrl = avatarUrl;

      /* =========================
         AVATAR FLOW
      ========================= */
      if (pendingAvatarFile) {
        await cleanUserAvatars();

        const AVATAR_PATH = `${user!.id}.png`;

        const { error: uploadError } = await supabase.storage
          .from("Avatars")
          .upload(AVATAR_PATH, pendingAvatarFile, {
            upsert: true,
            cacheControl: "0",
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("Avatars")
          .getPublicUrl(AVATAR_PATH);

        newAvatarUrl = `${data.publicUrl}?v=${Date.now()}`;

        const { error: avatarDbError } = await supabase
          .from("avatars")
          .upsert(
            {
              id: user!.id,
              url: data.publicUrl,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );

        if (avatarDbError) throw avatarDbError;
      }

      /* =========================
         EMAIL
      ========================= */
      if (email !== originalEmail) {
        const { error } = await supabase.auth.updateUser({ email });
        if (error) throw error;
      }

      /* =========================
         METADATA
      ========================= */
      const { error: metaError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          avatar_url: newAvatarUrl,
        },
      });

      if (metaError) throw metaError;

      setOriginalFullName(fullName);
      setOriginalEmail(email);
      setAvatarUrl(newAvatarUrl);
      cancelAvatarPreview();

      toast.success("Perfil atualizado com sucesso");
      return true;
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao salvar perfil");
      return false;
    } finally {
      setSavingProfile(false);
    }
  };

  return {
    fullName,
    setFullName,
    email,
    setEmail,
    avatarUrl,
    pendingAvatarFile,
    profileErrors,
    savingProfile,
    saveProfile,
  };
}
