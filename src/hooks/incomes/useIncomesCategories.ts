import { useEffect, useState, useCallback } from "react";
import {
  getIncomeCategories,
  createIncomeCategory,
  updateIncomeCategory,
  deleteIncomeCategory,
  getCategoriesStats,
} from "@/api/incomeCategories";

interface Category {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface CategoryStats {
  category_id: string | null;
  category_name: string;
  category_color: string;
  count: number;
  total_amount: number;
  incomes: any[];
}

export function useIncomesCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: apiError } = await getIncomeCategories();
      
      if (apiError) {
        throw apiError;
      }
      
      setCategories(data || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await getCategoriesStats();
      setStats(statsData);
    } catch (err: any) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  }, []);

  const createCategory = useCallback(async (name: string, color?: string) => {
    try {
      setLoading(true);
      const category = await createIncomeCategory(name, color);
      setCategories(prev => [...prev, category]);
      
       
      await fetchStats();
      
      return category;
    } catch (err: any) {
      console.error('Erro ao criar categoria:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchStats]);

  const updateCategory = useCallback(async (id: string, updates: { name?: string; color?: string }) => {
    try {
      setLoading(true);
      const updatedCategory = await updateIncomeCategory(id, updates);
      
      setCategories(prev => 
        prev.map(category => 
          category.id === id ? updatedCategory : category
        )
      );
      
      return updatedCategory;
    } catch (err: any) {
      console.error('Erro ao atualizar categoria:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeCategory = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await deleteIncomeCategory(id);
      
      setCategories(prev => prev.filter(category => category.id !== id));
      
      
      await fetchStats();
      
      return { success: true };
    } catch (err: any) {
      console.error('Erro ao deletar categoria:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchStats]);

  
  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, [fetchCategories, fetchStats]);

  return {
    
    categories,
    stats,
    
    
    loading,
    error,
    
    
    createCategory,
    updateCategory,
    removeCategory,
    refetch: fetchCategories,
    refreshStats: fetchStats,
    
    
    getCategoryById: (id: string) => categories.find(cat => cat.id === id),
    getCategoryStats: (categoryId: string | null) => 
      stats.find(stat => stat.category_id === categoryId),
  };
}