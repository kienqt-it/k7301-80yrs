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
 * Bố cục "bàn viết thư": chữ và ảnh tách hẳn hai vùng, không bao giờ đè lên nhau —
 * tấm ảnh tập thể là kỷ vật dán băng dính, hiện nguyên vẹn (biển trường, gương mặt);
 * nền chỉ còn vệt ảnh loang rất mờ làm không khí, không còn là ảnh để đọc.
 *
 * Nhịp mở màn: 0.2s tấm ảnh đặt xuống bàn → 0.5s dòng chữ tay tự viết
 * → 0.95s tiêu đề nét dần → 1.25s câu dẫn → 1.45s nút
 * → 1.8s con dấu đóng lên góc ảnh + vòng mực loang
 * → 2.3s mũi tên cuộn + vệt sáng lướt qua nút vàng một lần.
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

  // Thị sai khi cuộn rời hero: chữ và ảnh trôi lệch nhịp nhau tạo chiều sâu —
  // chỉ transform/opacity, tắt hẳn khi người dùng bật "giảm chuyển động".
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const textY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const photoY = useTransform(scrollYProgress, [0, 1], [0, 42]);
  const fgOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative isolate overflow-hidden bg-heritage-blueDark text-white"
    >
      {/* Vệt ảnh loang làm không khí nền: mờ 10%, nhòe mạnh, không còn chi tiết đọc được */}
      <div className="absolute inset-0 -z-20" aria-hidden="true">
        <img
          src={heroImage}
          alt=""
          className="h-full w-full object-cover opacity-10 blur-lg saturate-[0.6]"
        />
      </div>
      <div className="hero-backdrop absolute inset-0 -z-10" />
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

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-28 sm:px-6 lg:min-h-[88svh] lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:gap-16 lg:pb-24 lg:pt-32 lg:px-8">
        {/* Cột chữ — luôn nằm trên nền xanh đêm đặc, không bao giờ đè lên ảnh */}
        <motion.div
          className="relative min-w-0"
          style={reduceMotion ? undefined : { y: textY, opacity: fgOpacity }}
        >
          {/* Con dấu 80 năm đóng cạnh dòng mở thư, trên nền đặc — không chạm vào ảnh */}
          <motion.div
            className="absolute right-0 top-0"
            initial={{ opacity: 0, scale: 1.7, rotate: -24 }}
            animate={{ opacity: 1, scale: 1, rotate: -10 }}
            transition={{ delay: 1.8, duration: 0.4, ease: EASE_OUT }}
            aria-hidden="true"
          >
            <span className="relative grid h-20 w-20 place-items-center rounded-full border-2 border-heritage-gold/75 p-1 sm:h-24 sm:w-24">
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-heritage-gold/60"
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: [0, 0.65, 0], scale: [1, 1.45, 1.45] }}
                transition={{ delay: 2.2, duration: 0.8, ease: "easeOut", times: [0, 0.25, 1] }}
              />
              <span className="grid h-full w-full place-items-center rounded-full border border-heritage-gold/50 text-center">
                <span className="font-display text-2xl font-bold leading-none text-heritage-goldSoft sm:text-3xl">
                  80
                  <span className="block text-[8px] font-semibold uppercase tracking-[0.3em] text-heritage-gold sm:text-[10px]">
                    năm
                  </span>
                </span>
              </span>
            </span>
          </motion.div>

          {/* Dòng chữ tay tự viết ra như nét mực trên giấy */}
          {/* pr trên mobile chừa chỗ cho con dấu 80 năm, tránh chữ và dấu chồng nhau */}
          <motion.p
            className="pr-20 font-hand text-2xl text-heritage-goldSoft sm:pr-24 sm:text-3xl"
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
              delay: 0.5,
              duration: 1.15,
              ease: [0.5, 0.05, 0.4, 0.95],
              opacity: { delay: 0.5, duration: 0.25 },
            }}
          >
            Tuyên Quang, những mùa phượng đã xa...
          </motion.p>

          {/* Tiêu đề nét dần vào tiêu điểm như ký ức rõ dần */}
          <motion.h1
            className="mt-3 max-w-xl break-words text-4xl font-bold leading-[1.16] text-white sm:text-5xl lg:text-[3.4rem]"
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
            transition={{ delay: 0.95, duration: 0.95, ease: EASE_OUT }}
          >
            {/* &nbsp; giữ từ ghép/danh từ riêng không bị tách khi xuống dòng */}
            Tri ân mái&nbsp;trường Tân&nbsp;Trào
          </motion.h1>

          <motion.p
            {...riseIn(1.25)}
            className="mt-4 max-w-[42ch] break-words text-sm leading-7 text-white/80 sm:text-base sm:leading-8"
          >
            {/* &nbsp; giữ "80 năm" và niên đại không bị ngắt dòng lơ lửng trên mobile */}
            Tấm lòng của tập thể K7301 gửi về Lễ kỷ niệm 80&nbsp;năm thành lập
            trường, 1946&nbsp;–&nbsp;2026.
          </motion.p>

          <motion.div
            {...riseIn(1.45)}
            className="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-7"
          >
            <a
              href="#form-gop"
              className="relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-md bg-heritage-gold px-6 py-3 text-sm font-bold text-heritage-blueDark shadow-soft transition hover:-translate-y-0.5 hover:bg-heritage-goldSoft active:translate-y-0 active:scale-[0.98] sm:w-auto"
            >
              <HeartHandshake className="h-5 w-5" aria-hidden="true" />
              Ghi nhận đóng góp
              {/* Vệt sáng lướt qua một lần sau màn mở, mời gọi mà không thúc ép */}
              <span
                className="pointer-events-none absolute inset-0 animate-shineOnce bg-gradient-to-r from-transparent via-white/50 to-transparent"
                aria-hidden="true"
              />
            </a>
            {/* Hành động phụ là text-link để bớt một khối hộp */}
            <a
              href="#thu-ngo"
              className="inline-flex items-center gap-2 py-2 text-sm font-semibold text-white/85 underline decoration-heritage-gold/70 decoration-2 underline-offset-8 transition hover:text-white hover:decoration-heritage-gold"
            >
              Đọc thư ngỏ
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </a>
          </motion.div>
        </motion.div>

        {/* Tấm ảnh kỷ vật: dán băng dính lên nền, hiện nguyên vẹn — không chữ nào đè lên */}
        <motion.figure
          className="relative mx-auto w-full max-w-md min-w-0 lg:max-w-none"
          style={reduceMotion ? undefined : { y: photoY, opacity: fgOpacity }}
        >
          <motion.div
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 30, scale: 1.05, rotate: 1.5 }
            }
            animate={
              reduceMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0, scale: 1, rotate: 0 }
            }
            transition={{ delay: 0.2, duration: 1.05, ease: EASE_OUT }}
          >
            {/* Khung giấy kem + độ nghiêng nhẹ như ảnh dán trong sổ lưu bút */}
            <div className="relative -rotate-[1.5deg] bg-heritage-paper p-2.5 pb-3 shadow-letter sm:p-3 sm:pb-4">
              <span
                className="tape -left-5 -top-2 -rotate-45 scale-90 sm:scale-100"
                aria-hidden="true"
              />
              <span
                className="tape -right-5 -top-2 rotate-45 scale-90 sm:scale-100"
                aria-hidden="true"
              />
              <img
                src={heroImage}
                fetchpriority="high"
                alt="Tập thể K7301 trong lễ phục, chụp trước Trường THPT Tân Trào"
                className="w-full"
                style={{ filter: "sepia(0.18) saturate(1.05)" }}
              />
              <figcaption className="mt-2.5 text-center font-hand text-xl leading-snug text-heritage-sepia sm:mt-3 sm:text-2xl">
                Tập thể K7301 — trước mái trường thân yêu
              </figcaption>
            </div>
          </motion.div>
        </motion.figure>
      </div>

      <motion.a
        href="#thu-ngo"
        aria-label="Cuộn xuống đọc thư ngỏ"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-white/70 transition hover:text-white lg:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.3, duration: 0.8 }}
      >
        <ArrowDown
          className="h-6 w-6 animate-nudgeDown drop-shadow-[0_1px_3px_rgba(23,37,84,0.6)]"
          aria-hidden="true"
        />
      </motion.a>
    </section>
  );
}
