import React, { useEffect, useState } from "react";
import { Bug, X } from "lucide-react";
import { getDiagnosticsSnapshot, recordDiagnosticsEntry, setLastReloadReason, subscribeDiagnostics } from "@/lib/diagnostics";

interface Entry { type: string; message: string; at: string; stack?: string; componentStack?: string }

/** Floating diagnostics widget — dev-only. Shows HMR events, last reload reason, runtime errors. */
export function DiagnosticsPanel() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [hmr, setHmr] = useState<string>("idle");
  const dev = import.meta.env.DEV;

  useEffect(() => {
    if (!dev) return;
    setEntries(getDiagnosticsSnapshot().entries);
    const unsubscribe = subscribeDiagnostics(() => setEntries(getDiagnosticsSnapshot().entries));
    const nav = performance.getEntriesByType("navigation")[0]?.toJSON?.()?.type;
    if (nav === "reload") setLastReloadReason("Browser page reload");
    const add = (e: Entry) => {
      recordDiagnosticsEntry(e);
      setEntries((prev) => [e, ...prev].slice(0, 30));
    };

    const onErr = (ev: ErrorEvent) => add({ type: "error", message: ev.message, at: new Date().toISOString(), stack: ev.error?.stack });
    const onRej = (ev: PromiseRejectionEvent) => add({ type: "rejection", message: String(ev.reason?.message || ev.reason), at: new Date().toISOString() });
    const onCustom = (ev: Event) => { const d = (ev as CustomEvent).detail; if (d) add(d); };

    window.addEventListener("error", onErr);
    window.addEventListener("unhandledrejection", onRej);
    window.addEventListener("mr-diagnostics", onCustom);

    // Hook Vite HMR
    const hot = (import.meta as any).hot;
    if (hot) {
      hot.on("vite:beforeUpdate", () => { setHmr("updating"); setLastReloadReason("Vite hot update"); add({ type: "hmr", message: "beforeUpdate", at: new Date().toISOString() }); });
      hot.on("vite:afterUpdate", () => setHmr("idle"));
      hot.on("vite:beforeFullReload", (p: any) => { setHmr("reloading"); setLastReloadReason(`Vite full reload: ${p?.path || "unknown"}`); add({ type: "hmr", message: `full reload: ${p?.path || "unknown"}`, at: new Date().toISOString() }); });
      hot.on("vite:error", (p: any) => { setLastReloadReason("Vite error"); add({ type: "hmr-error", message: p?.err?.message || "hmr error", at: new Date().toISOString() }); });
    }

    return () => {
      window.removeEventListener("error", onErr);
      window.removeEventListener("unhandledrejection", onRej);
      window.removeEventListener("mr-diagnostics", onCustom);
      unsubscribe();
    };
  }, [dev]);

  if (!dev) return null;

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 left-4 z-[100] h-10 w-10 rounded-full bg-foreground text-background shadow-lg flex items-center justify-center hover:opacity-90"
        aria-label="Open diagnostics"
        title="Diagnostics"
      >
        <Bug className="h-4 w-4" />
        {entries.some((e) => e.type.includes("error")) && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive" />
        )}
      </button>
      {open && (
        <div className="fixed bottom-16 left-4 z-[100] w-[min(420px,92vw)] max-h-[60vh] overflow-auto rounded-lg border bg-background shadow-2xl">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <div className="text-sm font-semibold">Diagnostics · HMR: {hmr}</div>
            <button onClick={() => setOpen(false)} aria-label="Close"><X className="h-4 w-4" /></button>
          </div>
          <div className="p-3 space-y-2 text-xs">
            {entries.length === 0 && <p className="text-muted-foreground">No events yet.</p>}
            {entries.map((e, i) => (
              <div key={i} className="border rounded p-2">
                <div className="flex justify-between text-[10px] uppercase text-muted-foreground">
                  <span>{e.type}</span><span>{new Date(e.at).toLocaleTimeString()}</span>
                </div>
                <div className="break-words">{e.message}</div>
                {e.stack && <pre className="mt-1 text-[10px] whitespace-pre-wrap opacity-70 max-h-24 overflow-auto">{e.stack}</pre>}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
