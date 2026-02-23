export interface Budget {
  id: string;
  category_id: string;
  month: number;
  year: number;
  percentage: number | null;
  limit_amount: number | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  // relações
  expense_category?: ExpenseCategory;
  income_sources?: BudgetIncomeSource[];
}

export interface BudgetIncomeSource {
  id: string;
  budget_id: string;
  income_id: string;
  user_id: string;
  created_at: string;
  // opcional: dados da entrada
  income?: Income;
}

export interface BudgetFormData {
  category_id: string | null;
  month: number;
  year: number;
  percentage?: number | null;
  limit_amount?: number | null;
  income_ids: string[];
}

export interface BudgetWithStats extends Budget {
  total_expenses: number; // gasto no período para a categoria
  limit_calculated: number; // limite calculado (percentual ou fixo)
  balance: number; // saldo
  status: 'excedido' | 'dentro' | 'atencao' | 'sem_gastos';
}