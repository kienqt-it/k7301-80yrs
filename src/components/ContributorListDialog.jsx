import { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Heart, Quote, Users, X } from "lucide-react";
import { formatCurrency, formatDate } from "../utils/format.js";

function initialsOf(name) {
  const parts = String(name || "").trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "?";
  const last = parts[parts.length - 1];
  return last.charAt(0).toUpperCase();
}

const AVATAR_TONES = [
  "from-heritage-red to-heritage-redDark",
  "from-heritage-gold to-heritage-sepia",
  "from-heritage-blue to-heritage-blueDark",
];

// Gộp các lượt đóng góp của cùng một thành viên (memberKey do server tính từ
// họ tên + số điện thoại; dữ liệu cũ chưa có memberKey thì tạm gộp theo tên).
function groupByMember(contributions) {
  const map = new Map();
  for (const person of contributions) {
    const key =
      person.memberKey ??
      `${String(person.name || "").trim().replace(/\s+/g, " ").toLowerCase()}|${String(
        person.phone || "",
      ).replace(/\D/g, "")}`;
    let member = map.get(key);
    if (!member) {
      member = { key, name: person.name, total: 0, entries: [] };
      map.set(key, member);
    }
    member.total += Number(person.amount) || 0;
    member.entries.push(person);
  }
  return [...map.values()];
}

export default function ContributorListDialog({ open, onClose, contributions }) {
  const panelRef = useRef(null);
  const members = useMemo(() => groupByMember(contributions), [contributions]);
  const total = useMemo(
    () => contributions.reduce((sum, person) => sum + (Number(person.amount) || 0), 0),
    [contributions],
  );

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="contributor-dialog-title"
        >
          <div
            className="absolute inset-0 bg-heritage-blueDark/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={panelRef}
            tabIndex={-1}
            initial={{ opacity: 0, y: 48, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 48, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex max-h-[85dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-heritage-paper text-heritage-blueDark shadow-letter outline-none sm:max-h-[82vh] sm:max-w-2xl sm:rounded-2xl"
          >
            <div className="relative shrink-0 overflow-hidden bg-heritage-blueDark px-5 py-5 text-white sm:px-7">
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-heritage-gold/15 blur-2xl"
                aria-hidden="true"
              />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-heritage-goldSoft">
                    <Users className="h-4 w-4" aria-hidden="true" />
                    Danh sách đóng góp
                  </p>
                  <h2
                    id="contributor-dialog-title"
                    className="mt-2 text-xl font-bold leading-snug sm:text-2xl"
                  >
                    Những tấm lòng gửi về K7301
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-white/85 transition hover:bg-white/20 hover:text-white"
                  aria-label="Đóng danh sách"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border border-heritage-gold/40 bg-white/10 px-3 py-1.5 font-semibold text-heritage-goldSoft">
                  <Heart className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  {members.length} thành viên · {contributions.length} lượt
                </span>
                <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1.5 font-semibold text-white/90">
                  Tổng: {formatCurrency(total)} đồng
                </span>
              </div>
            </div>

            <div className="grow overflow-y-auto overscroll-contain px-3 py-3 sm:px-5 sm:py-4">
              {contributions.length === 0 ? (
                <div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
                  <Heart className="h-12 w-12 text-heritage-gold/30" aria-hidden="true" />
                  <p className="font-hand text-2xl text-heritage-sepia">
                    Hãy là người đầu tiên gửi tấm lòng về mái trường...
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-heritage-gold/15">
                  {members.map((member, index) => (
                    <li key={member.key}>
                      <div className="flex items-start gap-3 rounded-lg px-2 py-3.5 transition hover:bg-heritage-cream/60 sm:gap-4 sm:px-3">
                        <span
                          className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-sm ${
                            AVATAR_TONES[index % AVATAR_TONES.length]
                          }`}
                          aria-hidden="true"
                        >
                          {initialsOf(member.name)}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                            <h3 className="flex min-w-0 items-baseline gap-2 text-sm font-bold sm:text-base">
                              <span className="min-w-0 truncate">{member.name}</span>
                              {member.entries.length > 1 && (
                                <span className="shrink-0 rounded-full bg-heritage-gold/15 px-2 py-0.5 text-[11px] font-semibold text-heritage-sepia">
                                  {member.entries.length} lượt
                                </span>
                              )}
                            </h3>
                            <p className="shrink-0 text-sm font-bold text-heritage-red sm:text-base">
                              {formatCurrency(member.total)} đ
                            </p>
                          </div>

                          {member.entries.length === 1 ? (
                            <>
                              {member.entries[0].note && (
                                <p className="mt-1 flex items-start gap-1.5 font-hand text-lg leading-snug text-heritage-sepia">
                                  <Quote
                                    className="mt-1 h-3 w-3 shrink-0 text-heritage-gold"
                                    aria-hidden="true"
                                  />
                                  <span className="min-w-0 break-words">
                                    {member.entries[0].note}
                                  </span>
                                </p>
                              )}
                              {(member.entries[0].confirmed_at || member.entries[0].paidAt) && (
                                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                                  <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                                  {formatDate(
                                    member.entries[0].confirmed_at || member.entries[0].paidAt,
                                  )}
                                </p>
                              )}
                            </>
                          ) : (
                            <ul className="mt-2 space-y-2.5 border-l-2 border-heritage-gold/25 pl-3">
                              {member.entries.map((entry, entryIndex) => (
                                <li key={entry.id ?? entryIndex}>
                                  {entry.note && (
                                    <p className="flex items-start gap-1.5 font-hand text-lg leading-snug text-heritage-sepia">
                                      <Quote
                                        className="mt-1 h-3 w-3 shrink-0 text-heritage-gold"
                                        aria-hidden="true"
                                      />
                                      <span className="min-w-0 break-words">{entry.note}</span>
                                    </p>
                                  )}
                                  <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-500">
                                    <CalendarDays
                                      className="h-3.5 w-3.5 shrink-0"
                                      aria-hidden="true"
                                    />
                                    {formatDate(entry.confirmed_at || entry.paidAt)}
                                    <span aria-hidden="true">·</span>
                                    <span className="font-semibold text-heritage-sepia">
                                      {formatCurrency(entry.amount)} đ
                                    </span>
                                  </p>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="shrink-0 border-t border-heritage-gold/20 bg-heritage-cream/50 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-center text-xs text-heritage-sepia sm:text-sm">
              Trân trọng cảm ơn từng tấm lòng đã cùng hướng về mái trường Tân Trào 💛
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
