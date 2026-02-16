import { useState, useEffect, useCallback } from 'react';
import * as api from '@/api/expenses';
import type { ExpenseCategory } from '@/types/expenses';

export const useExpenseCategories = () => {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.getExpenseCategories();
      setCategories(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (name: string, color?: string) => {
    try {
      setLoading(true);
      const newCat = await api.createExpenseCategory(name, color);
      setCategories(prev => [...prev, newCat]);
      return newCat;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return { categories, loading, error, createCategory, refresh: loadCategories };
};