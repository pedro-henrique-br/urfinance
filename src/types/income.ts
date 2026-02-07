// Tipos principais
export interface Income {
  id: string;
  description: string;
  payment_type: string | null;
  amount: number;
  income_date: string;
  is_fixed: boolean;
  is_received: boolean;
  category_id: string | null;
  institution_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  income_categories?: {
    id: string;
    name: string;
    color?: string;
  };
  institutions?: {
    id: string;
    name: string;
    logo_url?: string;
  };
}

export interface IncomeFormData {
  description: string;
  payment_type: string;
  amount: number;
  income_date: string;
  is_fixed: boolean;
  is_received: boolean;
  category_id: string | null;
  institution_id: string | null;
}

export interface IncomeCategory {
  id: string;
  name: string;
  color?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Institution {
  id: string;
  name: string;
  logo_url?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface IncomeSummary {
  total: number;
  received: number;
  pending: number;
}

// Tipo para o estado do filtro
export type IncomeFilter = 'all' | 'received' | 'pending';

// Tipo para operações da API
export interface ApiResponse<T> {
  data: T | null;
  error: any | null;
}

// Tipo para resposta de criação/atualização
export interface IncomeMutationResult {
  success: boolean;
  data?: any;
  error?: string;
}