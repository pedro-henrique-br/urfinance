import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/config/supabase";
import { useAuth } from "@/hooks/user/useAuth";
import { avatarSchema } from "@/schemas/userSettings.schema";

type AvatarContextType = {
  avatarUrl: string;
  avatarPreview: string | null;
  pendingAvatarFile: File | null;
  avatarError: string | null;

  isLoadingAvatar: boolean;
  isUploadingAvatar: boolean;

  handleAvatarSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  cancelAvatarPreview: () => void;
  cleanUserAvatars: () => Promise<void>;
  setAvatarUrl: (url: string) => void;
  setIsUploadingAvatar: (value: boolean) => void;
};

const AvatarContext = createContext<AvatarContextType | null>(null);

export function AvatarProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [isLoadingAvatar, setIsLoadingAvatar] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const fetchAvatar = async () => {
    if (!user) return;

    setIsLoadingAvatar(true);

    const { data } = await supabase
      .from("avatars")
      .select("url")
      .eq("id", user.id)
      .single();

    if (data?.url) {
      setAvatarUrl(`${data.url}?v=${Date.now()}`);
    }

    setIsLoadingAvatar(false);
  };

  useEffect(() => {
    fetchAvatar();
  }, [user]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const parsed = avatarSchema.safeParse({ file });
    if (!parsed.success) {
      setAvatarError(parsed.error.errors[0].message);
      return;
    }

    setAvatarError(null);
    setPendingAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const cancelAvatarPreview = () => {
    setPendingAvatarFile(null);
    setAvatarPreview(null);
    setAvatarError(null);
  };

  const cleanUserAvatars = async () => {
    if (!user) return;

    const { data: files } = await supabase.storage
      .from("Avatars")
      .list("", { search: user.id });

    if (!files?.length) return;

    const toDelete = files
      .filter(file => file.name.startsWith(user.id))
      .map(file => file.name);

    if (toDelete.length > 0) {
      await supabase.storage.from("Avatars").remove(toDelete);
    }
  };

  return (
    <AvatarContext.Provider
      value={{
        avatarUrl,
        avatarPreview,
        pendingAvatarFile,
        avatarError,
        isLoadingAvatar,
        isUploadingAvatar,
        handleAvatarSelect,
        cancelAvatarPreview,
        cleanUserAvatars,
        setAvatarUrl,
        setIsUploadingAvatar,
      }}
    >
      {children}
    </AvatarContext.Provider>
  );
}

/* =========================
   HOOK
========================= */
// eslint-disable-next-line react-refresh/only-export-components
export function useAvatarContext() {
  const ctx = useContext(AvatarContext);
  if (!ctx) {
    throw new Error("useAvatarContext must be used within AvatarProvider");
  }
  return ctx;
}
