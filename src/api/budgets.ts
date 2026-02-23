import { supabase } from "@/config/supabase";
import type { Budget, BudgetFormData, BudgetWithStats } from "@/types/budget";

async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getBudgets(month: number, year: number) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('expense_budgets')
    .select(`
      *,
      expense_category:expense_categories(id, name, color),
      income_sources:budget_income_sources(
        id,
        income_id,
        income:incomes(id, description, amount, income_date)
      )
    `)
    .eq('user_id', user.id)
    .eq('month', month)
    .eq('year', year);

  if (error) throw error;
  return { data, error: null };
}

export async function createBudget(formData: BudgetFormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Inserir budget
   const { data: budget, error: budgetError } = await supabase
    .from('expense_budgets')
    .insert({
      category_id: formData.category_id,
      month: formData.month,
      year: formData.year,
      percentage: formData.percentage,
      limit_amount: formData.limit_amount,
      user_id: user.id,
    })
    .select()
    .single();

  if (budgetError) throw budgetError;

  // Inserir fontes de renda
  if (formData.income_ids.length > 0) {
    const sources = formData.income_ids.map(income_id => ({
      budget_id: budget.id,
      income_id,
      user_id: user.id,
    }));
    const { error: sourcesError } = await supabase
      .from('budget_income_sources')
      .insert(sources);
    if (sourcesError) throw sourcesError;
  }

  return budget;
}

export async function updateBudget(id: string, formData: BudgetFormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Atualizar budget
  const { error: updateError } = await supabase
    .from('expense_budgets')
    .update({
      category_id: formData.category_id,
      month: formData.month,
      year: formData.year,
      percentage: formData.percentage,
      limit_amount: formData.limit_amount,
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (updateError) throw updateError;

  // Atualizar fontes de renda: deletar antigas e inserir novas
  const { error: deleteError } = await supabase
    .from('budget_income_sources')
    .delete()
    .eq('budget_id', id);
  if (deleteError) throw deleteError;

  if (formData.income_ids.length > 0) {
    const sources = formData.income_ids.map(income_id => ({
      budget_id: id,
      income_id,
    }));
    const { error: insertError } = await supabase
      .from('budget_income_sources')
      .insert(sources);
    if (insertError) throw insertError;
  }

  return { success: true };
}

export async function deleteBudget(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { error } = await supabase
    .from('expense_budgets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
  return { success: true };
}