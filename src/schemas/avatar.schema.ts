import { z } from "zod";

export const avatarSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) =>
        ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(
          file.type
        ),
      "Formato inválido (PNG, JPG, JPEG ou WEBP)"
    )
    .refine((file) => file.size <= 5 * 1024 * 1024, "Máximo 5MB"),
});
