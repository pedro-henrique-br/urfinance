import { useState, useEffect, useCallback } from 'react';
import type { Income } from '@/types/income';
import * as incomesApi from '@/api/incomes';

export const useIncomes = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadIncomes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: apiError } = await incomesApi.getIncomes();
      
      if (apiError) throw apiError;
      
      setIncomes(data || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar entradas');
      setIncomes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createIncome = useCallback(async (incomeData: any) => {
    try {
      setLoading(true);
      const { data, error: apiError } = await incomesApi.createIncome(incomeData);
      
      if (apiError) throw apiError;
      
      setIncomes(prev => [data, ...prev]);
      return { success: true, data };
    } catch (err: any) {
      console.error('Erro ao criar income:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateIncome = useCallback(async (id: string, incomeData: any) => {
    try {
      setLoading(true);
      const { data, error: apiError } = await incomesApi.updateIncome(id, incomeData);
      
      if (apiError) throw apiError;
      
      setIncomes(prev => 
        prev.map(income => 
          income.id === id ? { ...income, ...data } : income
        )
      );
      return { success: true, data };
    } catch (err: any) {
      console.error('Erro ao atualizar income:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteIncome = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const { error: apiError } = await incomesApi.deleteIncome(id);
      
      if (apiError) throw apiError;
      
      setIncomes(prev => prev.filter(income => income.id !== id));
      return { success: true };
    } catch (err: any) {
      console.error('Erro ao deletar income:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIncomes();
  }, [loadIncomes]);

  return {
    incomes,
    loading,
    error,
    createIncome,
    updateIncome,
    deleteIncome,
    refresh: loadIncomes,
  };
};