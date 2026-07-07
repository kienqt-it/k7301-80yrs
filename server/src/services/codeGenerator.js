import { customAlphabet } from "nanoid";
import { db } from "../db.js";

const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // bỏ ký tự dễ nhầm (0,O,1,I)
const generate = customAlphabet(alphabet, 6);

export async function generateUniqueCode() {
  let code;
  let exists;
  do {
    code = `K7301-${generate()}`;
    const result = await db.execute({
      sql: "SELECT 1 FROM contributions WHERE code = ?",
      args: [code],
    });
    exists = result.rows.length > 0;
  } while (exists);
  return code;
}
