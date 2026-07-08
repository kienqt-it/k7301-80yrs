import { motion } from "framer-motion";
import { Crown, Trophy } from "lucide-react";
import { formatCurrency } from "../utils/format.js";

const RANK_STYLES = {
  1: {
    pedestal: "h-24 bg-gradient-to-b from-heritage-gold to-[#9c7b26]",
    number: "text-heritage-blueDark/80",
    avatar: "h-16 w-16 border-heritage-gold text-xl",
  },
  2: {
    pedestal: "h-16 bg-gradient-to-b from-slate-200 to-slate-500",
    number: "text-slate-700/80",
    avatar: "h-14 w-14 border-slate-300 text-lg",
  },
  3: {
    pedestal: "h-12 bg-gradient-to-b from-amber-600 to-amber-900",
    number: "text-amber-100/90",
    avatar: "h-12 w-12 border-amber-600 text-base",
  },
};

// Cộng dồn theo thành viên: memberKey (server tính từ họ tên + SĐT);
// dữ liệu chưa có memberKey thì tạm gộp theo tên như trước.
function aggregateTop(contributions, limit) {
  const totals = new Map();
  for (const item of contributions) {
    const key = item.memberKey ?? item.name.trim().toLowerCase();
    const current = totals.get(key) || { key, name: item.name.trim(), amount: 0 };
    current.amount += item.amount;
    totals.set(key, current);
  }
  return [...totals.values()].sort((a, b) => b.amount - a.amount).slice(0, limit);
}

function initialsOf(name) {
  const words = name.trim().split(/\s+/);
  const picked = words.length > 1 ? [words[words.length - 2], words[words.length - 1]] : words;
  return picked.map((word) => word[0]?.toUpperCase() ?? "").join("");
}

export default function Leaderboard({ contributions, limit = 3 }) {
  const top = aggregateTop(contributions, Math.min(limit, 3));

  if (top.length === 0) return null;

  // Bục vinh danh: hạng 2 - hạng 1 - hạng 3; thiếu người thì bỏ trống chỗ đó
  const slots =
    top.length === 3 ? [top[1], top[0], top[2]] : [top[1], top[0], top[2]].filter(Boolean);

  return (
    <div className="mx-auto mt-12 max-w-2xl">
      <p className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-heritage-goldSoft">
        <Trophy className="h-4 w-4" aria-hidden="true" />
        Bảng vàng đóng góp
      </p>

      <ol className="mt-8 grid grid-cols-3 items-end gap-3 sm:gap-5">
        {slots.map((entry, slotIndex) => {
          const rank = top.indexOf(entry) + 1;
          const style = RANK_STYLES[rank];
          const isFirst = rank === 1;
          return (
            <motion.li
              key={entry.key}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: 0.6,
                delay: 0.15 + slotIndex * 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex min-w-0 flex-col items-center"
            >
              {isFirst && (
                <Crown
                  className="mb-2 h-6 w-6 text-heritage-gold"
                  aria-hidden="true"
                />
              )}
              <span
                className={`grid shrink-0 place-items-center rounded-full border-2 bg-white/10 font-display font-bold text-white backdrop-blur ${style.avatar}`}
                aria-hidden="true"
              >
                {initialsOf(entry.name)}
              </span>
              <p className="mt-2 w-full truncate text-center text-sm font-semibold text-white sm:text-base">
                {entry.name}
              </p>
              <p className="w-full truncate text-center text-xs font-bold text-heritage-goldSoft sm:text-sm">
                {formatCurrency(entry.amount)} đ
              </p>
              <div
                className={`mt-3 grid w-full place-items-center rounded-t-lg ${style.pedestal}`}
              >
                <span className={`font-display text-2xl font-bold ${style.number}`}>
                  {rank}
                </span>
              </div>
            </motion.li>
          );
        })}
      </ol>
      <div className="gold-rule h-px w-full" />
    </div>
  );
}
