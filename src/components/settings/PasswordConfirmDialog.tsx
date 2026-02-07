import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface PasswordConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (password: string) => Promise<boolean>;
  title: string;
  description: string;
}

export function PasswordConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
}: PasswordConfirmDialogProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!password.trim()) return;
    
    setLoading(true);
    const success = await onConfirm(password);
    setLoading(false);
    
    if (success) {
      setPassword("");
      onOpenChange(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setPassword("");
    }
    onOpenChange(open);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <Label htmlFor="confirm-password">Senha atual</Label>
          <Input
            id="confirm-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua senha atual"
            className="mt-2"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading) {
                handleConfirm();
              }
            }}
          />
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer" disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction className="cursor-pointer" onClick={handleConfirm} disabled={loading || !password.trim()}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
