import { supabase } from "@/config/supabase";
import type { IncomeFormData } from "@/types/income";

async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getIncomes() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  return await supabase
    .from("incomes")
    .select(`
      *,
      income_categories ( id, name, color ),
      institutions ( id, name, logo_url )
    `)
    .eq("user_id", user.id)
    .order("income_date", { ascending: false });
}

export async function createIncome(data: IncomeFormData) {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const incomeData = {
    description: data.description.trim(),
    payment_type: data.payment_type.trim() || null,
    amount: data.amount,
    income_date: data.income_date,
    is_fixed: data.is_fixed,
    is_received: data.is_received,
    category_id: data.category_id,
    institution_id: data.institution_id,
    user_id: user.id,
  };

  return await supabase
    .from("incomes")
    .insert(incomeData)
    .select(`
      *,
      income_categories ( id, name, color ),
      institutions ( id, name, logo_url )
    `)
    .single();
}

export async function updateIncome(id: string, data: Partial<IncomeFormData>) {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const { data: existingIncome } = await supabase
    .from("incomes")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!existingIncome) {
    throw new Error('Income não encontrada');
  }

  const updateData: any = {};
  
  if (data.description !== undefined) {
    updateData.description = data.description.trim();
  }
  if (data.payment_type !== undefined) {
    updateData.payment_type = data.payment_type.trim() || null;
  }
  if (data.amount !== undefined) {
    updateData.amount = data.amount;
  }
  if (data.income_date !== undefined) {
    updateData.income_date = data.income_date;
  }
  if (data.is_fixed !== undefined) {
    updateData.is_fixed = data.is_fixed;
  }
  if (data.is_received !== undefined) {
    updateData.is_received = data.is_received;
  }
  if (data.category_id !== undefined) {
    updateData.category_id = data.category_id;
  }
  if (data.institution_id !== undefined) {
    updateData.institution_id = data.institution_id;
  }

  return await supabase
    .from("incomes")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select(`
      *,
      income_categories ( id, name, color ),
      institutions ( id, name, logo_url )
    `)
    .single();
}

export async function deleteIncome(id: string) {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const { data: existingIncome } = await supabase
    .from("incomes")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!existingIncome) {
    throw new Error('Income não encontrada');
  }

  return await supabase
    .from("incomes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
}