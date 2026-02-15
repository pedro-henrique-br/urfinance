export interface ExpenseCategory {
  id: string;
  name: string;
  color?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseType {
  id: string;
  name: string;
  category_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  category?: ExpenseCategory; // opcional, para join
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  expense_type_id: string | null;
  institution_id: string | null;
  payment_type: string | null;
  expense_date: string; // formato YYYY-MM-DD
  payment_date: string | null; // formato YYYY-MM-DD
  is_paid: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  // joins opcionais
  expense_types?: ExpenseType;
  institutions?: {
    id: string;
    name: string;
    logo_url?: string;
  };
}

export interface ExpenseBudget {
  id: string;
  category_id: string;
  month: number;
  year: number;
  percentage?: number;
  limit_amount?: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  category?: ExpenseCategory;
}

export interface MonthlyIncome {
  id: string;
  user_id: string;
  month: number;
  year: number;
  total_income: number;
  created_at: string;
  updated_at: string;
}

export interface ExpenseFormData {
  description: string;
  amount: number;
  expense_type_id: string | null;
  institution_id: string | null;
  payment_type: string;
  expense_date: string;
  payment_date: string | null;
  is_paid: boolean;
}