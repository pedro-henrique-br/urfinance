import { useState, useMemo } from 'react';
import type { Expense } from '@/types/expenses';
import type { ExpenseFilterState } from '@/pages/expenses/ExpenseFilters';
import { isWithinInterval, parseISO } from 'date-fns';

export const useExpenseFilters = (expenses: Expense[]) => {
  const [filters, setFilters] = useState<ExpenseFilterState>({
    search: '',
    categoryId: null,
    typeId: null,
    institutionId: null,
    paidStatus: 'all',
    startDate: null,
    endDate: null,
  });

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      // Filtro por busca (descrição)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!expense.description.toLowerCase().includes(searchLower)) return false;
      }

      // Filtro por categoria (através do tipo)
      if (filters.categoryId) {
        if (expense.expense_type?.category_id !== filters.categoryId) return false;
      }

      // Filtro por tipo
      if (filters.typeId && expense.expense_type_id !== filters.typeId) return false;

      // Filtro por instituição
      if (filters.institutionId && expense.institution_id !== filters.institutionId) return false;

      // Filtro por status de pagamento
      if (filters.paidStatus === 'paid' && !expense.is_paid) return false;
      if (filters.paidStatus === 'unpaid' && expense.is_paid) return false;

      // Filtro por data (usando expense_date)
      const expenseDate = parseISO(expense.expense_date);
      if (filters.startDate && expenseDate < filters.startDate) return false;
      if (filters.endDate && expenseDate > filters.endDate) return false;

      return true;
    });
  }, [expenses, filters]);

  return {
    filters,
    setFilters,
    filteredExpenses,
  };
};