import { Router } from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import {
  confirmContribution,
  deleteContribution,
  exportContributions,
  listAdminContributions,
  rejectContribution,
} from "../services/contributionService.js";
import { contributionsToCsv } from "../services/csvExport.js";
import { contributionsToXlsx } from "../services/excelExport.js";

export const adminRouter = Router();
adminRouter.use(adminAuth);

adminRouter.get("/contributions", async (req, res, next) => {
  try {
    const { status } = req.query;
    res.json(await listAdminContributions({ status }));
  } catch (err) {
    next(err);
  }
});

adminRouter.post("/contributions/:id/confirm", async (req, res, next) => {
  try {
    const contribution = await confirmContribution(Number(req.params.id));
    res.json(contribution);
  } catch (err) {
    next(err);
  }
});

adminRouter.post("/contributions/:id/reject", async (req, res, next) => {
  try {
    const reason = typeof req.body?.reason === "string" ? req.body.reason : "";
    const contribution = await rejectContribution(Number(req.params.id), { reason });
    res.json(contribution);
  } catch (err) {
    next(err);
  }
});

adminRouter.delete("/contributions/:id", async (req, res, next) => {
  try {
    await deleteContribution(Number(req.params.id));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/export.csv", async (req, res, next) => {
  try {
    const { status } = req.query;
    const rows = await exportContributions({ status });
    const csv = contributionsToCsv(rows);
    const dateStamp = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="k7301-dong-gop-${dateStamp}.csv"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/export.xlsx", async (req, res, next) => {
  try {
    const { status } = req.query;
    const rows = await exportContributions({ status });
    const buffer = await contributionsToXlsx(rows);
    const dateStamp = new Date().toISOString().slice(0, 10);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="k7301-dong-gop-${dateStamp}.xlsx"`);
    res.send(Buffer.from(buffer));
  } catch (err) {
    next(err);
  }
});
