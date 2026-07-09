import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowDown, HeartHandshake, X, ZoomIn } from "lucide-react";
// Ba cỡ ảnh xuất sẵn từ bản gốc 2400px — mobile chỉ tải ~82KB thay vì 524KB
import heroImage800 from "../assets/tan-trao-hero-800.jpg";
import heroImage1200 from "../assets/tan-trao-hero-1200.jpg";
import heroImage1600 from "../assets/tan-trao-hero-1600.jpg";

const HERO_SRCSET = `${heroImage800} 800w, ${heroImage1200} 1200w, ${heroImage1600} 1600w`;
// Khung ảnh rộng tối đa 32rem (cột phải lg) / 28rem (max-w-md mobile)
const HERO_SIZES = "(min-width: 1024px) 32rem, (min-width: 480px) 28rem, 100vw";

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
  const lightboxRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const [photoOpen, setPhotoOpen] = useState(false);

  // Lightbox mở: khóa cuộn trang, Esc để đóng, đóng xong trả focus về
  // đúng tấm ảnh vừa bấm (theo nếp của ContributorListDialog).
  useEffect(() => {
    if (!photoOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setPhotoOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    lightboxRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [photoOpen]);

  // Thị sai khi cuộn rời hero: chữ và ảnh trôi lệch nhịp nhau tạo chiều sâu.
  // Chỉ dịch chuyển (transform), KHÔNG làm mờ theo cuộn — ảnh kỷ vật phải luôn
  // rõ nét chừng nào còn trên màn hình. Tắt hẳn khi người dùng bật "giảm chuyển động".
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const textY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const photoY = useTransform(scrollYProgress, [0, 1], [0, 30]);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative isolate overflow-hidden bg-heritage-blueDark text-white"
    >
      {/* Vệt ảnh loang làm không khí nền: mờ 10%, nhòe mạnh, không còn chi tiết đọc được —
          dùng bản 800w là đủ vì đằng nào cũng blur */}
      <div className="absolute inset-0 -z-20" aria-hidden="true">
        <img
          src={heroImage800}
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

      {/* grid-cols-1 (minmax 0) chặn cột tự nở theo max-content làm ảnh tràn mép phải trên mobile */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 pb-20 pt-28 sm:px-6 lg:min-h-[88svh] lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:gap-16 lg:px-8 lg:pb-24 lg:pt-32">
        {/* Cột chữ — luôn nằm trên nền xanh đêm đặc, không bao giờ đè lên ảnh */}
        <motion.div
          className="relative min-w-0"
          style={reduceMotion ? undefined : { y: textY }}
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
          style={reduceMotion ? undefined : { y: photoY }}
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
            {/* Khung giấy kem + độ nghiêng nhẹ như ảnh dán trong sổ lưu bút.
                Cả tấm ảnh là nút bấm: nhấc ảnh lên xem gần (lightbox) — hover
                thì ảnh thẳng lại và nhích lên như sắp được gỡ khỏi mặt bàn */}
            <motion.button
              type="button"
              onClick={() => setPhotoOpen(true)}
              initial={{ rotate: -1.5 }}
              animate={{ rotate: -1.5 }}
              whileHover={{ rotate: 0, y: -5 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
              aria-haspopup="dialog"
              aria-label="Phóng to ảnh kỷ niệm tập thể K7301"
              className="group relative block w-full cursor-zoom-in bg-heritage-paper p-2.5 pb-3 text-left shadow-letter transition-shadow duration-300 hover:shadow-[0_30px_72px_rgba(90,62,20,0.3)] sm:p-3 sm:pb-4"
            >
              <span
                className="tape -left-5 -top-2 -rotate-45 scale-90 sm:scale-100"
                aria-hidden="true"
              />
              <span
                className="tape -right-5 -top-2 rotate-45 scale-90 sm:scale-100"
                aria-hidden="true"
              />
              {/* Ảnh để nguyên bản, không phủ filter — kỷ vật phải rõ từng gương mặt */}
              <span className="relative block">
                <img
                  src={heroImage1600}
                  srcSet={HERO_SRCSET}
                  sizes={HERO_SIZES}
                  width={1600}
                  height={1067}
                  fetchpriority="high"
                  alt="Tập thể K7301 trong lễ phục, chụp trước Trường THPT Tân Trào"
                  className="h-auto w-full"
                />
                {/* Gợi ý chạm — luôn hiện vì mobile không có hover, đậm lên khi hover */}
                <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-heritage-blueDark/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition group-hover:bg-heritage-blueDark/80">
                  <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
                  Xem ảnh
                </span>
              </span>
              <span className="mt-2.5 block text-center font-hand text-xl leading-snug text-heritage-sepia sm:mt-3 sm:text-2xl">
                Tập thể K7301 — trước mái trường thân yêu
              </span>
            </motion.button>
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

      {/* Lightbox: nhấc tấm ảnh kỷ vật lên ngang tầm mắt — ảnh thẳng lại,
          căn phòng tối đi. Với "giảm chuyển động", MotionConfig tự bỏ phần
          dịch chuyển và chỉ giữ crossfade. */}
      <AnimatePresence>
        {photoOpen && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label="Ảnh kỷ niệm tập thể K7301 — xem phóng to"
          >
            <div
              className="absolute inset-0 bg-heritage-blueDark/85 backdrop-blur-md"
              onClick={() => setPhotoOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              ref={lightboxRef}
              tabIndex={-1}
              initial={{ opacity: 0, scale: 0.86, y: 28, rotate: -1.5 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
              exit={{
                opacity: 0,
                scale: 0.92,
                y: 16,
                rotate: -1,
                transition: { duration: 0.3, ease: EASE_OUT },
              }}
              transition={{ duration: 0.42, ease: EASE_OUT }}
              className="relative max-w-[min(92vw,68rem)] outline-none"
            >
              <figure className="relative bg-heritage-paper p-2.5 pb-3 shadow-[0_40px_120px_rgba(0,0,0,0.55)] sm:p-3 sm:pb-4">
                <span className="tape -left-5 -top-2 -rotate-45" aria-hidden="true" />
                <span className="tape -right-5 -top-2 rotate-45" aria-hidden="true" />
                <img
                  src={heroImage1600}
                  srcSet={HERO_SRCSET}
                  sizes="92vw"
                  width={1600}
                  height={1067}
                  alt="Tập thể K7301 trong lễ phục, chụp trước Trường THPT Tân Trào"
                  className="block h-auto max-h-[72svh] w-auto max-w-full cursor-zoom-out"
                  onClick={() => setPhotoOpen(false)}
                />
                <figcaption className="mt-2.5 text-center font-hand text-xl leading-snug text-heritage-sepia sm:mt-3 sm:text-2xl">
                  Tập thể K7301 — trước mái trường thân yêu
                </figcaption>
              </figure>
              <button
                type="button"
                onClick={() => setPhotoOpen(false)}
                className="absolute -right-3 -top-3 grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-heritage-blueDark/90 text-white/85 shadow-lg backdrop-blur transition hover:bg-heritage-blueDark hover:text-white"
                aria-label="Đóng ảnh"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
