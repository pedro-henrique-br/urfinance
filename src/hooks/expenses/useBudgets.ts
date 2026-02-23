import { useState, useEffect, useCallback } from 'react';
import * as budgetsApi from '@/api/budgets';
import * as expensesApi from '@/api/expenses'; // para calcular gastos
import type { BudgetFormData, BudgetWithStats } from '@/types/budget';
import type { Expense } from '@/types/expenses';

export const useBudgets = (month: number, year: number) => {
  const [budgets, setBudgets] = useState<BudgetWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);

  // Carregar todas as despesas uma vez (poderia ser otimizado com filtro por período)
  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const { data } = await expensesApi.getExpenses();
        setAllExpenses(data || []);
      } catch (err) {
        console.error('Erro ao carregar despesas', err);
      }
    };
    loadExpenses();
  }, []);

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await budgetsApi.getBudgets(month, year);

      // Calcular gastos e status para cada budget
      const budgetsWithStats = await Promise.all(
        data.map(async (budget) => {
          // 1. Calcular total gasto na categoria no mês/ano
          const spent = allExpenses
            .filter(e =>
              e.expense_type?.category_id === budget.category_id &&
              new Date(e.expense_date).getMonth() + 1 === month &&
              new Date(e.expense_date).getFullYear() === year
            )
            .reduce((acc, e) => acc + e.amount, 0);

          // 2. Calcular total das entradas selecionadas (corrigido)
          const incomeTotal = budget.income_sources?.reduce((acc, source) => {
            return acc + (source.income?.amount || 0);
          }, 0) || 0;

          // 3. Definir valor limite (percentual ou fixo)
          let limit = budget.limit_amount || 0;
          if (budget.percentage && incomeTotal > 0) {
            limit = (budget.percentage / 100) * incomeTotal;
          }

          const balance = limit - spent;

          // 4. Status em português
          let status: BudgetWithStats['status'] = 'sem_gastos';
          if (spent > 0) {
            if (balance < 0) {
              status = 'excedido';
            } else if (balance < limit * 0.2) {
              status = 'atencao';
            } else {
              status = 'dentro';
            }
          }

          return {
            ...budget,
            spent,
            balance,
            status,
            income_total: incomeTotal,
            limit_calculated: limit, // opcional, para facilitar
          };
        })
      );

      setBudgets(budgetsWithStats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [month, year, allExpenses]);

  const createBudget = useCallback(async (data: BudgetFormData) => {
    try {
      setLoading(true);
      await budgetsApi.createBudget(data);
      await fetchBudgets(); // recarrega a lista
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchBudgets]);

  const updateBudget = useCallback(async (id: string, data: Partial<BudgetFormData>) => {
    try {
      setLoading(true);
      await budgetsApi.updateBudget(id, data);
      await fetchBudgets();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchBudgets]);

  const deleteBudget = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await budgetsApi.deleteBudget(id);
      await fetchBudgets();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchBudgets]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  return {
    budgets,
    loading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
    refresh: fetchBudgets,
  };
};