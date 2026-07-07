import { motion, useReducedMotion } from "framer-motion";

// Một chu kỳ trình diễn: các quả pháo lần lượt bay lên và nổ, rồi lặp lại.
const CYCLE = 6.4;
const FLIGHT_TIME = 0.9;

const PALETTES = {
  gold: ["#fff7d6", "#f6e6a8", "#d4af37"],
  red: ["#fecaca", "#f87171", "#f6e6a8"],
  cream: ["#ffffff", "#fdf1d7", "#f6e6a8"],
};

// Vị trí nổ và thời điểm phóng (giây) trong mỗi chu kỳ — dàn đều, không chồng lấn
const BURSTS = [
  { left: "14%", top: "30%", palette: "gold", size: 1, at: 0.3 },
  { left: "50%", top: "16%", palette: "gold", size: 1.3, at: 1.5 },
  { left: "84%", top: "28%", palette: "red", size: 0.95, at: 2.7 },
  { left: "32%", top: "22%", palette: "cream", size: 0.85, at: 3.9 },
  { left: "68%", top: "34%", palette: "gold", size: 1.05, at: 5.0 },
];

function Ring({ colors, size, burstAt, count, radiusScale, dotClass, duration }) {
  return Array.from({ length: count }, (_, i) => {
    const angle = ((i + (radiusScale < 1 ? 0.5 : 0)) / count) * Math.PI * 2;
    const radius = 74 * size * radiusScale;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const color = colors[i % colors.length];
    return (
      <motion.span
        key={`${radiusScale}-${i}`}
        className={`absolute left-0 top-0 rounded-full ${dotClass}`}
        style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
        initial={{ x: 0, y: 0, opacity: 0 }}
        animate={{
          x: [0, x * 0.75, x],
          y: [0, y * 0.75, y + 30 * size],
          opacity: [1, 1, 0],
          scale: [1, 1, 0.4],
        }}
        transition={{
          duration,
          delay: burstAt,
          repeat: Infinity,
          repeatDelay: CYCLE - duration,
          ease: "easeOut",
          times: [0, 0.55, 1],
        }}
      />
    );
  });
}

function Burst({ left, top, palette, size, at }) {
  const colors = PALETTES[palette];
  const burstAt = at + FLIGHT_TIME;

  return (
    <div className="absolute" style={{ left, top }}>
      {/* Quả pháo bay vút lên, để lại vệt sáng */}
      <motion.span
        className="absolute -left-px top-0 h-4 w-[3px] rounded-full"
        style={{
          background: "linear-gradient(to top, transparent, #f6e6a8)",
          boxShadow: "0 0 8px rgba(246, 230, 168, 0.8)",
        }}
        initial={{ y: "36vh", opacity: 0 }}
        animate={{ y: ["36vh", "0vh"], opacity: [0, 1, 0.9, 0] }}
        transition={{
          duration: FLIGHT_TIME,
          delay: at,
          repeat: Infinity,
          repeatDelay: CYCLE - FLIGHT_TIME,
          ease: [0.2, 0.8, 0.4, 1],
          times: [0, 0.2, 0.8, 1],
        }}
      />

      {/* Lóe sáng trung tâm khi nổ */}
      <motion.span
        className="absolute -left-2 -top-2 h-4 w-4 rounded-full"
        style={{
          background:
            "radial-gradient(circle, #ffffff 0%, rgba(246, 230, 168, 0.8) 40%, transparent 70%)",
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 3.4 * size, 4.4 * size], opacity: [0, 0.95, 0] }}
        transition={{
          duration: 0.7,
          delay: burstAt,
          repeat: Infinity,
          repeatDelay: CYCLE - 0.7,
        }}
      />

      {/* Vòng tia ngoài + vòng tia trong lệch góc, rơi nhẹ theo trọng lực */}
      <Ring
        colors={colors}
        size={size}
        burstAt={burstAt}
        count={16}
        radiusScale={1}
        dotClass="h-1.5 w-1.5"
        duration={1.5}
      />
      <Ring
        colors={colors}
        size={size}
        burstAt={burstAt + 0.08}
        count={8}
        radiusScale={0.5}
        dotClass="h-1 w-1"
        duration={1.2}
      />
    </div>
  );
}

export default function Fireworks({ active }) {
  const reduceMotion = useReducedMotion();
  if (!active || reduceMotion) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {BURSTS.map((burst) => (
        <Burst key={burst.left + burst.top} {...burst} />
      ))}
    </div>
  );
}
