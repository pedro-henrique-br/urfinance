import { useState, useEffect, useCallback } from 'react';
import * as api from '@/api/expenses';
import type { Expense, ExpenseFormData } from '@/types/expenses';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.getExpenses();
      setExpenses(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createExpense = useCallback(async (data: ExpenseFormData) => {
    try {
      setLoading(true);
      const newExpense = await api.createExpense(data);
      setExpenses(prev => [newExpense, ...prev]);
      return { success: true, data: newExpense };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateExpense = useCallback(async (id: string, data: Partial<ExpenseFormData>) => {
    try {
      setLoading(true);
      const updated = await api.updateExpense(id, data);
      setExpenses(prev => prev.map(e => e.id === id ? updated : e));
      return { success: true, data: updated };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await api.deleteExpense(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  return {
    expenses,
    loading,
    error,
    createExpense,
    updateExpense,
    deleteExpense,
    refresh: loadExpenses,
  };
};