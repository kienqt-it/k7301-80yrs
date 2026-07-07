import { db } from "../db.js";
import { generateUniqueCode } from "./codeGenerator.js";
import { extractCodeFromContent } from "./webhookMatcher.js";

const PUBLIC_COLUMNS = "id, name, amount, note, confirmed_at";
const ADMIN_COLUMNS =
  "id, code, name, phone, amount, note, status, source, bank_reference, reject_reason, submitted_at, confirmed_at, confirmed_by";

function toAmount(row) {
  return row ? { ...row, amount: Number(row.amount) } : row;
}

function firstRow(resultSet) {
  return resultSet.rows[0] ? toAmount(resultSet.rows[0]) : null;
}

export async function createContribution({ name, phone, amount, note }) {
  const code = await generateUniqueCode();
  const submittedAt = new Date().toISOString();

  await db.execute({
    sql: `INSERT INTO contributions (code, name, phone, amount, note, submitted_at)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [code, name, phone, amount, note ?? "", submittedAt],
  });

  return { code, submittedAt };
}

export async function getContributionStatusByCode(code) {
  const result = await db.execute({
    sql: "SELECT code, status, amount, reject_reason, confirmed_at FROM contributions WHERE code = ?",
    args: [code],
  });
  return firstRow(result);
}

export async function listPublicContributions({ limit = 100 } = {}) {
  const result = await db.execute({
    sql: `SELECT ${PUBLIC_COLUMNS} FROM contributions
          WHERE status = 'confirmed'
          ORDER BY confirmed_at DESC
          LIMIT ?`,
    args: [limit],
  });
  return result.rows.map(toAmount);
}

export async function getPublicStats(targetAmount) {
  const result = await db.execute(
    `SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS contributorCount
     FROM contributions WHERE status = 'confirmed'`,
  );
  const row = result.rows[0];
  return {
    total: Number(row.total),
    contributorCount: Number(row.contributorCount),
    targetAmount,
  };
}

export async function listAdminContributions({ status } = {}) {
  const result = status
    ? await db.execute({
        sql: `SELECT ${ADMIN_COLUMNS} FROM contributions WHERE status = ? ORDER BY submitted_at DESC`,
        args: [status],
      })
    : await db.execute(`SELECT ${ADMIN_COLUMNS} FROM contributions ORDER BY submitted_at DESC`);
  return result.rows.map(toAmount);
}

function notFoundError() {
  const err = new Error("Contribution not found");
  err.status = 404;
  err.publicMessage = "Không tìm thấy khoản đóng góp";
  return err;
}

export async function confirmContribution(id, { confirmedBy = "admin", source = "manual", bankReference = null } = {}) {
  const existingResult = await db.execute({ sql: "SELECT * FROM contributions WHERE id = ?", args: [id] });
  const existing = existingResult.rows[0];
  if (!existing) throw notFoundError();
  if (existing.status === "confirmed") {
    return toAmount(existing);
  }

  await db.execute({
    sql: `UPDATE contributions
          SET status = 'confirmed', confirmed_at = ?, confirmed_by = ?, source = ?, bank_reference = ?
          WHERE id = ?`,
    args: [new Date().toISOString(), confirmedBy, source, bankReference, id],
  });

  const updated = await db.execute({
    sql: `SELECT ${ADMIN_COLUMNS} FROM contributions WHERE id = ?`,
    args: [id],
  });
  return firstRow(updated);
}

export async function rejectContribution(id, { reason = "" } = {}) {
  const existingResult = await db.execute({ sql: "SELECT * FROM contributions WHERE id = ?", args: [id] });
  if (!existingResult.rows[0]) throw notFoundError();

  await db.execute({
    sql: "UPDATE contributions SET status = 'rejected', reject_reason = ? WHERE id = ?",
    args: [reason, id],
  });

  const updated = await db.execute({
    sql: `SELECT ${ADMIN_COLUMNS} FROM contributions WHERE id = ?`,
    args: [id],
  });
  return firstRow(updated);
}

export async function deleteContribution(id) {
  const existingResult = await db.execute({ sql: "SELECT id FROM contributions WHERE id = ?", args: [id] });
  if (!existingResult.rows[0]) throw notFoundError();

  await db.execute({ sql: "DELETE FROM contributions WHERE id = ?", args: [id] });
}

export async function exportContributions({ status } = {}) {
  return listAdminContributions({ status });
}

/**
 * Đối chiếu một giao dịch ngân hàng (từ webhook Casso/SePay...) với contribution đang pending.
 * Khớp theo mã nhúng trong nội dung CK; nếu không khớp thì lưu vào unmatched_transactions
 * để admin xử lý thủ công sau.
 */
export async function matchBankTransaction({ content, amount, transactionId, transactionDate }) {
  const existingTx = await db.execute({
    sql: "SELECT id FROM unmatched_transactions WHERE transaction_id = ?",
    args: [transactionId],
  });
  const alreadyConfirmed = await db.execute({
    sql: "SELECT id FROM contributions WHERE bank_reference = ?",
    args: [transactionId],
  });
  if (existingTx.rows[0] || alreadyConfirmed.rows[0]) {
    return { status: "duplicate" };
  }

  const code = extractCodeFromContent(content);
  const candidateResult = code
    ? await db.execute({
        sql: "SELECT * FROM contributions WHERE code = ? AND status = 'pending'",
        args: [code],
      })
    : null;
  const candidate = candidateResult?.rows[0];

  if (!candidate || Number(candidate.amount) !== amount) {
    await db.execute({
      sql: `INSERT INTO unmatched_transactions (raw_content, amount, transaction_id, received_at)
            VALUES (?, ?, ?, ?)`,
      args: [content, amount, transactionId, transactionDate || new Date().toISOString()],
    });
    return { status: "unmatched" };
  }

  const confirmed = await confirmContribution(candidate.id, {
    confirmedBy: "webhook:bank",
    source: "webhook",
    bankReference: transactionId,
  });
  return { status: "confirmed", contribution: confirmed };
}
