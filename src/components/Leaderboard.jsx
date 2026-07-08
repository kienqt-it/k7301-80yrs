import { motion } from "framer-motion";
import { Crown, Trophy } from "lucide-react";
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

const MAX_AVATARS_PER_GROUP = 3;
const MAX_NAMES_PER_GROUP = 3;

// Cộng dồn theo thành viên: memberKey (server tính từ họ tên + SĐT);
// dữ liệu chưa có memberKey thì tạm gộp theo tên như trước.
// Xếp hạng kiểu thi đấu (1-1-3): góp bằng tiền nhau là đồng hạng — gom chung
// một nhóm/bục để không ai bị cắt mất; hạng kế tiếp bị nhảy cách theo số
// người của các nhóm trước. Trong nhóm, ai đóng góp sớm hơn đứng trước.
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
  let assigned = 0;
  for (const entry of sorted) {
    const last = groups[groups.length - 1];
    if (last && last.amount === entry.amount) {
      last.members.push(entry);
    } else {
      if (groups.length === maxGroups) break;
      groups.push({ rank: assigned + 1, amount: entry.amount, members: [entry] });
    }
    assigned += 1;
  }
  return groups;
}

function initialsOf(name) {
  const words = name.trim().split(/\s+/);
  const picked = words.length > 1 ? [words[words.length - 2], words[words.length - 1]] : words;
  return picked.map((word) => word[0]?.toUpperCase() ?? "").join("");
}

export default function Leaderboard({ contributions, limit = 3 }) {
  const groups = aggregateRankGroups(contributions, Math.min(limit, 3));

  if (groups.length === 0) return null;

  // Bục vinh danh: nhóm hạng nhì - nhóm hạng nhất - nhóm hạng ba;
  // thiếu nhóm nào thì bỏ trống chỗ đó.
  const slots =
    groups.length === 3
      ? [groups[1], groups[0], groups[2]]
      : [groups[1], groups[0], groups[2]].filter(Boolean);

  return (
    <div className="mx-auto mt-12 max-w-2xl">
      <p className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-heritage-goldSoft">
        <Trophy className="h-4 w-4" aria-hidden="true" />
        Bảng vàng đóng góp
      </p>

      <ol className="mt-8 grid grid-cols-3 items-end gap-3 sm:gap-5">
        {slots.map((group, slotIndex) => {
          const tier = groups.indexOf(group);
          const style = TIER_STYLES[tier];
          const isFirst = group.rank === 1;
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
            </motion.li>
          );
        })}
      </ol>
      <div className="gold-rule h-px w-full" />
    </div>
  );
}
