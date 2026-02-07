import { z } from "zod";

export const institutionSchema = z.object({
  name: z.string().min(1),
  type: z.string().optional(),
  logo_url: z.string().url().optional(),
});
