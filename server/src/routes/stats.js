import { Router } from "express";
import { getPublicStats } from "../services/contributionService.js";

export const statsRouter = Router();

statsRouter.get("/", async (req, res, next) => {
  try {
    const targetAmount = Number(process.env.TARGET_AMOUNT || 250_000_000);
    res.json(await getPublicStats(targetAmount));
  } catch (err) {
    next(err);
  }
});
