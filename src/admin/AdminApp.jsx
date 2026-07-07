import { useCallback, useEffect, useMemo, useState } from "react";
import { LogOut, ShieldCheck } from "lucide-react";
import { apiFetch, AuthError, clearToken, getToken, setToken } from "./api.js";
import LoginForm from "./components/LoginForm.jsx";
import StatusTabs from "./components/StatusTabs.jsx";
import ContributionsTable from "./components/ContributionsTable.jsx";
import ExportButton from "./components/ExportButton.jsx";
import SummaryCards from "./components/SummaryCards.jsx";

export default function AdminApp() {
  const [loggedIn, setLoggedIn] = useState(Boolean(getToken()));
  const [loginError, setLoginError] = useState("");
  const [status, setStatus] = useState("pending");
  const [rows, setRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const handleAuthError = useCallback((err) => {
    if (err instanceof AuthError) {
      setLoggedIn(false);
      setLoginError(err.message);
      return true;
    }
    return false;
  }, []);

  const loadContributions = useCallback(async () => {
    setLoading(true);
    setListError("");
    try {
      const [filteredRes, allRes] = await Promise.all([
        apiFetch(`/api/admin/contributions${status ? `?status=${status}` : ""}`),
        apiFetch("/api/admin/contributions"),
      ]);
      setRows(await filteredRes.json());
      setAllRows(await allRes.json());
      setLoggedIn(true);
    } catch (err) {
      if (!handleAuthError(err)) setListError(err.message || "Không tải được danh sách");
    } finally {
      setLoading(false);
    }
  }, [status, handleAuthError]);

  useEffect(() => {
    if (loggedIn) loadContributions();
  }, [loggedIn, loadContributions]);

  const summary = useMemo(() => {
    const confirmed = allRows.filter((r) => r.status === "confirmed");
    return {
      pendingCount: allRows.filter((r) => r.status === "pending").length,
      confirmedCount: confirmed.length,
      confirmedAmount: confirmed.reduce((sum, r) => sum + r.amount, 0),
      rejectedCount: allRows.filter((r) => r.status === "rejected").length,
    };
  }, [allRows]);

  function handleLogin(token) {
    setToken(token);
    setLoginError("");
    setLoggedIn(true);
  }

  function handleLogout() {
    clearToken();
    setLoggedIn(false);
    setRows([]);
    setAllRows([]);
  }

  async function runAction(id, action, fallbackMessage) {
    setBusyId(id);
    try {
      await action();
      await loadContributions();
    } catch (err) {
      if (!handleAuthError(err)) setListError(err.message || fallbackMessage);
    } finally {
      setBusyId(null);
    }
  }

  const handleConfirm = (id) =>
    runAction(id, () => apiFetch(`/api/admin/contributions/${id}/confirm`, { method: "POST" }), "Xác nhận thất bại");

  const handleReject = (id) => {
    const reason = window.prompt("Lý do từ chối (có thể để trống):", "") ?? "";
    return runAction(
      id,
      () => apiFetch(`/api/admin/contributions/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }) }),
      "Từ chối thất bại",
    );
  };

  const handleDelete = (id) => {
    const row = rows.find((r) => r.id === id) || allRows.find((r) => r.id === id);
    const confirmed = window.confirm(
      `Xoá vĩnh viễn khoản đóng góp của "${row?.name || id}"? Hành động này không thể hoàn tác.`,
    );
    if (!confirmed) return Promise.resolve();
    return runAction(id, () => apiFetch(`/api/admin/contributions/${id}`, { method: "DELETE" }), "Xoá thất bại");
  };

  if (!loggedIn) {
    return <LoginForm onLogin={handleLogin} error={loginError} />;
  }

  return (
    <div className="min-h-screen bg-heritage-paper text-heritage-blueDark">
      <header className="sticky top-0 z-10 border-b border-heritage-gold/30 bg-heritage-blueDark text-white shadow-soft">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-heritage-gold/15 text-heritage-goldSoft">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h1 className="font-display text-lg font-bold leading-tight">K7301 · Quản trị đóng góp</h1>
              <p className="text-xs text-white/60">Đối chiếu và xác nhận các khoản chuyển khoản</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ExportButton />
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 transition hover:border-heritage-red hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <SummaryCards summary={summary} />

        <div className="mt-8">
          <StatusTabs active={status} onChange={setStatus} summary={summary} totalCount={allRows.length} />
        </div>

        {listError && (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-heritage-red">
            {listError}
          </p>
        )}

        {loading ? (
          <p className="mt-6 text-sm text-slate-600">Đang tải...</p>
        ) : (
          <ContributionsTable
            rows={rows}
            busyId={busyId}
            onConfirm={handleConfirm}
            onReject={handleReject}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  );
}
