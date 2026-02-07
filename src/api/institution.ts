import { supabase } from "@/config/supabase";
import { user } from "./auth";

export async function getInstitutions() {
  const { data, error } = await supabase
    .from("institutions")
    .select("*")
    .order("name");

  if (error) throw error;
  return data;
}

export async function createInstitution(name: string) {
  const user_id = user?.user?.id
  const { data, error } = await supabase
    .from("institutions")
    .insert({ name, user_id: user_id })
    .select()
    .single();

  if (error) throw error;
  return data;
}
