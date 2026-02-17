import { useState, useEffect, useCallback } from 'react';
import * as api from '@/api/expenses';
import type { ExpenseBudget } from '@/types/expenses';

export const useBudgets = (month: number, year: number) => {
  const [budgets, setBudgets] = useState<ExpenseBudget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.getBudgets(month, year);
      setBudgets(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  const upsertBudget = useCallback(async (category_id: string, percentage?: number, limit_amount?: number) => {
    try {
      setLoading(true);
      const newBudget = await api.upsertBudget(category_id, month, year, percentage, limit_amount);
      setBudgets(prev => {
        const index = prev.findIndex(b => b.category_id === category_id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = newBudget;
          return updated;
        }
        return [...prev, newBudget];
      });
      return { success: true, data: newBudget };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  return { budgets, loading, error, upsertBudget, refresh: loadBudgets };
};