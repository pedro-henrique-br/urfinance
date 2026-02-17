import { useState, useEffect, useCallback } from 'react';
import * as api from '@/api/expenses';
import type { MonthlyIncome } from '@/types/expenses';

export const useMonthlyIncome = (month: number, year: number) => {
  const [income, setIncome] = useState<MonthlyIncome | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadIncome = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.getMonthlyIncome(month, year);
      setIncome(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  const upsertIncome = useCallback(async (total_income: number) => {
    try {
      setLoading(true);
      const newIncome = await api.upsertMonthlyIncome(month, year, total_income);
      setIncome(newIncome);
      return { success: true, data: newIncome };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadIncome();
  }, [loadIncome]);

  return { income, loading, error, upsertIncome, refresh: loadIncome };
};