import { supabase } from "@/config/supabase";
import { toast } from "react-toastify";

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  return supabase.auth.getSession();
}

export async function reauthenticate(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email: email,
    password,
  });

  if (error) {
    toast.error("Senha incorreta");
    return false;
  }

  return true;
};

export async function sendPasswordReset(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
}


export const { data } = await supabase.auth.getSession();
export const { data: user} = await supabase.auth.getUser();