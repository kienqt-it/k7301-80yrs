import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  HeartHandshake,
  QrCode,
  Info,
  Send,
  ShieldCheck,
} from "lucide-react";
import SectionReveal from "./SectionReveal.jsx";
import { normalizeAmount } from "../utils/format.js";

const BANK_ID = "ICB"; // TMCP Công thương Việt Nam (VietinBank)
const ACCOUNT_NO = "127000113108";
const ACCOUNT_NAME = "Truong THPT Tan Trao";
const DEFAULT_TRANSFER_NOTE = "K7301 dong gop 80 nam";

const bankRows = [
  ["Số tài khoản", "127000113108"],
  ["Ngân hàng", "TMCP Công thương Việt Nam - CN Tuyên Quang"],
  ["Tên tài khoản", "Trường Trung học phổ thông Tân Trào"],
  ["Nội dung gợi ý", "K7301 - Họ tên - Số điện thoại"],
];

const quickAmounts = [200000, 500000, 1000000, 2000000];

function formatAmountInput(value) {
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-US");
}

function toAsciiVietnamese(value) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function buildQrUrl({ name = "", amount = 0, code = "" } = {}) {
  const cleanName = toAsciiVietnamese(name.trim()).replace(/\s+/g, " ");
  let addInfo = DEFAULT_TRANSFER_NOTE;
  if (code) addInfo = code;
  else if (cleanName) addInfo = `K7301 ${cleanName}`;

  const params = new URLSearchParams({ addInfo, accountName: ACCOUNT_NAME });
  if (amount > 0) params.set("amount", String(amount));
  return `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?${params.toString()}`;
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
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [contributionCode, setContributionCode] = useState("");
  const [copied, setCopied] = useState("");
  const [qrUrl, setQrUrl] = useState(buildQrUrl());
  const [qrPersonalized, setQrPersonalized] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    if (name === "amount") {
      setForm((current) => ({ ...current, amount: formatAmountInput(value) }));
      return;
    }
    setForm((current) => ({ ...current, [name]: value }));
  }

  function applyQr({ name, amount }) {
    setContributionCode("");
    setQrUrl(buildQrUrl({ name, amount }));
    setQrPersonalized(Boolean(name.trim() || amount));
  }

  function refreshQr() {
    applyQr({ name: form.name, amount: normalizeAmount(form.amount) });
  }

  function pickAmount(amount) {
    setForm((current) => ({ ...current, amount: formatAmountInput(amount) }));
    applyQr({ name: form.name, amount });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const amount = normalizeAmount(form.amount);

    if (!form.name.trim() || !form.phone.trim() || amount <= 0) {
      setSubmitted(false);
      return;
    }

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

      setQrUrl(buildQrUrl({ code: data.code, amount }));
      setQrPersonalized(true);
      setContributionCode(data.code);
      setForm(initialForm);
      setSubmitted(true);
    } catch (err) {
      setErrorMsg(err.message || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyValue(label, value) {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1800);
  }

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
            Điền thông tin, mã QR sẽ tự gắn tên và số tiền của bạn — quét mã
            bằng ứng dụng ngân hàng là xong.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft">
          <div
            className="h-1 bg-gradient-to-r from-transparent via-heritage-gold to-transparent"
            aria-hidden="true"
          />

          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col p-6 sm:p-10"
            >
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-heritage-sepia">
                Bước 1 · Thông tin người đóng góp
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-heritage-blueDark">
                    Họ và tên
                  </span>
                  <input
                    name="name"
                    value={form.name}
                    onChange={updateField}
                    onBlur={refreshQr}
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
                    onBlur={refreshQr}
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

              {submitted && (
                <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Đã ghi nhận, đang chờ Ban liên lạc đối chiếu chuyển khoản.
                  </span>
                  {contributionCode && (
                    <span className="mt-1 block text-emerald-800">
                      Mã đối chiếu của bạn: <strong>{contributionCode}</strong>{" "}
                      — vui lòng giữ nguyên nội dung này khi chuyển khoản để
                      được xác nhận nhanh hơn.
                    </span>
                  )}
                </p>
              )}

              <div className="mt-auto pt-8">
                <p className="flex items-start gap-2 border-t border-slate-100 pt-5 text-xs leading-6 text-slate-500">
                  <Info
                    className="mt-1 h-4 w-4 shrink-0 text-heritage-gold"
                    aria-hidden="true"
                  />
                  Sau khi bạn chuyển khoản, Ban liên lạc sẽ đối chiếu theo tên
                  hoặc mã đối chiếu và cập nhật vào danh sách đóng góp. Mọi
                  khoản góp đều được ghi nhận công khai, minh bạch.
                </p>
              </div>
            </form>

            <div
              id="chuyen-khoan"
              className="border-t border-slate-200/80 bg-[#faf7ef] p-6 sm:p-10 lg:border-l lg:border-t-0"
            >
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-heritage-sepia">
                Bước 2 · Quét mã chuyển khoản
              </p>

              <div className="mx-auto mt-6 w-fit rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <img
                  key={qrUrl}
                  src={qrUrl}
                  alt={
                    qrPersonalized
                      ? "Mã VietQR chuyển khoản tới Trường THPT Tân Trào, đã gắn tên người chuyển"
                      : "Mã VietQR chuyển khoản tới Trường THPT Tân Trào"
                  }
                  width={340}
                  height={420}
                  loading="lazy"
                  className="w-full max-w-[230px] rounded-lg"
                />
              </div>

              <p className="mt-4 text-center text-sm leading-6 text-slate-600">
                {contributionCode
                  ? `Nội dung CK: ${contributionCode} (mã đối chiếu của bạn)`
                  : qrPersonalized
                  ? "Mã đã gắn tên và số tiền của bạn"
                  : `Nội dung mặc định: ${DEFAULT_TRANSFER_NOTE}`}
              </p>

              <button
                type="button"
                onClick={refreshQr}
                className="mx-auto mt-2 flex items-center justify-center gap-2 text-sm font-semibold text-heritage-blue transition hover:text-heritage-blueDark"
              >
                <QrCode className="h-4 w-4" aria-hidden="true" />
                Cập nhật QR theo thông tin đã điền
              </button>

              <div
                className="mt-8 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400"
                aria-hidden="true"
              >
                <span className="h-px flex-1 bg-slate-200" />
                Hoặc chuyển khoản thủ công
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <dl className="mt-2 divide-y divide-slate-200/80">
                {bankRows.map(([label, value]) => (
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
                ))}
              </dl>

              <p className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
                <ShieldCheck
                  className="h-4 w-4 text-emerald-600"
                  aria-hidden="true"
                />
                Tài khoản chính thức do nhà trường cung cấp
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionReveal>
  );
}
