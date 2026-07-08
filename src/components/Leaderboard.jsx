import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Crown, Trophy, X } from "lucide-react";
import { formatCurrency } from "../utils/format.js";

// Kiểu bục theo thứ tự nhóm hạng: nhóm cao nhất vàng, rồi bạc, rồi đồng.
const TIER_STYLES = [
  {
    pedestal: "h-24 bg-gradient-to-b from-heritage-gold to-[#9c7b26]",
    number: "text-heritage-blueDark/80",
    avatar: "h-16 w-16 border-heritage-gold text-xl",
  },
  {
    pedestal: "h-16 bg-gradient-to-b from-slate-200 to-slate-500",
    number: "text-slate-700/80",
    avatar: "h-14 w-14 border-slate-300 text-lg",
  },
  {
    pedestal: "h-12 bg-gradient-to-b from-amber-600 to-amber-900",
    number: "text-amber-100/90",
    avatar: "h-12 w-12 border-amber-600 text-base",
  },
];

const PODIUM_GROUPS = 3;
const MAX_AVATARS_PER_GROUP = 3;
const MAX_NAMES_PER_GROUP = 3;

// Cộng dồn theo thành viên: memberKey (server tính từ họ tên + SĐT);
// dữ liệu chưa có memberKey thì tạm gộp theo tên như trước.
// Xếp hạng dày (1-2-3): góp bằng tiền nhau là đồng hạng — gom chung một
// nhóm/bục để không ai bị cắt mất; nhóm kế tiếp luôn là hạng liền sau
// (đồng hạng 2 có 4 người thì nhóm sau vẫn là hạng 3, không nhảy cách).
// Trong nhóm, ai đóng góp sớm hơn đứng trước.
function aggregateRankGroups(contributions, maxGroups) {
  const totals = new Map();
  for (const item of contributions) {
    const key = item.memberKey ?? item.name.trim().toLowerCase();
    const current = totals.get(key) || { key, name: item.name.trim(), amount: 0, since: "" };
    current.amount += item.amount;
    const date = item.confirmed_at || item.paidAt || "";
    if (date && (!current.since || date < current.since)) current.since = date;
    totals.set(key, current);
  }

  const sorted = [...totals.values()].sort((a, b) => {
    if (b.amount !== a.amount) return b.amount - a.amount;
    if (a.since !== b.since) return a.since < b.since ? -1 : 1;
    return a.name.localeCompare(b.name, "vi");
  });

  const groups = [];
  for (const entry of sorted) {
    const last = groups[groups.length - 1];
    if (last && last.amount === entry.amount) {
      last.members.push(entry);
    } else {
      if (groups.length === maxGroups) break;
      groups.push({ rank: groups.length + 1, amount: entry.amount, members: [entry] });
    }
  }
  return groups;
}

function initialsOf(name) {
  const words = name.trim().split(/\s+/);
  const picked = words.length > 1 ? [words[words.length - 2], words[words.length - 1]] : words;
  return picked.map((word) => word[0]?.toUpperCase() ?? "").join("");
}

