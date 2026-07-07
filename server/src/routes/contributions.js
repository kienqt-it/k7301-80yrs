import { Router } from "express";
import rateLimit from "express-rate-limit";
import { createContributionSchema } from "../validation/contributionSchema.js";
import {
  createContribution,
  getContributionStatusByCode,
  listPublicContributions,
} from "../services/contributionService.js";

export const contributionsRouter = Router();

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Bạn gửi quá nhiều lần, vui lòng thử lại sau." },
});

contributionsRouter.post("/", submitLimiter, async (req, res, next) => {
  try {
    const parsed = createContributionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" });
    }
    const { code, submittedAt } = await createContribution(parsed.data);
    res.status(201).json({ code, submittedAt, status: "pending" });
  } catch (err) {
    next(err);
  }
});

contributionsRouter.get("/:code/status", async (req, res, next) => {
  try {
    const row = await getContributionStatusByCode(req.params.code);
    if (!row) return res.status(404).json({ error: "Không tìm thấy mã đối chiếu" });
    res.json(row);
  } catch (err) {
    next(err);
  }
});

contributionsRouter.get("/", async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    res.json(await listPublicContributions({ limit }));
  } catch (err) {
    next(err);
  }
});
