import { supabase } from "@/config/supabase";
import type { ExpenseFormData } from "@/types/expenses";
import { user } from "./auth";

async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ==================== EXPENSE CATEGORIES ====================
export async function getExpenseCategories() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('expense_categories')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true });

  if (error) throw error;
  return { data, error: null };
}

export async function createExpenseCategory(name: string, color?: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('expense_categories')
    .insert({ name, color, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==================== EXPENSE TYPES ====================
export async function getExpenseTypes() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('expense_types')
    .select(`
      *,
      category:expense_categories(id, name, color)
    `)
    .eq('user_id', user.id)
    .order('name', { ascending: true });

  if (error) throw error;
  return { data, error: null };
}

export async function createExpenseType(name: string, category_id?: string | null) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('expense_types')
    .insert({ name, category_id, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==================== EXPENSES ====================
export async function getExpenses(order: 'asc' | 'desc' = 'desc') {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('expenses')
    .select(`
      *,
      expense_type:expense_types(
        id,
        name,
        category_id,
        expense_category:expense_categories(id, name, color)
      ),
      institutions(id, name, logo_url)
    `)
    .eq('user_id', user.id)
    .order('expense_date', { ascending: false });

  if (error) throw error;
  return { data, error: null };
}

export async function createExpense(data: ExpenseFormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const expenseData = {
    description: data.description.trim(),
    amount: data.amount,
    expense_type_id: data.expense_type_id,
    institution_id: data.institution_id,
    payment_type: data.payment_type.trim() || null,
    expense_date: data.expense_date,
    payment_date: data.payment_date || null,
    is_paid: data.is_paid,
    user_id: user.id,
  };

  const { data: inserted, error } = await supabase
    .from('expenses')
    .insert(expenseData)
    .select()
    .single();

  if (error) throw error;
  return inserted;
}

export async function updateExpense(id: string, data: Partial<ExpenseFormData>) {
  if (!user) throw new Error('Usuário não autenticado');

  const updateData: any = {};
  if (data.description !== undefined) updateData.description = data.description.trim();
  if (data.amount !== undefined) updateData.amount = data.amount;
  if (data.expense_type_id !== undefined) updateData.expense_type_id = data.expense_type_id;
  if (data.institution_id !== undefined) updateData.institution_id = data.institution_id;
  if (data.payment_type !== undefined) updateData.payment_type = data.payment_type.trim() || null;
  if (data.expense_date !== undefined) updateData.expense_date = data.expense_date;
  if (data.payment_date !== undefined) updateData.payment_date = data.payment_date || null;
  if (data.is_paid !== undefined) updateData.is_paid = data.is_paid;

  const { data: updated, error } = await supabase
    .from('expenses')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user?.user.id)
    .select(`
      *,
      expense_type:expense_types(
        id,
        name,
        category_id,
        expense_category:expense_categories(id, name, color)
      ),
      institutions(id, name, logo_url)
    `)
    .single();

  if (error) throw error;
  return updated;
}

export async function deleteExpense(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
  return { success: true };
}

// ==================== BUDGETS ====================
export async function getBudgets(month: number, year: number) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('expense_budgets')
    .select(`
      *,
      category:expense_categories(id, name, color)
    `)
    .eq('user_id', user.id)
    .eq('month', month)
    .eq('year', year);

  if (error) throw error;
  return { data, error: null };
}

export async function upsertBudget(category_id: string, month: number, year: number, percentage?: number, limit_amount?: number) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('expense_budgets')
    .upsert({
      user_id: user.id,
      category_id,
      month,
      year,
      percentage,
      limit_amount,
    }, { onConflict: 'user_id,category_id,month,year' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==================== MONTHLY INCOME ====================
export async function getMonthlyIncome(month: number, year: number) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('monthly_incomes')
    .select('*')
    .eq('user_id', user.id)
    .eq('month', month)
    .eq('year', year)
    .maybeSingle();

  if (error) throw error;
  return { data, error: null };
}

export async function upsertMonthlyIncome(month: number, year: number, total_income: number) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('monthly_incomes')
    .upsert({
      user_id: user.id,
      month,
      year,
      total_income,
    }, { onConflict: 'user_id,month,year' })
    .select()
    .single();

  if (error) throw error;
  return data;
}