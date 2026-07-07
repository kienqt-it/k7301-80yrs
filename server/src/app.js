import "dotenv/config";
import express from "express";
import cors from "cors";
import "./db.js";
import { contributionsRouter } from "./routes/contributions.js";
import { statsRouter } from "./routes/stats.js";
import { adminRouter } from "./routes/admin.js";
import { webhooksRouter } from "./routes/webhooks.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/contributions", contributionsRouter);
app.use("/api/stats", statsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/webhooks", webhooksRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
