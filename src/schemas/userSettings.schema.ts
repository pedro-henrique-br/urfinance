import { z } from "zod";

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),

  email: z
    .string()
    .trim()
    .email("E-mail inválido")
    .max(255, "E-mail muito longo"),
});

export const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, "Senha deve ter pelo menos 6 caracteres")
      .max(72, "Senha muito longa"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem",
  });

export const avatarSchema = z.object({
  file: z
    .instanceof(File, { message: "Arquivo inválido" })
    .refine(
      (file) =>
        ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(
          file.type
        ),
      "Formato inválido (PNG, JPG, JPEG ou WEBP)"
    )
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "Imagem deve ter no máximo 5MB"
    ),
});
