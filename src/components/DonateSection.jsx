import { useEffect, useRef, useState } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  HeartHandshake,
  Hourglass,
  Info,
  Lock,
  PartyPopper,
  RefreshCw,
  Send,
  ShieldCheck,
} from "lucide-react";
import SectionReveal from "./SectionReveal.jsx";
import { formatCurrency, normalizeAmount } from "../utils/format.js";

const BANK_ID = "BIDV"; // TMCP Đầu tư & Phát triển Việt Nam
const ACCOUNT_NO = "3411413077";
const ACCOUNT_NAME = "QUAN TRUNG KIEN";

const CONFIRM_WINDOW_MS = 10 * 60 * 1000;
const POLL_INTERVAL_MS = 5000;

const bankRows = [
  ["Số tài khoản", "3411413077"],
  ["Ngân hàng", "TMCP Đầu tư & Phát triển Việt Nam (BIDV)"],
  ["Tên tài khoản", "QUAN TRUNG KIEN"],
];

const quickAmounts = [200000, 500000, 1000000, 2000000];

function formatAmountInput(value) {
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-US");
}

function buildQrUrl({ amount = 0, code = "" } = {}) {
  const params = new URLSearchParams({ addInfo: code, accountName: ACCOUNT_NAME });
  if (amount > 0) params.set("amount", String(amount));
  return `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?${params.toString()}`;
}

function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

const initialForm = {
  name: "",
  phone: "",
  amount: "",
  note: "",
};

const inputClass =
  "mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-heritage-gold focus:ring-4 focus:ring-heritage-gold/15";

