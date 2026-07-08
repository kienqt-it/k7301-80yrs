import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowDown, HeartHandshake } from "lucide-react";
import heroImage from "../assets/tan-trao-hero.jpg";

const EASE_OUT = [0.22, 1, 0.36, 1];

/*
 * Nhịp mở màn "ký ức hiện về" — một chuỗi nghi thức duy nhất:
 * 0.0s ánh giấy rút đi (ảnh cũ "tráng" dần) → 0.2s dòng chữ tay tự viết
 * → 0.85s tiêu đề nét dần → 1.15s câu dẫn → 1.35s nút
 * → 1.7s con dấu đóng xuống + vòng mực loang
 * → 2.2s mũi tên cuộn + vệt sáng lướt qua nút vàng một lần.
 */
const riseIn = (delay, distance = 26) => ({
  initial: { opacity: 0, y: distance },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.9, ease: EASE_OUT },
});

const dustParticles = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 137) % 100}%`,
  bottom: `${(i * 53) % 34}%`,
  size: 3 + ((i * 7) % 5),
  duration: `${11 + ((i * 29) % 10)}s`,
  delay: `${(i * 13) % 14}s`,
}));

export default function Hero() {
  const sectionRef = useRef(null);
  const reduceMotion = useReducedMotion();

  // Thị sai khi cuộn rời hero: ảnh nền trôi chậm hơn, nội dung lùi về sau —
  // chỉ transform/opacity, tắt hẳn khi người dùng bật "giảm chuyển động".
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "9%"]);
  const fgY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const fgOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative isolate min-h-[82svh] overflow-hidden bg-heritage-blueDark text-white"
    >
      {/* Bọc ảnh trong lớp thị sai; kéo dư 12% phía trên để không hở mép khi ảnh trôi xuống */}
      <motion.div
        className="absolute inset-x-0 -top-[12%] bottom-0 -z-20"
        style={reduceMotion ? undefined : { y: bgY }}
      >
        <img
          src={heroImage}
          fetchpriority="high"
          alt="Không khí tri ân mái trường Tân Trào trong ánh chiều vàng"
          className="h-full w-full origin-bottom animate-kenburns object-cover object-bottom"
          style={{ filter: "sepia(0.3) saturate(1.05) contrast(1.02)" }}
        />
      </motion.div>
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

      {/* Ánh giấy ấm phủ lúc mở trang rồi rút đi — tấm ảnh cũ đang "tráng" dần */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-[4]"
        style={{
          background:
            "linear-gradient(180deg, rgba(253, 241, 215, 0.9) 0%, rgba(255, 250, 240, 0.7) 100%)",
        }}
        initial={{ opacity: 0.85 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.3, ease: "easeOut" }}
        aria-hidden="true"
      />

      {/* Con dấu kỷ niệm 80 năm — đóng xuống sau cùng, kèm vòng mực loang một nhịp */}
      <motion.div
        className="absolute right-4 top-[92px] z-10 sm:right-10 sm:top-28"
        initial={{ opacity: 0, scale: 1.7, rotate: -24 }}
        animate={{ opacity: 1, scale: 1, rotate: -10 }}
        transition={{ delay: 1.7, duration: 0.4, ease: EASE_OUT }}
        aria-hidden="true"
      >
        <span className="relative grid h-20 w-20 place-items-center rounded-full border-2 border-heritage-gold/75 p-1 sm:h-28 sm:w-28">
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-heritage-gold/60"
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: [0, 0.65, 0], scale: [1, 1.45, 1.45] }}
            transition={{ delay: 2.1, duration: 0.8, ease: "easeOut", times: [0, 0.25, 1] }}
          />
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
          style={reduceMotion ? undefined : { y: fgY, opacity: fgOpacity }}
        >
          {/* Dòng chữ tay tự viết ra như nét mực trên giấy */}
          {/* pr trên mobile chừa chỗ cho con dấu 80 năm, tránh chữ và dấu chồng nhau */}
          <motion.p
            className="pr-20 font-hand text-2xl text-heritage-goldSoft sm:pr-0 sm:text-3xl"
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, clipPath: "inset(-25% 100% -35% 0)" }
            }
            animate={
              reduceMotion
                ? { opacity: 1 }
                : { opacity: 1, clipPath: "inset(-25% -6% -35% -6%)" }
            }
            transition={{
              delay: 0.2,
              duration: 1.15,
              ease: [0.5, 0.05, 0.4, 0.95],
              opacity: { delay: 0.2, duration: 0.25 },
            }}
          >
            Tuyên Quang, những mùa phượng đã xa...
          </motion.p>

          {/* Tiêu đề nét dần vào tiêu điểm như ký ức rõ dần */}
          <motion.h1
            className="mt-3 max-w-3xl break-words text-5xl font-bold leading-[1.12] text-white sm:text-6xl lg:text-7xl"
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 34, filter: "blur(8px)" }
            }
            animate={
              reduceMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0, filter: "blur(0px)" }
            }
            transition={{ delay: 0.85, duration: 0.95, ease: EASE_OUT }}
          >
            {/* &nbsp; giữ từ ghép/danh từ riêng không bị tách khi xuống dòng */}
            Tri ân mái&nbsp;trường Tân&nbsp;Trào
          </motion.h1>

          <motion.p
            {...riseIn(1.15)}
            className="mt-5 max-w-[34ch] break-words text-base leading-8 text-white/90 sm:max-w-xl sm:text-lg"
          >
            {/* &nbsp; giữ "80 năm" và niên đại không bị ngắt dòng lơ lửng trên mobile */}
            Tấm lòng của tập thể K7301 gửi về Lễ kỷ niệm 80&nbsp;năm thành lập
            trường, 1946&nbsp;–&nbsp;2026.
          </motion.p>

          <motion.div
            {...riseIn(1.35)}
            className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-7"
          >
            <a
              href="#form-gop"
              className="relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-md bg-heritage-gold px-6 py-3 text-sm font-bold text-heritage-blueDark shadow-soft transition hover:-translate-y-0.5 hover:bg-heritage-goldSoft active:translate-y-0 active:scale-[0.98]"
            >
              <HeartHandshake className="h-5 w-5" aria-hidden="true" />
              Ghi nhận đóng góp
              {/* Vệt sáng lướt qua một lần sau màn mở, mời gọi mà không thúc ép */}
              <span
                className="pointer-events-none absolute inset-0 animate-shineOnce bg-gradient-to-r from-transparent via-white/50 to-transparent"
                aria-hidden="true"
              />
            </a>
            {/* Hành động phụ là text-link để bớt một khối hộp trên nền ảnh */}
            <a
              href="#thu-ngo"
              className="inline-flex items-center gap-2 py-2 text-sm font-semibold text-white/85 underline decoration-heritage-gold/70 decoration-2 underline-offset-8 transition hover:text-white hover:decoration-heritage-gold"
            >
              Đọc thư ngỏ
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
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
        transition={{ delay: 2.2, duration: 0.8 }}
      >
        <ArrowDown
          className="h-6 w-6 animate-nudgeDown drop-shadow-[0_1px_3px_rgba(23,37,84,0.6)]"
          aria-hidden="true"
        />
      </motion.a>
    </section>
  );
}
