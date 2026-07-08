import { motion, useScroll, useSpring } from "framer-motion";
import { HeartHandshake, Landmark, Users } from "lucide-react";

const navItems = [
  ["Thư ngỏ & mục tiêu", "thu-ngo"],
  ["Đóng góp", "dong-gop"],
  ["Chuyển khoản", "chuyen-khoan"],
];

export default function Header({ onShowContributors }) {
  // Sợi chỉ vàng chạy theo tiến độ cuộn trang — thay thanh progress bar thô
  const { scrollYProgress } = useScroll();
  const threadProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-heritage-blueDark/75 text-white backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <a href="#top" className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-heritage-gold/55 bg-white/10">
            <Landmark className="h-5 w-5 text-heritage-goldSoft" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold tracking-wide">
              K7301
            </span>
            <span className="block truncate text-xs text-white/75">
              Tri ân mái trường Tân Trào
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Điều hướng chính">
          {navItems.map(([label, href]) => (
            <a
              key={href}
              href={`#${href}`}
              className="rounded-md px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              {label}
            </a>
          ))}
          <button
            type="button"
            onClick={onShowContributors}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-heritage-goldSoft transition hover:bg-white/10 hover:text-heritage-gold"
          >
            <Users className="h-4 w-4" aria-hidden="true" />
            Danh sách đóng góp
          </button>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onShowContributors}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/20 bg-white/10 text-heritage-goldSoft transition hover:bg-white/20 md:hidden"
            aria-label="Xem danh sách thành viên đã đóng góp"
          >
            <Users className="h-4 w-4" aria-hidden="true" />
          </button>
          <a
            href="#form-gop"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-md bg-heritage-gold text-sm font-semibold text-heritage-blueDark shadow-sm transition hover:bg-heritage-goldSoft sm:w-auto sm:px-3 sm:py-2"
            aria-label="Ghi nhận đóng góp"
          >
            <HeartHandshake className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Ghi nhận đóng góp</span>
          </a>
        </div>
      </div>
      <div className="relative" aria-hidden="true">
        <div className="gold-rule h-px w-full" />
        <motion.div
          className="absolute inset-x-0 top-0 h-[2px] origin-left bg-heritage-gold shadow-[0_0_8px_rgba(212,175,55,0.7)]"
          style={{ scaleX: threadProgress }}
        />
      </div>
    </header>
  );
}
