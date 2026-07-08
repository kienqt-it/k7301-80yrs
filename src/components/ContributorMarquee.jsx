import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Heart, ListChecks } from "lucide-react";
import SectionReveal from "./SectionReveal.jsx";
import Leaderboard from "./Leaderboard.jsx";
import { formatCurrency } from "../utils/format.js";

const MAX_CARDS = 20;

function slotFor(index) {
  return {
    left: `${4 + ((index * 137) % 84)}%`,
    duration: `${10 + ((index * 37) % 7)}s`,
    delay: `${-((index * 53) % 24)}s`,
  };
}

function tiltFor(index) {
  return ((index * 29) % 13) - 6; // -6..6 độ, lệch giả-ngẫu-nhiên nhưng ổn định
}

export default function ContributorMarquee({ contributions }) {
  const cards = contributions.slice(0, MAX_CARDS);
  const viewportRef = useRef(null);
  const [pulsingId, setPulsingId] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const viewportHeight = Math.min(560, Math.max(320, cards.length * 50 + 260));

  return (
    <SectionReveal className="relative overflow-hidden bg-heritage-blueDark px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-heritage-goldSoft">
            <ListChecks className="h-4 w-4" aria-hidden="true" />
            Danh sách thành viên đã đóng góp
          </p>
          <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
            Từng cái tên là một lời gửi về mái trường xưa
          </h2>
          <p className="mt-4 font-hand text-2xl text-heritage-goldSoft">
            Như những ngọn hoa đăng thả về miền ký ức...
          </p>
        </div>

        <Leaderboard contributions={contributions} limit={5} />

        <div
          ref={viewportRef}
          className="marquee-mask marquee-frame relative mt-8 overflow-hidden rounded-xl border border-heritage-gold/15"
          style={{ height: viewportHeight }}
          aria-label="Thiệp lời chúc của các thành viên đã đóng góp, trôi lên như hoa đăng, kéo thả và chạm để xem"
        >
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
            <Heart className="h-20 w-20 text-heritage-gold/10 sm:h-28 sm:w-28" aria-hidden="true" />
            {cards.length <= 2 && (
              <p className="max-w-xs font-hand text-xl text-heritage-goldSoft/40">
                Hãy là người tiếp theo gửi lời chúc yêu thương...
              </p>
            )}
          </div>

          {cards.map((person, index) => {
            const slot = slotFor(index);
            const isDragging = draggingId === person.id;
            return (
              <div
                key={person.id}
                className="absolute top-full animate-floatCard hover:[animation-play-state:paused]"
                style={{
                  left: slot.left,
                  animationDuration: slot.duration,
                  animationDelay: slot.delay,
                  animationPlayState: isDragging ? "paused" : undefined,
                }}
              >
                <motion.article
                  drag
                  dragConstraints={viewportRef}
                  dragElastic={0.2}
                  onDragStart={() => setDraggingId(person.id)}
                  onDragEnd={() => setDraggingId(null)}
                  whileDrag={{ scale: 1.06, zIndex: 30, boxShadow: "0 0 32px rgba(212, 175, 55, 0.45)" }}
                  onTap={() => setPulsingId(person.id)}
                  animate={
                    pulsingId === person.id
                      ? { scale: [1, 1.18, 0.96, 1.1, 1], rotate: [tiltFor(index), 0, 0, 0, tiltFor(index)] }
                      : { scale: 1, rotate: tiltFor(index) }
                  }
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  onAnimationComplete={() => setPulsingId((current) => (current === person.id ? null : current))}
                  style={{ touchAction: "none" }}
                  className="w-52 cursor-grab touch-none select-none rounded-lg border border-heritage-gold/40 bg-heritage-paper/95 p-4 text-heritage-blueDark shadow-letter active:cursor-grabbing sm:w-60"
                >
                  <div className="flex items-center gap-2">
                    <Heart
                      className="h-4 w-4 shrink-0 fill-heritage-red text-heritage-red"
                      aria-hidden="true"
                    />
                    <h3 className="truncate text-sm font-bold">{person.name}</h3>
                  </div>
                  <p className="mt-1 truncate font-hand text-lg text-heritage-sepia">{person.note}</p>
                  <p className="mt-2 text-base font-bold text-heritage-red">
                    {formatCurrency(person.amount)} đ
                  </p>
                </motion.article>
              </div>
            );
          })}
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-7 text-white/70">
          Thiệp trôi lên rồi mờ dần như hoa đăng thả trôi — kéo một tấm đi bất kỳ đâu (chuột hoặc
          chạm tay), rồi chạm vào để xem nhịp yêu thương đập lên từ đó.
        </p>
      </div>
    </SectionReveal>
  );
}
