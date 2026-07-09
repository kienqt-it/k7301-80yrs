import { z } from "zod";

const vnPhoneRegex = /^(0|\+84)([0-9]{9,10})$/;

export const createContributionSchema = z.object({
  name: z.string().trim().min(2, "Họ tên quá ngắn").max(120, "Họ tên quá dài"),
  phone: z
    .string()
    .trim()
    .regex(vnPhoneRegex, "Số điện thoại không hợp lệ"),
  amount: z.coerce
    .number()
    .int()
    .positive("Số tiền phải lớn hơn 0")
    .max(1_000_000_000, "Số tiền vượt quá giới hạn cho phép"),
  note: z.string().trim().max(300, "Lời nhắn quá dài").optional().default(""),
});

export const bankWebhookSchema = z.object({
  content: z.string().min(1),
  amount: z.coerce.number().int().positive(),
  transactionId: z.string().min(1),
  transactionDate: z.string().optional(),
});

export const sepayWebhookSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    content: z.string().min(1),
    transferType: z.string().optional(),
    transferAmount: z.coerce.number().int().positive(),
    referenceCode: z.string().optional().nullable(),
    transactionDate: z.string().optional(),
    description: z.string().optional().nullable(),
  })
  .passthrough();
