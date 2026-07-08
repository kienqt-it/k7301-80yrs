import { motion } from "framer-motion";
import { ArrowDown, CalendarHeart, HeartHandshake } from "lucide-react";
import heroImage from "../assets/tan-trao-hero.jpg";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.16, delayChildren: 0.2 } },
};

const item = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

const dustParticles = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 137) % 100}%`,
  bottom: `${(i * 53) % 34}%`,
  size: 3 + ((i * 7) % 5),
  duration: `${11 + ((i * 29) % 10)}s`,
  delay: `${(i * 13) % 14}s`,
}));

export default function Hero() {
  return (
    <section
      id="top"
      className="relative isolate min-h-[82svh] overflow-hidden bg-heritage-blueDark text-white"
    >
      <img
        src={heroImage}
        alt="Không khí tri ân mái trường Tân Trào trong ánh chiều vàng"
        className="absolute inset-0 -z-20 h-full w-full origin-bottom animate-kenburns object-cover object-bottom"
        style={{ filter: "sepia(0.3) saturate(1.05) contrast(1.02)" }}
      />
      <div className="hero-vignette absolute inset-0 -z-10" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-heritage-paper to-transparent" />

      <div className="pointer-events-none absolute inset-0 -z-[5]" aria-hidden="true">
        {dustParticles.map((particle, index) => (
          <span
            key={index}
            className="absolute animate-floatUp rounded-full bg-heritage-goldSoft/80"
            style={{
              left: particle.left,
              bottom: particle.bottom,
              width: particle.size,
              height: particle.size,
              animationDuration: particle.duration,
              animationDelay: particle.delay,
              boxShadow: "0 0 10px rgba(246, 230, 168, 0.75)",
            }}
          />
        ))}
      </div>

      {/* Con dấu kỷ niệm 80 năm — đóng xuống như dấu mộc sau khi chữ hiện xong */}
      <motion.div
        className="absolute right-4 top-[92px] z-10 sm:right-10 sm:top-28"
        initial={{ opacity: 0, scale: 1.7, rotate: -24 }}
        animate={{ opacity: 1, scale: 1, rotate: -10 }}
        transition={{ delay: 1.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      >
        <span className="grid h-20 w-20 place-items-center rounded-full border-2 border-heritage-gold/75 p-1 sm:h-28 sm:w-28">
          <span className="grid h-full w-full place-items-center rounded-full border border-heritage-gold/50 text-center">
            <span className="font-display text-2xl font-bold leading-none text-heritage-goldSoft sm:text-4xl">
              80
              <span className="block text-[8px] font-semibold uppercase tracking-[0.3em] text-heritage-gold sm:text-[10px]">
                năm
              </span>
            </span>
          </span>
        </span>
      </motion.div>

      <div className="mx-auto flex min-h-[82svh] max-w-7xl items-center px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <motion.div
          className="w-full min-w-0 max-w-3xl"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          <motion.p
            variants={item}
            className="font-hand text-2xl text-heritage-goldSoft sm:text-3xl"
          >
            Tuyên Quang, những mùa phượng đã xa...
          </motion.p>

          <motion.div
            variants={item}
            className="mb-6 mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-heritage-goldSoft"
          >
            <span className="inline-flex items-center gap-2">
              <CalendarHeart className="h-4 w-4" aria-hidden="true" />
              1946 - 2026
            </span>
            <span className="h-px w-12 bg-heritage-gold" aria-hidden="true" />
            <span>80 năm Trường THPT Tân Trào</span>
          </motion.div>

          <motion.h1
            variants={item}
            className="max-w-3xl break-words text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl"
          >
            K7301 - Tri ân mái trường Tân Trào
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-[32ch] break-words text-base leading-8 text-white/88 sm:max-w-2xl sm:text-lg"
          >
            Cùng nhau góp một phần nghĩa tình của tập thể K7301, hướng tới Lễ
            kỷ niệm 80 năm thành lập Trường THPT Tân Trào 1946 - 2026.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-9 flex max-w-[32ch] flex-col gap-3 sm:max-w-none sm:flex-row"
          >
            <a
              href="#form-gop"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-heritage-gold px-5 py-3 text-sm font-bold text-heritage-blueDark shadow-soft transition hover:bg-heritage-goldSoft"
            >
              <HeartHandshake className="h-5 w-5" aria-hidden="true" />
              Ghi nhận đóng góp
            </a>
            <a
              href="#thu-ngo"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/50 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/18"
            >
              <ArrowDown className="h-5 w-5" aria-hidden="true" />
              Đọc thư ngỏ
            </a>
          </motion.div>
        </motion.div>
      </div>

      <motion.a
        href="#thu-ngo"
        aria-label="Cuộn xuống đọc thư ngỏ"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-white/70 transition hover:text-white sm:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
      >
        <ArrowDown className="h-6 w-6 animate-nudgeDown" aria-hidden="true" />
      </motion.a>
    </section>
  );
}
