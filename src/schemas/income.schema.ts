import { z } from "zod";

export const incomeSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  notes: z.string().optional(),

  amount: z.number().positive("Valor deve ser maior que zero"),

  category_id: z.string().uuid().optional().nullable(),
  institution_id: z.string().uuid().optional().nullable(),

  payment_type: z.string().optional(),

  income_date: z.string(),

  is_received: z.boolean(),
  is_fixed: z.boolean(),
});

export type IncomeFormData = z.infer<typeof incomeSchema>;
