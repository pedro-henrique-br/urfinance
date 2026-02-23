import { useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '@/api/budgets';
import type { Budget, BudgetFormData, BudgetWithStats } from '@/types/budget';
import { useExpenses } from '../expenses/useExpenses';

export const useBudgets = (month: number, year: number) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { expenses, loading: expensesLoading } = useExpenses();

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

  const createBudget = useCallback(async (data: BudgetFormData) => {
    try {
      setLoading(true);
      await api.createBudget(data);
      await loadBudgets();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [loadBudgets]);

  const updateBudget = useCallback(async (id: string, data: BudgetFormData) => {
    try {
      setLoading(true);
      await api.updateBudget(id, data);
      await loadBudgets();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [loadBudgets]);

  const deleteBudget = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await api.deleteBudget(id);
      setBudgets(prev => prev.filter(b => b.id !== id));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Calcula estatísticas para cada budget
  const budgetsWithStats = useMemo((): BudgetWithStats[] => {
    const filteredExpenses = expenses.filter(e => {
      const date = new Date(e.expense_date);
      return date.getMonth() + 1 === month && date.getFullYear() === year;
    });

    return budgets.map(budget => {
      // Total de despesas da categoria no mês
      const totalExpenses = filteredExpenses
        .filter(e => e.expense_type?.category_id === budget.category_id)
        .reduce((sum, e) => sum + e.amount, 0);

      // Soma das entradas selecionadas para este budget
      const totalIncome = budget.income_sources?.reduce((sum, source) => {
        return sum + (source.income?.amount || 0);
      }, 0) || 0;

      // Limite calculado
      let limitCalculated = 0;
      if (budget.percentage) {
        limitCalculated = (totalIncome * budget.percentage) / 100;
      } else if (budget.limit_amount) {
        limitCalculated = budget.limit_amount;
      }

      const balance = limitCalculated - totalExpenses;

      let status: BudgetWithStats['status'] = 'sem_gastos';
      if (totalExpenses > 0) {
        if (totalExpenses > limitCalculated) {
          status = 'excedido';
        } else if (totalExpenses > limitCalculated * 0.8) {
          status = 'atencao';
        } else {
          status = 'dentro';
        }
      }

      return {
        ...budget,
        total_expenses: totalExpenses,
        limit_calculated: limitCalculated,
        balance,
        status,
        income_total: totalIncome, // adicionado para usar na tabela se necessário
      };
    });
  }, [budgets, expenses, month, year]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  return {
    budgets: budgetsWithStats,
    loading: loading || expensesLoading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
    refresh: loadBudgets,
  };
};