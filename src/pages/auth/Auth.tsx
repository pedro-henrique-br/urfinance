import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/hooks/user/useAuth";
import { loginSchema, signupSchema } from "@/schemas/auth.schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";


import {
  ArrowRight,
  Mail,
  Lock,
  User,
} from "lucide-react";
import { toast } from "react-toastify";

import logo from '/assets/images/logo/urfinance.png'
import { Spinner } from "@/components/ui/spinner";
import { sendPasswordReset } from "@/api/auth";

export default function Auth() {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupFullName, setSignupFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] =
    useState("");

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const validation = loginSchema.safeParse({
      email: loginEmail,
      password: loginPassword,
    });

    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      setIsLoading(false);
      return;
    }

    const { error } = await signIn(loginEmail, loginPassword);

    if (error) {
      let message = "Erro ao fazer login";

      if (error.message.includes("Invalid login credentials")) {
        message = "Email ou senha incorretos";
      }

      if (error.message.includes("Email not confirmed")) {
        message = "Confirme seu email antes de entrar";
      }

      toast.error(message);
    } else {
      toast.success("Login realizado com sucesso");
      navigate("/");
    }

    setIsLoading(false);
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const validation = signupSchema.safeParse({
      fullName: signupFullName,
      email: signupEmail,
      password: signupPassword,
      confirmPassword: signupConfirmPassword,
    });

    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(
      signupEmail,
      signupPassword,
      signupFullName
    );

    if (error) {
      let message = "Erro ao criar conta";

      if (error.message.includes("User already registered")) {
        message = "Este email já está cadastrado";
      }

      if (error.message.includes("Password should be")) {
        message = "Senha deve ter pelo menos 6 caracteres";
      }

      toast.error(message);
    } else {
      toast.success(
        "Conta criada! Verifique seu email para confirmar a conta."
      );
    }

    setIsLoading(false);
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

  async function handleForgotPassword() {
    if (!loginEmail) {
      toast.error("Informe seu email primeiro");
      return;
    }

    const { error } = await sendPasswordReset(loginEmail);

    if (error) {
      toast.error("Não foi possível enviar o email de redefinição");
      return;
    }

    toast.success(
      "Email de redefinição enviado! Verifique sua caixa de entrada."
    );
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-1 mb-1">
            <img alt="Urfinance logo" src={logo} className="w-20 h-20" />
            <h1 className="text-3xl font-bold">
              UrFinance
            </h1>
          </div>
          <p className="text-muted-foreground">
            Gerencie suas finanças de forma inteligente
          </p>
        </div>

        <Card className="shadow-xl">
          <Tabs defaultValue="login">
            <CardHeader className="pb-4">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="login">
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="signup">
                  Criar conta
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              <TabsContent value="login">
                <form
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        className="pl-10"
                        placeholder="email@provedor.com"
                        type="email"
                        value={loginEmail}
                        onChange={(e) =>
                          setLoginEmail(e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        className="pl-10"
                        placeholder="●●●●●●●●●"
                        type="password"
                        value={loginPassword}
                        onChange={(e) =>
                          setLoginPassword(e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Button
                      type="submit"
                      className="w-full gap-2 cursor-pointer"
                      disabled={isLoading}
                    >
                      {isLoading
                        ? <Spinner />
                        : "Entrar"}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>

                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="cursor-pointer text-sm text-primary hover:underline text-left w-full"
                  >
                    Esqueci minha senha
                  </button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form
                  onSubmit={handleSignup}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>Nome completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Jonhy Blaze"
                        className="pl-10"
                        value={signupFullName}
                        onChange={(e) =>
                          setSignupFullName(e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        className="pl-10"
                        type="email"
                        value={signupEmail}
                        placeholder="email@provedor.com"
                        onChange={(e) =>
                          setSignupEmail(e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        className="pl-10"
                        type="password"
                        placeholder="●●●●●●●●●"
                        value={signupPassword}
                        onChange={(e) =>
                          setSignupPassword(e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Confirmar senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        className="pl-10"
                        type="password"
                        placeholder="●●●●●●●●●"
                        value={signupConfirmPassword}
                        onChange={(e) =>
                          setSignupConfirmPassword(
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full gap-2 cursor-pointer"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? <Spinner />
                      : "Criar conta"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Ao continuar, você concorda com nossos termos.
        </p>
      </div>
    </div>
  );
}
