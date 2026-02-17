import React, { createContext, useContext, type ReactNode } from 'react';
import { useExpenses } from '@/hooks/expenses/useExpenses';
import { useExpenseCategories } from '@/hooks/expenses/useExpenseCategories';
import { useExpenseTypes } from '@/hooks/expenses/useExpenseTypes';
import type { Expense, ExpenseFormData } from '@/types/expenses';

interface ExpenseContextType {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  categories: unknown[];
  types: unknown[];
  createExpense: (data: ExpenseFormData) => Promise<unknown>;
  updateExpense: (id: string, data: Partial<ExpenseFormData>) => Promise<unknown>;
  deleteExpense: (id: string) => Promise<unknown>;
  createCategory: (name: string, color?: string) => Promise<unknown>;
  createType: (name: string, category_id?: string | null) => Promise<unknown>;
  refreshExpenses: () => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useExpenseContext = () => {
  const context = useContext(ExpenseContext);
  if (!context) throw new Error('useExpenseContext must be used within ExpenseProvider');
  return context;
};

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const expensesHook = useExpenses();
  const categoriesHook = useExpenseCategories();
  const typesHook = useExpenseTypes();

  return (
    <ExpenseContext.Provider
      value={{
        expenses: expensesHook.expenses,
        loading: expensesHook.loading || categoriesHook.loading || typesHook.loading,
        error: expensesHook.error || categoriesHook.error || typesHook.error,
        categories: categoriesHook.categories,
        types: typesHook.types,
        createExpense: expensesHook.createExpense,
        updateExpense: expensesHook.updateExpense,
        deleteExpense: expensesHook.deleteExpense,
        createCategory: categoriesHook.createCategory,
        createType: typesHook.createType,
        refreshExpenses: expensesHook.refresh,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};