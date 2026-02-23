import { useMemo } from 'react';
import { useIncomes } from '@/hooks/incomes/useIncomes';
import { useExpenses } from '@/hooks/expenses/useExpenses';
import { useBudgets } from '@/hooks/expenses/useBudgets';
import { startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';

interface DashboardData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
  incomeByCategory: { name: string; value: number }[];
  expenseByCategory: { name: string; value: number; color?: string }[];
  budgetProgress: {
    categoryId: string;
    categoryName: string;
    color?: string;
    limit: number;
    spent: number;
    percentage: number;
    status: 'exceeded' | 'on_track' | 'attention' | 'no_spending';
  }[];
}

export const useDashboardData = (month: number, year: number) => {
  const { incomes } = useIncomes();
  const { expenses } = useExpenses();
  const { budgets } = useBudgets(month, year);

  const data = useMemo<DashboardData>(() => {
    const start = startOfMonth(new Date(year, month - 1));
    const end = endOfMonth(start);

    // Filtrar entradas do mês
    const monthIncomes = incomes.filter(inc => {
      const date = parseISO(inc.income_date);
      return isWithinInterval(date, { start, end });
    });

    // Filtrar despesas do mês
    const monthExpenses = expenses.filter(exp => {
      const date = parseISO(exp.expense_date);
      return isWithinInterval(date, { start, end });
    });

    const totalIncome = monthIncomes.reduce((sum, inc) => sum + inc.amount, 0);
    const totalExpense = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

    // Agrupar despesas por categoria (nome da categoria)
    const expenseMap = new Map<string, { value: number; color?: string }>();
    monthExpenses.forEach(exp => {
      const catName = exp.expense_type?.expense_category?.name || 'Outros';
      const color = exp.expense_type?.expense_category?.color;
      const current = expenseMap.get(catName) || { value: 0, color };
      expenseMap.set(catName, { value: current.value + exp.amount, color: color || current.color });
    });
    const expenseByCategory = Array.from(expenseMap.entries()).map(([name, { value, color }]) => ({
      name,
      value,
      color,
    }));

    // Progresso dos orçamentos
    const budgetProgress = budgets.map(budget => ({
      categoryId: budget.category_id!,
      categoryName: budget.expense_category?.name || 'Sem categoria',
      color: budget.expense_category?.color,
      limit: budget.limit_calculated,
      spent: budget.spent,
      percentage: budget.limit_calculated > 0 ? (budget.spent / budget.limit_calculated) * 100 : 0,
      status: budget.status,
    }));

    return {
      totalIncome,
      totalExpense,
      balance,
      savingsRate,
      incomeByCategory: [], // se quiser agrupar entradas por categoria (opcional)
      expenseByCategory,
      budgetProgress,
    };
  }, [incomes, expenses, budgets, month, year]);

  return data;
};