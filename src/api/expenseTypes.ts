import { supabase } from "@/config/supabase";

async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getExpenseTypes() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('expense_types')
    .select(`
      *,
      expense_category:expense_categories(id, name, color)
    `)
    .eq('user_id', user.id)
    .order('name', { ascending: true });

  if (error) throw error;
  return { data, error: null };
}

export async function createExpenseType(name: string, categoryId: string | null) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Insere o tipo com category_id
  const { data, error } = await supabase
    .from('expense_types')
    .insert({
      name: name.trim(),
      category_id: categoryId,
      user_id: user.id,
    })
    .select(`
      *,
      expense_category:expense_categories(id, name, color)
    `)
    .single();

  if (error) throw error;
  return data; // retorna o objeto completo com a relação
}

export async function updateExpenseType(id: string, updates: { name?: string; category_id?: string | null }) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('expense_types')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select(`
      *,
      expense_category:expense_categories(id, name, color)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteExpenseType(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Verifica se há despesas vinculadas
  const { count, error: countError } = await supabase
    .from('expenses')
    .select('*', { count: 'exact', head: true })
    .eq('expense_type_id', id)
    .eq('user_id', user.id);

  if (countError) throw countError;
  if (count && count > 0) {
    throw new Error('Não é possível excluir tipo com despesas vinculadas');
  }

  const { error } = await supabase
    .from('expense_types')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
  return { success: true };
}