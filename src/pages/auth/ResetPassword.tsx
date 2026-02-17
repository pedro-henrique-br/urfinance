import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "@/config/supabase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

import { Lock, Mail, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";

import logo from "/assets/images/logo/urfinance.png";
import { Spinner } from "@/components/ui/spinner";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        toast.error("Link inválido ou expirado");
        return;
      }

      setEmail(data.session.user.email ?? "");
      setLoading(false);
    }

    loadSession();
  }, [navigate]);

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      toast.error("Erro ao redefinir senha");
      setSaving(false);
      return;
    }

    toast.success("Senha redefinida com sucesso!");
    navigate("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-muted-foreground animate-pulse">
          Carregando...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-1 mb-1">
            <img alt="Urfinance logo" src={logo} className="w-20 h-20" />
            <h1 className="text-3xl font-bold">UrFinance</h1>
          </div>
          <p className="text-muted-foreground">
            Redefina sua senha
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="pb-4">
            <h2 className="text-lg font-semibold text-center">
              Nova senha
            </h2>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    value={email}
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    type="password"
                    placeholder="●●●●●●●●●"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Confirmar nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    type="password"
                    placeholder="●●●●●●●●●"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gap-2 cursor-pointer"
                disabled={saving}
              >
                {saving ? <Spinner /> : "Redefinir senha"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <button
          onClick={() => navigate("/login")}
          className="mt-6 flex items-center justify-center gap-2 w-full text-sm text-muted-foreground hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o login
        </button>
      </div>
    </div>
  );
}
