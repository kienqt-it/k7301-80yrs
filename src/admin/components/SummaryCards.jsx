import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { formatCurrency } from "../../utils/format.js";

export default function SummaryCards({ summary }) {
  const cards = [
    {
      key: "pending",
      label: "Chờ xác nhận",
      value: summary.pendingCount,
      icon: Clock,
      accent: "border-amber-300 bg-amber-50 text-amber-800",
      iconClass: "text-amber-600",
    },
    {
      key: "confirmed",
      label: "Đã xác nhận",
      value: summary.confirmedCount,
      sub: `${formatCurrency(summary.confirmedAmount)} đ`,
      icon: CheckCircle2,
      accent: "border-emerald-300 bg-emerald-50 text-emerald-800",
      iconClass: "text-emerald-600",
    },
    {
      key: "rejected",
      label: "Đã từ chối",
      value: summary.rejectedCount,
      icon: XCircle,
      accent: "border-red-200 bg-red-50 text-heritage-red",
      iconClass: "text-heritage-red",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <div key={card.key} className={`rounded-lg border p-4 shadow-soft ${card.accent}`}>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
            <card.icon className={`h-4 w-4 ${card.iconClass}`} aria-hidden="true" />
            {card.label}
          </div>
          <p className="mt-2 text-2xl font-bold">{card.value}</p>
          {card.sub && <p className="mt-0.5 text-xs font-semibold opacity-80">{card.sub}</p>}
        </div>
      ))}
    </div>
  );
}
