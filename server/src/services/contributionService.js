import { createHash } from "node:crypto";
import { db } from "../db.js";
import { generateUniqueCode } from "./codeGenerator.js";
import { extractCodeFromContent } from "./webhookMatcher.js";

const PUBLIC_COLUMNS = "id, name, amount, note, confirmed_at";

// Một "thành viên" = họ tên + số điện thoại (sau khi chuẩn hóa khoảng trắng,
// chữ hoa/thường và ký tự không phải số). memberKey là mã băm ẩn danh để
// frontend gộp các lượt đóng góp của cùng một người mà không lộ số điện thoại.
function normalizeName(name) {
  return String(name || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function memberKeyOf(name, phone) {
  return createHash("sha1")
    .update(`${normalizeName(name)}|${normalizePhone(phone)}`)
    .digest("hex")
    .slice(0, 12);
}
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
    sql: `SELECT ${PUBLIC_COLUMNS}, phone FROM contributions
          WHERE status = 'confirmed'
          ORDER BY confirmed_at DESC
          LIMIT ?`,
    args: [limit],
  });
  return result.rows.map((row) => {
    const { phone, ...publicRow } = row;
    return { ...toAmount(publicRow), memberKey: memberKeyOf(row.name, phone) };
  });
}

export async function getPublicStats(targetAmount) {
  const result = await db.execute(
    "SELECT name, phone, amount FROM contributions WHERE status = 'confirmed'",
  );
  let total = 0;
  const members = new Set();
  for (const row of result.rows) {
    total += Number(row.amount);
    members.add(memberKeyOf(row.name, row.phone));
  }
  return {
    total,
    contributorCount: members.size,
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
  if (alreadyConfirmed.rows[0]) {
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
    if (existingTx.rows[0]) {
      return { status: "duplicate" };
    }
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
  if (existingTx.rows[0]) {
    await db.execute({
      sql: "UPDATE unmatched_transactions SET linked_contribution_id = ? WHERE id = ?",
      args: [confirmed.id, existingTx.rows[0].id],
    });
  }
  return { status: "confirmed", contribution: confirmed };
}
