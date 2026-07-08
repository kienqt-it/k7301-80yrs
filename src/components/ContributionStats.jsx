import { useRef } from "react";
import ReactCountUp from "react-countup";
import { motion, useInView } from "framer-motion";
import { Banknote, ChevronRight, PartyPopper, Target, TrendingUp, Users } from "lucide-react";
import SectionReveal from "./SectionReveal.jsx";
import Fireworks from "./Fireworks.jsx";
import { formatCurrency } from "../utils/format.js";

const CountUp = ReactCountUp.default ?? ReactCountUp;

export default function ContributionStats({
  total,
  targetAmount,
  contributorCount,
  onShowContributors,
}) {
  const progress = Math.min((total / targetAmount) * 100, 100);
  const isGoalReached = targetAmount > 0 && total >= targetAmount;
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: false, amount: 0.3 });
  const celebrate = isGoalReached && inView;

  return (
    <SectionReveal id="dong-gop" className="bg-heritage-blueDark px-4 py-16 text-white sm:px-6 lg:px-8">
      <div ref={sectionRef} className="relative mx-auto max-w-7xl">
        <Fireworks active={celebrate} />
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-heritage-goldSoft">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              Tổng số tiền đã đóng góp
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
              Những tấm lòng đang cùng nhau tạo nên ngày hội
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-white/14 bg-white/10 p-4 backdrop-blur">
              <div className="flex items-center gap-3 text-white/78">
                <Banknote className="h-5 w-5 text-heritage-goldSoft" aria-hidden="true" />
                <span className="text-sm font-medium">Đã ghi nhận</span>
              </div>
              <p className="mt-3 break-words font-display text-3xl font-bold text-heritage-goldSoft sm:text-4xl">
                <CountUp
                  key={total}
                  end={total}
                  duration={2.2}
                  separator="."
                  formattingFn={(value) => formatCurrency(value)}
                />
              </p>
              <p className="mt-1 text-sm text-white/68">đồng</p>
            </div>

            <button
              type="button"
              onClick={onShowContributors}
              className="group rounded-lg border border-white/14 bg-white/10 p-4 text-left backdrop-blur transition hover:border-heritage-gold/50 hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-heritage-gold"
              aria-label="Xem danh sách tất cả thành viên đã đóng góp"
            >
              <div className="flex items-center gap-3 text-white/78">
                <Users className="h-5 w-5 text-heritage-goldSoft" aria-hidden="true" />
                <span className="text-sm font-medium">Thành viên</span>
              </div>
              <p className="mt-3 text-2xl font-bold text-white sm:text-3xl">
                <CountUp key={contributorCount} end={contributorCount} duration={1.6} />
              </p>
              <p className="mt-1 flex items-center justify-between gap-2 text-sm text-white/68">
                người đã đóng góp
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-heritage-goldSoft opacity-80 transition group-hover:opacity-100">
                  Xem danh sách
                  <ChevronRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </p>
            </button>
          </div>
        </div>

        <div
          className={`mt-8 rounded-lg border p-6 text-heritage-blueDark shadow-soft transition-shadow duration-700 ${
            isGoalReached
              ? "border-heritage-gold shadow-[0_0_40px_rgba(212,175,55,0.4)]"
              : "border-white/14"
          } bg-white`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-heritage-red">
                <Target className="h-4 w-4" aria-hidden="true" />
                Thanh tiến độ mục tiêu
              </div>
              {isGoalReached ? (
                <p className="mt-3 flex items-center gap-2 text-xl font-bold text-heritage-red">
                  <PartyPopper className="h-5 w-5 text-heritage-gold" aria-hidden="true" />
                  Đã hoàn thành mục tiêu K7301!
                </p>
              ) : (
                <p className="mt-2 flex items-baseline gap-2">
                  <span className="font-display text-5xl font-bold text-heritage-blueDark sm:text-6xl">
                    {Math.round(progress)}
                    <span className="text-2xl sm:text-3xl">%</span>
                  </span>
                  <span className="text-base font-semibold text-slate-600">
                    mục tiêu K7301
                  </span>
                </p>
              )}
            </div>
            <p className="text-sm leading-6 text-slate-600">
              Mục tiêu:{" "}
              <strong className="text-heritage-blueDark">
                {formatCurrency(targetAmount)} đồng
              </strong>
            </p>
          </div>

          <div className="relative mt-6 h-5 overflow-hidden rounded-md bg-slate-100">
            <motion.div
              className="progress-shine relative h-full rounded-md bg-gradient-to-r from-heritage-red via-heritage-gold to-heritage-blue"
              initial={{ width: "0%" }}
              whileInView={{ width: `${progress}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
            />
            {[25, 50, 75].map((milestone) => (
              <span
                key={milestone}
                className="absolute inset-y-0 w-px bg-heritage-blueDark/15"
                style={{ left: `${milestone}%` }}
                aria-hidden="true"
              />
            ))}
          </div>

          <div className="mt-4 flex flex-col justify-between gap-2 text-sm text-slate-600 sm:flex-row">
            <span>Đã đạt: {formatCurrency(total)} đồng</span>
            <span>Còn lại: {formatCurrency(Math.max(targetAmount - total, 0))} đồng</span>
          </div>
        </div>
      </div>
    </SectionReveal>
  );
}
