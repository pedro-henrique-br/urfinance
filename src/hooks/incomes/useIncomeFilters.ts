import { useState, useMemo } from 'react';
import type { Income } from '@/types/income';
import type { FilterState } from '@/pages/incomes/IncomeFilters';
import { parseISO } from 'date-fns';

export const useIncomeFilters = (incomes: Income[]) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categoryId: null,
    institutionId: null,
    status: 'all',
    startDate: null,
    endDate: null,
    fixedType: 'all',
  });

  const filteredIncomes = useMemo(() => {
    return incomes.filter(income => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const descriptionMatch = income.description.toLowerCase().includes(searchLower);
        if (!descriptionMatch) return false;
      }

      if (filters.categoryId && income.category_id !== filters.categoryId) {
        return false;
      }

      if (filters.institutionId && income.institution_id !== filters.institutionId) {
        return false;
      }

      if (filters.status === 'received' && !income.is_received) return false;
      if (filters.status === 'pending' && income.is_received) return false;

      if (filters.fixedType === 'fixed' && !income.is_fixed) return false;
      if (filters.fixedType === 'variable' && income.is_fixed) return false;

      if (filters.startDate) {
        const incomeDate = parseISO(income.income_date);
        if (incomeDate < filters.startDate) return false;
      }

      if (filters.endDate) {
        const incomeDate = parseISO(income.income_date);
        if (incomeDate > filters.endDate) return false;
      }

      return true;
    });
  }, [incomes, filters]);

  return {
    filters,
    setFilters,
    filteredIncomes,
  };
};