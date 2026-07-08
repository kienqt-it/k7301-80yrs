// Mép giấy xé — đường xé nham nhở giả-ngẫu-nhiên nhưng ổn định giữa các lần render.
// Đặt ở đỉnh một section: tô màu của section NGAY TRÊN (currentColor) để trông như
// tờ giấy phía trên bị xé dở, rủ xuống section này.
const SEGMENTS = 48;
const WIDTH = 1440;

// Vẽ nắp trên rồi lần theo mép xé từ phải về trái để đa giác khép kín không tự cắt
const points = Array.from({ length: SEGMENTS + 1 }, (_, i) => {
  const step = SEGMENTS - i;
  const x = (step * WIDTH) / SEGMENTS;
  const depth = 5 + ((step * 53) % 11) + ((step * 29) % 5);
  return `L${x.toFixed(0)} ${depth}`;
}).join(" ");

const PATH = `M0 0 H${WIDTH} ${points} Z`;

export default function TornEdge({ className = "" }) {
  return (
    <svg
      className={`pointer-events-none absolute inset-x-0 top-0 h-4 w-full sm:h-5 ${className}`}
      viewBox={`0 0 ${WIDTH} 24`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path fill="currentColor" d={PATH} />
    </svg>
  );
}
