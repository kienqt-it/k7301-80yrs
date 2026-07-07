import { useState } from "react";
import { ShieldCheck } from "lucide-react";

export default function LoginForm({ onLogin, error }) {
  const [tokenInput, setTokenInput] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (!tokenInput.trim()) return;
    onLogin(tokenInput.trim());
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-heritage-blueDark px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-heritage-gold/30 bg-white p-7 shadow-soft"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-heritage-blueDark text-heritage-goldSoft">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="font-display text-lg font-bold leading-tight text-heritage-blueDark">
              K7301 · Quản trị
            </h1>
            <p className="text-xs text-slate-500">Khu vực dành riêng cho Ban liên lạc</p>
          </div>
        </div>

        <label className="mt-6 block">
          <span className="text-sm font-semibold text-heritage-blueDark">Mã admin</span>
          <input
            type="password"
            value={tokenInput}
            onChange={(event) => setTokenInput(event.target.value)}
            placeholder="••••••••"
            className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-heritage-blue focus:ring-4 focus:ring-blue-100"
            autoFocus
          />
        </label>

        {error && (
          <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-heritage-red">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="mt-5 w-full rounded-md bg-heritage-red px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-heritage-redDark"
        >
          Đăng nhập
        </button>
      </form>
    </div>
  );
}
