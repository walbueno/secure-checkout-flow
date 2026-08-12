import { z } from "zod";
import { isValidCPF } from "@/app/lib/security/cpf-validator";

export const customerSchema = z.object({
  name: z
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome muito longo"),
  
  email: z
    .string()
    .email("E-mail inválido"),
  
  cpf: z
    .string()
    .regex(/^\d{11}$/, "CPF deve conter 11 dígitos numéricos")
    .refine(isValidCPF, "CPF inválido"),
  
  address: z.object({
    zipCode: z.string().regex(/^\d{8}$/, "CEP deve conter 8 dígitos"),
    street: z.string().min(3, "Endereço inválido"),
    number: z.string().min(1, "Número obrigatório"),
    city: z.string().min(2, "Cidade inválida"),
    state: z.string().length(2, "Use a sigla do estado (ex: SP)"),
  }),
});

export type CustomerData = z.infer<typeof customerSchema>;