export default function DonateSection() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  // phase: "form" → bước 1; "waiting" → bước 2 đang chờ admin xác nhận;
  // "confirmed" → đã xác nhận; "timeout" → quá 10 phút chưa xác nhận
  const [phase, setPhase] = useState("form");
  const [submission, setSubmission] = useState(null); // { code, name, amount }
  const [remainingMs, setRemainingMs] = useState(CONFIRM_WINDOW_MS);
  const [checking, setChecking] = useState(false);
  const [copied, setCopied] = useState("");
  const deadlineRef = useRef(null);

  function updateField(event) {
    const { name, value } = event.target;
    if (name === "amount") {
      setForm((current) => ({ ...current, amount: formatAmountInput(value) }));
      return;
    }
    setForm((current) => ({ ...current, [name]: value }));
  }

  function pickAmount(amount) {
    setForm((current) => ({ ...current, amount: formatAmountInput(amount) }));
  }

  async function fetchStatus(code) {
    const response = await fetch(`/api/contributions/${encodeURIComponent(code)}/status`);
    if (!response.ok) return null;
    return response.json();
  }

  // Trong pha chờ: đếm ngược mỗi giây và hỏi trạng thái mỗi 5 giây.
  useEffect(() => {
    if (phase !== "waiting" || !submission) return undefined;

    const tick = window.setInterval(() => {
      const left = deadlineRef.current - Date.now();
      setRemainingMs(left);
      if (left <= 0) setPhase("timeout");
    }, 1000);

    let cancelled = false;
    const poll = window.setInterval(async () => {
      try {
        const data = await fetchStatus(submission.code);
        if (!cancelled && data?.status === "confirmed") setPhase("confirmed");
      } catch {
        // mạng chập chờn thì lần poll sau thử lại
      }
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(tick);
      window.clearInterval(poll);
    };
  }, [phase, submission]);

  async function handleSubmit(event) {
    event.preventDefault();
    const amount = normalizeAmount(form.amount);

    if (!form.name.trim() || !form.phone.trim() || amount <= 0) return;

    setSubmitting(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          amount,
          note: form.note.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Có lỗi xảy ra, vui lòng thử lại");
      }

      setSubmission({ code: data.code, name: form.name.trim(), amount });
      deadlineRef.current = Date.now() + CONFIRM_WINDOW_MS;
      setRemainingMs(CONFIRM_WINDOW_MS);
      setPhase("waiting");
    } catch (err) {
      setErrorMsg(err.message || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  }

  async function checkAgain() {
    if (!submission) return;
    setChecking(true);
    try {
      const data = await fetchStatus(submission.code);
      if (data?.status === "confirmed") setPhase("confirmed");
    } finally {
      setChecking(false);
    }
  }

  function startOver() {
    setForm(initialForm);
    setSubmission(null);
    setErrorMsg("");
    setPhase("form");
  }

  async function copyValue(label, value) {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1800);
  }

  const stepOneDone = phase !== "form";
  const qrUrl = submission
    ? buildQrUrl({ code: submission.code, amount: submission.amount })
    : "";

  return (
    <SectionReveal
      id="form-gop"
      className="paper-texture bg-heritage-paper px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-heritage-red">
            <HeartHandshake className="h-4 w-4" aria-hidden="true" />
            Đóng góp &amp; chuyển khoản
          </p>
          <h2 className="mt-4 text-3xl font-bold leading-tight text-heritage-blueDark sm:text-4xl">
            Một lần quét mã, một lời ghi nhận
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            Điền thông tin và bấm ghi nhận, mã QR gắn riêng mã đối chiếu của bạn
            sẽ hiện ra — quét mã bằng ứng dụng ngân hàng là xong.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft">
          <div
            className="h-1 bg-gradient-to-r from-transparent via-heritage-gold to-transparent"
            aria-hidden="true"
          />

          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            {/* ---- Bước 1: form thông tin ---- */}
            <form onSubmit={handleSubmit} className="flex flex-col p-6 sm:p-10">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-heritage-sepia">
                Bước 1 · Thông tin người đóng góp
                {stepOneDone && (
                  <CheckCircle2
                    className="h-4 w-4 text-emerald-600"
                    aria-hidden="true"
                  />
                )}
              </p>

              {stepOneDone ? (
                <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                  <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Đã ghi nhận thông tin của {submission?.name}
                  </p>
                  <dl className="mt-4 space-y-2 text-sm text-emerald-900">
                    <div className="flex justify-between gap-4">
                      <dt className="text-emerald-700">Số tiền</dt>
                      <dd className="font-bold">
                        {formatCurrency(submission?.amount || 0)} đ
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-emerald-700">Mã đối chiếu</dt>
                      <dd className="font-bold tracking-wider">
                        {submission?.code}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-4 text-xs leading-6 text-emerald-700">
                    Vui lòng giữ nguyên nội dung chuyển khoản là mã đối chiếu để
                    Ban liên lạc xác nhận nhanh nhất.
                  </p>
                  {phase !== "waiting" && (
                    <button
                      type="button"
                      onClick={startOver}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-heritage-blue transition hover:text-heritage-blueDark"
                    >
                      <RefreshCw className="h-4 w-4" aria-hidden="true" />
                      Tạo đóng góp khác
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-semibold text-heritage-blueDark">
                        Họ và tên
                      </span>
                      <input
                        name="name"
                        value={form.name}
                        onChange={updateField}
                        placeholder="Nguyễn Văn A"
                        className={inputClass}
                        required
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-semibold text-heritage-blueDark">
                        Số điện thoại
                      </span>
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={updateField}
                        placeholder="09xx xxx xxx"
                        className={inputClass}
                        required
                      />
                    </label>

                    <label className="block sm:col-span-2">
                      <span className="text-sm font-semibold text-heritage-blueDark">
                        Số tiền
                      </span>
                      <input
                        name="amount"
                        value={form.amount}
                        onChange={updateField}
                        inputMode="numeric"
                        placeholder="1,000,000"
                        className={inputClass}
                        required
                      />
                      <span className="mt-3 flex flex-wrap gap-2">
                        {quickAmounts.map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => pickAmount(amount)}
                            className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-heritage-gold hover:text-heritage-blueDark"
                          >
                            {amount.toLocaleString("en-US")}
                          </button>
                        ))}
                      </span>
                    </label>

                    <label className="block sm:col-span-2">
                      <span className="text-sm font-semibold text-heritage-blueDark">
                        Lời nhắn
                      </span>
                      <input
                        name="note"
                        value={form.note}
                        onChange={updateField}
                        placeholder="Tri ân mái trường"
                        className={inputClass}
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-heritage-gold px-5 py-3.5 text-sm font-bold text-heritage-blueDark shadow-sm transition hover:bg-heritage-goldSoft disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" aria-hidden="true" />
                    {submitting ? "Đang gửi..." : "Ghi nhận đóng góp"}
                  </button>

                  {errorMsg && (
                    <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-heritage-red">
                      {errorMsg}
                    </p>
                  )}
                </>
              )}

              <div className="mt-auto pt-8">
                <p className="flex items-start gap-2 border-t border-slate-100 pt-5 text-xs leading-6 text-slate-500">
                  <Info
                    className="mt-1 h-4 w-4 shrink-0 text-heritage-gold"
                    aria-hidden="true"
                  />
                  Sau khi bạn chuyển khoản, Ban liên lạc sẽ đối chiếu theo mã và
                  xác nhận trong khoảng 10 phút. Mọi khoản góp đều được ghi nhận
                  công khai, minh bạch.
                </p>
              </div>
            </form>

            {/* ---- Bước 2: quét mã chuyển khoản ---- */}
            <div
              id="chuyen-khoan"
              className="border-t border-slate-200/80 bg-[#faf7ef] p-6 sm:p-10 lg:border-l lg:border-t-0"
            >
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-heritage-sepia">
                Bước 2 · Quét mã chuyển khoản
              </p>

              {phase === "form" && (
                <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <Lock className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <p className="mt-5 text-sm font-semibold text-heritage-blueDark">
                    Hoàn tất Bước 1 để nhận mã QR
                  </p>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                    Sau khi bấm &ldquo;Ghi nhận đóng góp&rdquo;, mã QR gắn riêng
                    mã đối chiếu và số tiền của bạn sẽ hiện tại đây.
                  </p>
                </div>
              )}

              {phase === "waiting" && submission && (
                <>
                  <div className="mx-auto mt-6 w-fit rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <img
                      key={qrUrl}
                      src={qrUrl}
                      alt="Mã VietQR chuyển khoản tới tài khoản BIDV của Ban liên lạc K7301, đã gắn mã đối chiếu của bạn"
                      width={340}
                      height={420}
                      loading="lazy"
                      className="w-full max-w-[230px] rounded-lg"
                    />
                  </div>

                  <p className="mt-4 text-center text-sm leading-6 text-slate-600">
                    Nội dung CK: <strong>{submission.code}</strong> (mã đối
                    chiếu của bạn)
                  </p>

                  <div
                    className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
                    role="status"
                    aria-live="polite"
                  >
                    <p className="flex items-center justify-center gap-2 text-sm font-semibold text-amber-800">
                      <Hourglass className="h-4 w-4" aria-hidden="true" />
                      Chờ Ban liên lạc xác nhận:{" "}
                      <span className="font-mono text-base tabular-nums">
                        {formatCountdown(remainingMs)}
                      </span>
                    </p>
                    <p className="mt-1 text-center text-xs leading-5 text-amber-700">
                      Quét mã và chuyển khoản ngay — trang sẽ tự cập nhật khi
                      khoản góp được xác nhận.
                    </p>
                  </div>

                  <div
                    className="mt-8 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400"
                    aria-hidden="true"
                  >
                    <span className="h-px flex-1 bg-slate-200" />
                    Hoặc chuyển khoản thủ công
                    <span className="h-px flex-1 bg-slate-200" />
                  </div>

                  <dl className="mt-2 divide-y divide-slate-200/80">
                    {[...bankRows, ["Nội dung CK", submission.code]].map(
                      ([label, value]) => (
                        <div
                          key={label}
                          className="flex items-start justify-between gap-4 py-3.5"
                        >
                          <dt className="pt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {label}
                          </dt>
                          <dd className="flex min-w-0 items-center justify-end gap-2 text-right">
                            <span className="break-words text-sm font-semibold text-heritage-blueDark">
                              {value}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyValue(label, value)}
                              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:border-heritage-gold hover:text-heritage-blueDark"
                              aria-label={`Sao chép ${label}`}
                              title={`Sao chép ${label}`}
                            >
                              {copied === label ? (
                                <Check
                                  className="h-4 w-4 text-emerald-600"
                                  aria-hidden="true"
                                />
                              ) : (
                                <Copy className="h-4 w-4" aria-hidden="true" />
                              )}
                            </button>
                          </dd>
                        </div>
                      ),
                    )}
                  </dl>
                </>
              )}

              {phase === "confirmed" && submission && (
                <div className="mt-6 flex flex-col items-center rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-14 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <PartyPopper className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <p className="mt-5 text-base font-bold text-emerald-800">
                    Đóng góp của bạn đã được xác nhận!
                  </p>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-emerald-700">
                    Cảm ơn {submission.name} đã góp{" "}
                    <strong>{formatCurrency(submission.amount)} đ</strong>. Tên
                    của bạn sẽ xuất hiện trong danh sách tri ân của K7301.
                  </p>
                </div>
              )}

              {phase === "timeout" && submission && (
                <div className="mt-6 flex flex-col items-center rounded-xl border border-amber-200 bg-amber-50 px-6 py-12 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <Hourglass className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <p className="mt-5 text-base font-bold text-amber-800">
                    Hết thời gian chờ xác nhận nhanh
                  </p>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-amber-700">
                    Đừng lo — khoản góp với mã{" "}
                    <strong>{submission.code}</strong> vẫn được lưu. Ban liên
                    lạc sẽ đối chiếu và cập nhật vào danh sách sớm nhất.
                  </p>
                  <button
                    type="button"
                    onClick={checkAgain}
                    disabled={checking}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-800 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${checking ? "animate-spin" : ""}`}
                      aria-hidden="true"
                    />
                    {checking ? "Đang kiểm tra..." : "Kiểm tra lại trạng thái"}
                  </button>
                </div>
              )}

              <p className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
                <ShieldCheck
                  className="h-4 w-4 text-emerald-600"
                  aria-hidden="true"
                />
                Tài khoản tiếp nhận do Ban liên lạc K7301 quản lý
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionReveal>
  );
}
