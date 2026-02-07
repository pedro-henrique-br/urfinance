import { Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAvatarContext } from "@/contexts/AvatarContext";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const navigate = useNavigate();
  const {
    avatarPreview,
    avatarUrl,
    isLoadingAvatar
  } = useAvatarContext()

  const displayAvatar = avatarPreview || avatarUrl;

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border bg-background/80 px-8 backdrop-blur-md">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />

        <Button
          variant="ghost"
          size="icon"
          className="group rounded-full cursor-pointer"
          onClick={() => navigate("/configuracoes")}
        >
          <div className="relative h-9 w-9">
            <Avatar className="h-9 w-9 transition-opacity duration-200">
              {!isLoadingAvatar && <>
                <AvatarImage src={displayAvatar} alt={"Avatar"} />
                {!displayAvatar && (
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {<User className="h-5 w-5" />}
                  </AvatarFallback>
                )}
              </>}
            </Avatar>

            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <Settings className="h-5 w-5" />
            </div>
          </div>
        </Button>
      </div>
    </header>
  );
}
