import { HeartHandshake, Landmark, School } from "lucide-react";
import SectionReveal from "./SectionReveal.jsx";

const footerLinks = [
  ["Thư ngỏ & mục tiêu", "thu-ngo"],
  ["Đóng góp", "dong-gop"],
  ["Chuyển khoản", "chuyen-khoan"],
];

export default function ThanksFooter() {
  return (
    <div className="relative overflow-hidden bg-heritage-blueDark text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.15), transparent 52%), radial-gradient(circle at 10% 95%, rgba(185, 28, 28, 0.2), transparent 44%)",
        }}
        aria-hidden="true"
      />

      <SectionReveal className="relative px-4 pt-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <School
            className="mx-auto h-10 w-10 text-heritage-goldSoft"
            aria-hidden="true"
          />
          <p className="mt-5 font-hand text-3xl text-heritage-goldSoft sm:text-4xl">
            Nghĩa tình gửi lại mái trường xưa
          </p>
          <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
            Xin cảm ơn những tấm lòng của tập thể K7301
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-white/82">
            Mỗi đóng góp là một lời tri ân gửi tới thầy cô, bạn bè và mái trường
            Tân Trào thân yêu. K7301 cùng giữ gìn ký ức đẹp, tiếp nối truyền
            thống và góp phần làm nên một ngày hội 80 năm thật ý nghĩa.
          </p>
          <a
            href="#form-gop"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-heritage-gold px-6 py-3 text-sm font-bold text-heritage-blueDark shadow-sm transition hover:bg-heritage-goldSoft"
          >
            <HeartHandshake className="h-5 w-5" aria-hidden="true" />
            Đồng hành cùng K7301
          </a>
        </div>
      </SectionReveal>

      <footer className="relative mt-14 px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="gold-rule h-px w-full" />

          <div className="flex flex-col items-center justify-between gap-5 py-6 text-center sm:flex-row sm:text-left">
            <a href="#top" className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-heritage-gold/55 bg-white/10">
                <Landmark
                  className="h-5 w-5 text-heritage-goldSoft"
                  aria-hidden="true"
                />
              </span>
              <span>
                <span className="block text-sm font-semibold tracking-wide">
                  K7301
                </span>
                <span className="block text-xs text-white/70">
                  Tri ân mái trường Tân Trào
                </span>
              </span>
            </a>

            <nav
              className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm text-white/72"
              aria-label="Liên kết cuối trang"
            >
              {footerLinks.map(([label, href]) => (
                <a
                  key={href}
                  href={`#${href}`}
                  className="transition hover:text-heritage-goldSoft"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>

          <p className="border-t border-white/10 pt-5 text-center text-xs leading-6 text-white/55">
            © 2026 Ban liên lạc K7301 · Hướng tới Lễ kỷ niệm 80 năm thành lập
            Trường THPT Tân Trào (1946 – 2026)
          </p>
        </div>
      </footer>
    </div>
  );
}
