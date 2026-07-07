import { formatCurrency } from "../../utils/format.js";

const STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  rejected: "Đã từ chối",
};

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-700",
};

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("vi-VN");
}

export default function ContributionsTable({ rows, busyId, onConfirm, onReject, onDelete }) {
  if (rows.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white/60 p-10 text-center text-sm text-slate-500">
        Không có khoản đóng góp nào ở trạng thái này.
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-soft">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-heritage-blueDark/5 text-left text-xs font-bold uppercase tracking-wide text-heritage-blueDark/70">
          <tr>
            <th className="px-4 py-3">Mã đối chiếu</th>
            <th className="px-4 py-3">Họ tên</th>
            <th className="px-4 py-3">SĐT</th>
            <th className="px-4 py-3">Số tiền</th>
            <th className="px-4 py-3">Lời nhắn</th>
            <th className="px-4 py-3">Thời gian gửi</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.id} className="even:bg-slate-50/60 hover:bg-heritage-gold/5">
              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-700">{row.code}</td>
              <td className="whitespace-nowrap px-4 py-3 font-semibold text-heritage-blueDark">{row.name}</td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-600">{row.phone}</td>
              <td className="whitespace-nowrap px-4 py-3 font-semibold text-heritage-red">
                {formatCurrency(row.amount)} đ
              </td>
              <td className="max-w-[220px] truncate px-4 py-3 text-slate-600" title={row.note}>
                {row.note || "—"}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDateTime(row.submitted_at)}</td>
              <td className="whitespace-nowrap px-4 py-3">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLES[row.status]}`}>
                  {STATUS_LABELS[row.status]}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  {row.status === "pending" ? (
                    <>
                      <button
                        type="button"
                        disabled={busyId === row.id}
                        onClick={() => onConfirm(row.id)}
                        className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Xác nhận
                      </button>
                      <button
                        type="button"
                        disabled={busyId === row.id}
                        onClick={() => onReject(row.id)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-heritage-red hover:text-heritage-red disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Từ chối
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400">
                      {row.status === "confirmed" ? `bởi ${row.confirmed_by || "—"}` : row.reject_reason || "—"}
                    </span>
                  )}
                  <button
                    type="button"
                    disabled={busyId === row.id}
                    onClick={() => onDelete(row.id)}
                    className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-bold text-heritage-red transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Xoá
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
