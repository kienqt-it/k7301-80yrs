import { Router } from "express";
import { bankWebhookSchema, sepayWebhookSchema } from "../validation/contributionSchema.js";
import { matchBankTransaction } from "../services/contributionService.js";

export const webhooksRouter = Router();

function isAuthorized(req) {
  const expectedSecret = process.env.WEBHOOK_SECRET;
  const authorization = (req.get("authorization") || "").trim();
  const [scheme = "", token = ""] = authorization.split(/\s+/, 2);
  return (
    req.get("x-webhook-secret") === expectedSecret ||
    ((scheme.toLowerCase() === "apikey" || scheme.toLowerCase() === "bearer") &&
      token === expectedSecret)
  );
}

function firstText(...values) {
  const value = values.find((item) => item !== undefined && item !== null && String(item).trim());
  return value === undefined ? "" : String(value).trim();
}

function parseWebhookPayload(body) {
  const generic = bankWebhookSchema.safeParse(body);
  if (generic.success) {
    return { provider: "generic", transaction: generic.data };
  }

  const sepay = sepayWebhookSchema.safeParse(body);
  if (!sepay.success) {
    return { error: sepay.error.issues[0]?.message || "Payload không hợp lệ" };
  }

  const data = sepay.data;
  const transactionId = firstText(data.id, data.referenceCode);
  if (!transactionId) {
    return { error: "Payload SePay thiếu mã giao dịch" };
  }

  if (data.transferType && data.transferType.toLowerCase() !== "in") {
    return { provider: "sepay", ignored: true, reason: "outgoing-transfer" };
  }

  return {
    provider: "sepay",
    transaction: {
      content: firstText(data.content, data.description),
      amount: data.transferAmount,
      transactionId,
      transactionDate: data.transactionDate,
    },
  };
}

/**
 * Endpoint dựng sẵn cho dịch vụ webhook ngân hàng (vd Casso.vn, SePay.vn).
 * Hỗ trợ payload nội bộ { content, amount, transactionId } và payload SePay
 * { content, transferAmount, id/referenceCode }. Với SePay, chọn xác thực API Key
 * và đặt API Key trùng WEBHOOK_SECRET để họ gửi header Authorization: Apikey <key>.
 */
webhooksRouter.post("/bank", async (req, res, next) => {
  try {
    if (!process.env.WEBHOOK_SECRET) {
      return res.status(500).json({ error: "WEBHOOK_SECRET chưa được cấu hình" });
    }
    if (!isAuthorized(req)) {
      return res.status(401).json({ error: "Không có quyền truy cập" });
    }

    const parsed = parseWebhookPayload(req.body);
    if (parsed.error) {
      return res.status(400).json({ error: parsed.error });
    }

    if (parsed.ignored) {
      return res.json({ success: true, status: "ignored", reason: parsed.reason });
    }

    const result = await matchBankTransaction(parsed.transaction);
    if (parsed.provider === "sepay") {
      return res.json({ success: true, status: result.status });
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
});
