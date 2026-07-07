import { createClient } from "@libsql/client";
import { schemaSql } from "./schema.js";

if (!process.env.TURSO_DATABASE_URL) {
  throw new Error(
    "Thiếu biến môi trường TURSO_DATABASE_URL (kiểm tra .env ở local, hoặc Vercel > Settings > Environment Variables khi deploy)",
  );
}

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

await db.executeMultiple(schemaSql);
