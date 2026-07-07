const TABS = [
  { value: "pending", label: "Chờ xác nhận", countKey: "pendingCount" },
  { value: "confirmed", label: "Đã xác nhận", countKey: "confirmedCount" },
  { value: "rejected", label: "Đã từ chối", countKey: "rejectedCount" },
  { value: "", label: "Tất cả", countKey: null },
];

export default function StatusTabs({ active, onChange, summary, totalCount }) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
      {TABS.map((tab) => {
        const count = tab.countKey ? summary[tab.countKey] : totalCount;
        const isActive = active === tab.value;
        return (
          <button
            key={tab.value || "all"}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? "bg-heritage-red text-white shadow-sm"
                : "border border-slate-300 bg-white text-slate-600 hover:border-heritage-red/50 hover:text-heritage-red"
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
