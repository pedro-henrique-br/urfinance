import { supabase } from "@/config/supabase";

// Função para obter o usuário atual
async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Busca todas as categorias de income do usuário atual
 */
export async function getIncomeCategories() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  return await supabase
    .from("income_categories")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });
}

/**
 * Busca uma categoria específica por ID
 */
export async function getIncomeCategoryById(id: string) {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  return await supabase
    .from("income_categories")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
}

/**
 * Cria uma nova categoria de income
 */
export async function createIncomeCategory(name: string, color?: string) {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const categoryData = {
    name: name.trim(),
    color: color || '#3B82F6', // Cor padrão (azul)
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from("income_categories")
    .insert(categoryData)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Atualiza uma categoria existente
 */
export async function updateIncomeCategory(id: string, updates: { name?: string; color?: string }) {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  // Primeiro verifica se a categoria pertence ao usuário
  const { data: existingCategory, error: checkError } = await supabase
    .from("income_categories")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (checkError || !existingCategory) {
    throw new Error('Categoria não encontrada ou sem permissão');
  }

  const updateData: any = {};
  
  if (updates.name !== undefined) {
    updateData.name = updates.name.trim();
  }
  
  if (updates.color !== undefined) {
    updateData.color = updates.color;
  }

  const { data, error } = await supabase
    .from("income_categories")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Deleta uma categoria
 * Verifica se há incomes usando esta categoria antes de deletar
 */
export async function deleteIncomeCategory(id: string) {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  // Primeiro verifica se a categoria pertence ao usuário
  const { data: existingCategory, error: checkError } = await supabase
    .from("income_categories")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (checkError || !existingCategory) {
    throw new Error('Categoria não encontrada ou sem permissão');
  }

  // Verifica se há incomes usando esta categoria
  const { data: incomes, error: incomesError } = await supabase
    .from("incomes")
    .select("id")
    .eq("category_id", id)
    .eq("user_id", user.id)
    .limit(1);

  if (incomesError) {
    throw incomesError;
  }

  if (incomes && incomes.length > 0) {
    throw new Error('Não é possível deletar esta categoria pois existem incomes vinculadas a ela');
  }

  const { error } = await supabase
    .from("income_categories")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw error;
  }

  return { success: true };
}

/**
 * Verifica se uma categoria com o mesmo nome já existe
 */
export async function checkCategoryExists(name: string) {
  const user = await getCurrentUser();
  
  if (!user) {
    return false;
  }

  const { data, error } = await supabase
    .from("income_categories")
    .select("id")
    .eq("name", name.trim())
    .eq("user_id", user.id)
    .single();

  // Se encontrou um registro, retorna true
  return !!data && !error;
}

/**
 * Obtém estatísticas das categorias
 * (quantas incomes em cada categoria, valor total, etc.)
 */
export async function getCategoriesStats() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const { data: incomes, error: incomesError } = await supabase
    .from("incomes")
    .select("category_id, amount")
    .eq("user_id", user.id);

  if (incomesError) {
    throw incomesError;
  }

  const { data: categories, error: categoriesError } = await supabase
    .from("income_categories")
    .select("id, name, color")
    .eq("user_id", user.id);

  if (categoriesError) {
    throw categoriesError;
  }

  // Agrupa incomes por categoria
  const stats = categories?.map(category => {
    const categoryIncomes = incomes?.filter(income => income.category_id === category.id) || [];
    
    return {
      category_id: category.id,
      category_name: category.name,
      category_color: category.color,
      count: categoryIncomes.length,
      total_amount: categoryIncomes.reduce((sum, income) => sum + income.amount, 0),
      incomes: categoryIncomes,
    };
  }) || [];

  // Adiciona categoria "Sem categoria" para incomes sem categoria
  const uncategorizedIncomes = incomes?.filter(income => !income.category_id) || [];
  
  if (uncategorizedIncomes.length > 0) {
    stats.push({
      category_id: null,
      category_name: 'Sem categoria',
      category_color: '#6B7280',
      count: uncategorizedIncomes.length,
      total_amount: uncategorizedIncomes.reduce((sum, income) => sum + income.amount, 0),
      incomes: uncategorizedIncomes,
    });
  }

  return stats;
}