import { motion } from "framer-motion";
import { BookOpen, Flag, Quote, ShieldCheck, Users } from "lucide-react";
import SectionReveal from "./SectionReveal.jsx";
import { formatCurrency } from "../utils/format.js";

const goals = [
  {
    icon: Flag,
    title: "Chung tay cùng ngày hội trường",
    text: "Đóng góp vào các hoạt động hướng tới Lễ kỷ niệm 80 năm thành lập Trường THPT Tân Trào.",
  },
  {
    icon: Users,
    title: "Kết nối nghĩa tình K7301",
    text: "Tập hợp tấm lòng của bạn bè cùng khóa, dù đang ở Tuyên Quang hay ở mọi miền xa gần.",
  },
  {
    icon: ShieldCheck,
    title: "Ghi nhận rõ ràng",
    text: "Mọi khoản đóng góp được tổng hợp theo danh sách, số tiền và thời điểm ghi nhận.",
  },
];

export default function OpenLetter({ targetAmount }) {
  return (
    <SectionReveal
      id="thu-ngo"
      className="paper-texture bg-heritage-paper px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-heritage-red">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Thư ngỏ &amp; mục tiêu
          </p>
          <h2 className="mt-4 text-3xl font-bold leading-tight text-heritage-blueDark sm:text-4xl">
            Tám mươi năm nâng bước bao thế hệ học trò
          </h2>
          <p className="mt-3 font-hand text-2xl text-heritage-sepia">
            Có một khoảng sân trường vẫn đợi ta quay về...
          </p>
          <div className="gold-rule mx-auto mt-6 h-px w-full max-w-sm" />
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-stretch">
          <div className="letter-paper relative rotate-[0.5deg] rounded-sm p-7 shadow-letter transition-transform duration-500 hover:rotate-0 sm:p-10">
            <span
              className="tape -top-3 left-8 -rotate-6 rounded-sm"
              aria-hidden="true"
            />
            <span
              className="tape -top-3 right-8 rotate-3 rounded-sm"
              aria-hidden="true"
            />

            <Quote className="mb-5 h-9 w-9 text-heritage-gold" aria-hidden="true" />
            <div className="relative z-10 space-y-5 font-display text-base leading-8 text-slate-700">
              <p className="drop-cap">
                Trường THPT Tân Trào trân trọng gửi lời chào tới các thế hệ cán bộ,
                giáo viên, học sinh đã từng gắn bó với mái trường. Chặng đường 80
                năm là hành trình của tri thức, tình thầy trò và những ký ức không
                phai.
              </p>
              <p>
                Hướng tới Lễ kỷ niệm 80 năm thành lập trường, nhà trường mong nhận
                được sự đồng hành của các thế hệ học sinh để ngày hội thêm trang
                trọng, ấm áp và lan tỏa tinh thần biết ơn.
              </p>
              <p className="font-semibold text-heritage-blueDark">
                Tập thể K7301 cùng nhau góp sức, ghi dấu tình cảm với mái trường
                xưa bằng sự minh bạch, tự nguyện và trân trọng từng tấm lòng.
              </p>
            </div>

            <div className="relative z-10 mt-8 flex items-end justify-between gap-4">
              <div
                className="wax-seal grid h-24 w-24 shrink-0 -rotate-12 place-items-center rounded-full text-center text-[9px] font-bold uppercase leading-tight tracking-[0.14em] text-heritage-goldSoft"
                aria-hidden="true"
              >
                <span className="grid h-[4.7rem] w-[4.7rem] place-items-center rounded-full border border-heritage-goldSoft/40">
                  K7301
                  <br />
                  Tân Trào
                  <br />
                  80 năm
                </span>
              </div>
              <div className="text-right">
                <p className="font-display text-sm italic text-slate-500">
                  Tuyên Quang, hè 2026
                </p>
                <p className="mt-1 font-hand text-3xl text-heritage-blueDark">
                  Ban liên lạc K7301
                </p>
              </div>
            </div>
          </div>

          <aside
            id="muc-tieu"
            className="goal-panel relative overflow-hidden rounded-xl bg-heritage-blueDark p-7 text-white shadow-soft sm:p-9"
          >
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-heritage-goldSoft">
                Mục tiêu quyên góp
              </p>
              <p className="mt-3 font-display text-4xl font-bold text-white sm:text-[2.75rem]">
                {formatCurrency(targetAmount)}
                <span className="ml-2 text-lg font-medium text-white/70">đồng</span>
              </p>
              <p className="mt-3 text-sm leading-7 text-white/70">
                Cùng nhà trường chuẩn bị cho sự kiện trọng đại, đồng thời lưu lại
                dấu ấn tri ân của tập thể K7301.
              </p>

              <div className="gold-rule mt-7 h-px w-full" />

              <ul className="mt-7 space-y-6">
                {goals.map((goal, index) => {
                  const Icon = goal.icon;
                  return (
                    <motion.li
                      key={goal.title}
                      initial={{ opacity: 0, x: 24 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{
                        duration: 0.55,
                        delay: index * 0.12,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="flex gap-4"
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-heritage-gold/45 bg-white/[0.06] text-heritage-goldSoft">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-white">
                          {goal.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-6 text-white/70">
                          {goal.text}
                        </p>
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </SectionReveal>
  );
}
