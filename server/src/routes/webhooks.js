import { Router } from "express";
import { bankWebhookSchema } from "../validation/contributionSchema.js";
import { matchBankTransaction } from "../services/contributionService.js";

export const webhooksRouter = Router();

/**
 * Endpoint dựng sẵn cho dịch vụ webhook ngân hàng (vd Casso.vn, SePay.vn).
 * Chưa nối với provider thật — để kích hoạt: đăng ký tài khoản Casso/SePay,
 * liên kết tài khoản ngân hàng của trường, rồi trỏ webhook URL của họ về
 * đây kèm header X-Webhook-Secret khớp biến môi trường WEBHOOK_SECRET.
 */
webhooksRouter.post("/bank", async (req, res, next) => {
  try {
    if (!process.env.WEBHOOK_SECRET) {
      return res.status(500).json({ error: "WEBHOOK_SECRET chưa được cấu hình" });
    }
    if (req.get("x-webhook-secret") !== process.env.WEBHOOK_SECRET) {
      return res.status(401).json({ error: "Không có quyền truy cập" });
    }

    const parsed = bankWebhookSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || "Payload không hợp lệ" });
    }

    const result = await matchBankTransaction(parsed.data);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
