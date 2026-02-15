import { useState, useEffect, useCallback } from 'react';
import * as typesApi from '@/api/expenseTypes';
import type { ExpenseType } from '@/types/expenses';

export const useExpenseTypes = () => {
  const [types, setTypes] = useState<ExpenseType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTypes = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await typesApi.getExpenseTypes();
      if (error) throw error;
      setTypes(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createType = useCallback(async (name: string, categoryId: string | null) => {
    try {
      setLoading(true);
      const type = await typesApi.createExpenseType(name, categoryId);
      // Adiciona o novo tipo à lista local
      setTypes(prev => [...prev, type]);
      return type;
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateType = useCallback(async (id: string, updates: { name?: string; category_id?: string | null }) => {
    try {
      setLoading(true);
      const updated = await typesApi.updateExpenseType(id, updates);
      setTypes(prev => prev.map(t => t.id === id ? updated : t));
      return updated;
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteType = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await typesApi.deleteExpenseType(id);
      setTypes(prev => prev.filter(t => t.id !== id));
      return { success: true };
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  return {
    types,
    loading,
    error,
    createType,
    updateType,
    deleteType,
    refetch: fetchTypes,
  };
};