import { useState } from "react";
import { Download } from "lucide-react";
import { apiFetch } from "../api.js";

export default function ExportButton({ status }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  async function handleExport() {
    setDownloading(true);
    setError("");
    try {
      const query = status ? `?status=${status}` : "";
      const response = await apiFetch(`/api/admin/export.csv${query}`);
      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition") || "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match ? match[1] : "k7301-dong-gop.csv";

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Xuất CSV thất bại");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleExport}
        disabled={downloading}
        className="inline-flex items-center gap-2 rounded-md border border-heritage-gold/60 bg-white px-4 py-2 text-sm font-semibold text-heritage-blueDark transition hover:border-heritage-gold disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Download className="h-4 w-4 text-heritage-red" aria-hidden="true" />
        {downloading ? "Đang xuất..." : "Xuất CSV"}
      </button>
      {error && <p className="mt-2 text-sm font-semibold text-heritage-red">{error}</p>}
    </div>
  );
}