export default function Leaderboard({ contributions, limit = 3 }) {
  const [selectedRank, setSelectedRank] = useState(null);
  const podium = aggregateRankGroups(contributions, Math.min(limit, PODIUM_GROUPS));

  if (podium.length === 0) return null;

  const selectedGroup = podium.find((group) => group.rank === selectedRank) ?? null;

  const toggleGroup = (rank) =>
    setSelectedRank((current) => (current === rank ? null : rank));

  // Bục vinh danh ghim theo cột cố định: hạng 1 luôn ở giữa, hạng 2 bên
  // trái, hạng 3 bên phải — thiếu hạng nào thì ô đó trống, hạng 1 không
  // bao giờ bị lệch khỏi trung tâm.
  const COLUMN_BY_RANK = ["col-start-2", "col-start-1", "col-start-3"];

  return (
    <div className="mx-auto mt-12 max-w-2xl">
      <p className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-heritage-goldSoft">
        <Trophy className="h-4 w-4" aria-hidden="true" />
        Bảng vàng đóng góp
      </p>

      <ol className="mt-8 grid grid-cols-3 items-end gap-3 sm:gap-5">
        {podium.map((group, tier) => {
          const style = TIER_STYLES[tier];
          const isFirst = group.rank === 1;
          const isSelected = selectedRank === group.rank;
          const shownAvatars = group.members.slice(0, MAX_AVATARS_PER_GROUP);
          const extraAvatars = group.members.length - shownAvatars.length;
          const shownNames = group.members.slice(0, MAX_NAMES_PER_GROUP);
          const extraNames = group.members.length - shownNames.length;
          return (
            <motion.li
              key={group.rank}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: 0.6,
                delay: 0.15 + tier * 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`row-start-1 flex min-w-0 ${COLUMN_BY_RANK[tier]}`}
            >
              <button
                type="button"
                onClick={() => toggleGroup(group.rank)}
                aria-expanded={isSelected}
                aria-label={`Xem thành viên hạng ${group.rank}`}
                className={`flex w-full min-w-0 flex-col items-center justify-end rounded-xl pt-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-heritage-gold ${
                  isSelected ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                {isFirst && (
                  <Crown
                    className="mb-2 h-6 w-6 text-heritage-gold"
                    aria-hidden="true"
                  />
                )}
                <div className="flex items-center -space-x-3" aria-hidden="true">
                  {shownAvatars.map((member) => (
                    <span
                      key={member.key}
                      className={`grid shrink-0 place-items-center rounded-full border-2 bg-heritage-blueDark/80 font-display font-bold text-white backdrop-blur ${style.avatar}`}
                    >
                      {initialsOf(member.name)}
                    </span>
                  ))}
                  {extraAvatars > 0 && (
                    <span
                      className={`grid shrink-0 place-items-center rounded-full border-2 bg-heritage-blueDark/80 font-display font-bold text-heritage-goldSoft backdrop-blur ${style.avatar}`}
                    >
                      +{extraAvatars}
                    </span>
                  )}
                </div>
                <div className="mt-2 w-full space-y-0.5">
                  {shownNames.map((member) => (
                    <p
                      key={member.key}
                      className="w-full truncate text-center text-sm font-semibold text-white sm:text-base"
                    >
                      {member.name}
                    </p>
                  ))}
                  {extraNames > 0 && (
                    <p className="w-full truncate text-center text-xs font-semibold text-white/70">
                      +{extraNames} người nữa
                    </p>
                  )}
                </div>
                <p className="w-full truncate text-center text-xs font-bold text-heritage-goldSoft sm:text-sm">
                  {formatCurrency(group.amount)} đ
                </p>
                {group.members.length > 1 && (
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">
                    đồng hạng · {group.members.length} người
                  </p>
                )}
                <div
                  className={`mt-3 grid w-full place-items-center rounded-t-lg ${style.pedestal}`}
                >
                  <span className={`font-display text-2xl font-bold ${style.number}`}>
                    {group.rank}
                  </span>
                </div>
              </button>
            </motion.li>
          );
        })}
      </ol>

      <AnimatePresence>
        {selectedGroup && (
          <motion.div
            key={selectedGroup.rank}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 rounded-xl border border-heritage-gold/25 bg-white/8 p-4 backdrop-blur sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold text-white">
                  Hạng {selectedGroup.rank}
                  {selectedGroup.members.length > 1 && (
                    <span className="ml-2 rounded-full bg-heritage-gold/15 px-2 py-0.5 text-[11px] font-semibold text-heritage-goldSoft">
                      đồng hạng · {selectedGroup.members.length} người
                    </span>
                  )}
                  <span className="mt-0.5 block text-xs font-semibold text-white/65">
                    {formatCurrency(selectedGroup.amount)} đ mỗi người
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedRank(null)}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
                  aria-label="Đóng danh sách hạng"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
              <ul className="mt-3 divide-y divide-white/10">
                {selectedGroup.members.map((member) => (
                  <li key={member.key} className="flex items-center gap-3 py-2.5">
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-heritage-gold/40 bg-heritage-blueDark/80 font-display text-sm font-bold text-heritage-goldSoft"
                      aria-hidden="true"
                    >
                      {initialsOf(member.name)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
                      {member.name}
                    </span>
                    <span className="shrink-0 text-sm font-bold text-heritage-goldSoft">
                      {formatCurrency(member.amount)} đ
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="gold-rule mt-4 h-px w-full" />
    </div>
  );
}
