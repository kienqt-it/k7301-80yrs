# Design

Hệ thống thiết kế "di sản Tân Trào" — lá thư tay hoài niệm gửi về mái trường, trang trọng và ấm áp. Nguồn token chuẩn: `tailwind.config.js` (namespace `heritage`) + utility class trong `src/index.css`.

## Theme

Sáng, ngả giấy cũ (`color-scheme: light`). Nền chính là giấy kem `#fffaf0`; các section đổi nhịp bằng khối xanh đêm `#172554` (thống kê, thiệp hoa đăng) xen kẽ khối giấy (thư ngỏ, form đóng góp). Không có dark mode.

## Colors

Token Tailwind `heritage.*` — luôn dùng token, không hard-code hex mới:

| Token | Hex | Vai trò |
|---|---|---|
| `heritage-blueDark` | `#172554` | Nền section tối, chữ chính trên nền sáng (ink) |
| `heritage-blue` | `#1d4ed8` | Xanh phụ (gradient tiến độ, link) |
| `heritage-red` | `#b91c1c` | Nhấn cảm xúc: số tiền, drop-cap, trái tim |
| `heritage-redDark` | `#7f1d1d` | Đỏ trầm cho gradient/vignette |
| `heritage-gold` | `#d4af37` | Nhấn thương hiệu: CTA, viền, focus ring, bảng vàng |
| `heritage-goldDeep` | `#9c7b26` | Vàng trầm: đầu tối của gradient bục vàng |
| `heritage-goldSoft` | `#f6e6a8` | Vàng nhạt: kicker, chữ nhấn trên nền tối |
| `heritage-paper` | `#fffaf0` | Nền trang |
| `heritage-paperShade` | `#faf7ef` | Giấy ngả xám nhẹ: khoang phụ trong panel trắng (Bước 2) |
| `heritage-cream` | `#fdf1d7` | Nền phụ ấm (chân dialog, hover) |
| `heritage-sepia` | `#8a6a35` | Chữ phụ nâu trên giấy, nhãn bước |

Chiến lược: **Committed** — xanh đêm + vàng kim phủ 30–60% bề mặt, đỏ dùng tiết chế cho cảm xúc/số tiền. Trên nền `blueDark`, chữ phụ dùng `white/68`–`white/80` (không xuống dưới /65 với chữ nhỏ); trên giấy, chữ phụ là `slate-500`+ hoặc `heritage-sepia`.

## Typography

| Vai trò | Font | Ghi chú |
|---|---|---|
| Hiển thị (h1–h3, số bục) | Playfair Display, Georgia, serif | Đậm 700; `text-wrap: balance` toàn cục |
| Thân bài & UI | Be Vietnam Pro, Inter, sans | Hỗ trợ tiếng Việt đầy đủ; `text-wrap: pretty` cho đoạn văn |
| Viết tay (lời nhắn, câu cảm xúc) | Dancing Script, cursive (`font-hand`) | Cỡ lớn hơn thân bài 1–2 bậc vì nét mảnh |

Kicker section: chữ nhỏ đậm uppercase tracking `0.14–0.18em` kèm icon Lucide 16px — đây là ngữ pháp thương hiệu đã cam kết, giữ nguyên khi thêm section mới. Thân bài leading rộng (`leading-7/8`).

## Components

- **Icon**: Lucide React duy nhất, 16–20px, luôn `aria-hidden` khi trang trí.
- **Nút chính (CTA)**: nền `heritage-gold`, chữ `heritage-blueDark` đậm, bo `rounded-md/lg`, hover sang `goldSoft`. Nút phụ trên nền tối: `bg-white/10 border-white/20` + hover `bg-white/20`.
- **Thẻ trên nền tối**: `bg-white/10 border-white/14 backdrop-blur rounded-lg`; hover viền `heritage-gold`.
- **Khung viền kép bên trong** (chữ ký thị giác): `::before/::after` viền vàng mảnh inset 10–14px — dùng cho lá thư (`letter-paper`), panel mục tiêu (`goal-panel`), khoang thiệp (`marquee-frame`).
- **Dialog**: bottom-sheet trên mobile (`items-end`, bo góc trên, `max-h-[85dvh]`), modal giữa trên desktop; nền `heritage-paper`, header `blueDark`, đóng bằng X/Esc/backdrop; khóa scroll body.
- **Avatar chữ cái**: tròn, gradient token 3 tông (đỏ/vàng/xanh), chữ trắng đậm.
- **Chip/badge**: `rounded-full` nền `heritage-gold/15` chữ `goldSoft` (nền tối) hoặc `sepia` (nền sáng).
- **Chất liệu hoài niệm**: vân giấy (`paper-texture`), băng dính (`tape`), drop-cap thư pháp (`drop-cap`), đường kẻ vàng mờ dần (`gold-rule`).

## Layout

- Container `max-w-7xl` (section) / `max-w-6xl` (form) / `max-w-2xl` (nội dung hẹp), padding `px-4 sm:px-6 lg:px-8`, section `py-16`.
- Mobile-first; lưới 2 cột `lg:` cho các khối kể-chuyện + số-liệu.
- Header cố định: mọi anchor đã có `scroll-padding-top: 84px`.

## Motion

- framer-motion cho reveal/press/drag; `MotionConfig reducedMotion="user"` đã bọc toàn app — mọi motion mới tự tôn trọng reduced-motion, CSS animation có media query tương ứng.
- Easing chuẩn: `[0.22, 1, 0.36, 1]` (ease-out-quint) cho vào/ra, `cubic-bezier(0.45,0,0.55,1)` cho nhịp lặp. **Cấm bounce/elastic.**
- Animation không khí (đặt tên trong tailwind.config): `floatUp` (hạt bụi vàng), `floatCard` (thiệp hoa đăng), `shine` (thanh tiến độ), `nudgeDown` (mũi tên cuộn).
- Hero mở màn bằng framer-motion: ảnh kỷ vật đặt xuống → chữ tay tự viết (clip-path) → tiêu đề blur-in → con dấu 80 năm đóng xuống. Chữ và ảnh tách hai vùng, không đè lên nhau; ảnh không fade theo cuộn (chỉ parallax dịch chuyển) và dùng `srcset` 800/1200/1600w.
- Nội dung phụ thuộc animation để hiện ra phải có fallback tĩnh khi `prefers-reduced-motion` (vd: thiệp hoa đăng xếp lưới tĩnh trong khung).
- Số liệu dùng CountUp khi giá trị đổi — trang cập nhật nền 30s/focus, không reload.

## Voice & Copy

Tiếng Việt, xưng "chúng ta/bạn", giọng thư tay trang trọng mà gần gũi. Nhãn hành động là động từ nghi thức: "Ghi nhận đóng góp", "Gửi lời tri ân" (không "Submit/Thanh toán"). Số tiền định dạng `vi-VN` kèm "đ"/"đồng"; ngày `dd/mm/yyyy` (`formatDate` trong `src/utils/format.js`).
