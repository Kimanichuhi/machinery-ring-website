export interface DiagnosticsEntry {
  type: string;
  message: string;
  at: string;
  stack?: string;
  componentStack?: string;
}

export interface DiagnosticsSnapshot {
  entries: DiagnosticsEntry[];
  lastReloadReason: string;
}

const ENTRIES_KEY = "mr-diagnostics-entries";
const RELOAD_KEY = "mr-diagnostics-last-reload";
const EVENT_NAME = "mr-diagnostics-store-updated";

const hasWindow = () => typeof window !== "undefined";

function readEntries(): DiagnosticsEntry[] {
  if (!hasWindow()) return [];
  try {
    const raw = window.localStorage.getItem(ENTRIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeEntries(entries: DiagnosticsEntry[]) {
  if (!hasWindow()) return;
  window.localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries.slice(0, 50)));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function recordDiagnosticsEntry(entry: DiagnosticsEntry) {
  writeEntries([entry, ...readEntries()].slice(0, 50));
}

export function setLastReloadReason(reason: string) {
  if (!hasWindow()) return;
  window.localStorage.setItem(RELOAD_KEY, reason);
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function getDiagnosticsSnapshot(): DiagnosticsSnapshot {
  if (!hasWindow()) return { entries: [], lastReloadReason: "unavailable" };
  return {
    entries: readEntries(),
    lastReloadReason: window.localStorage.getItem(RELOAD_KEY) || "No reload recorded",
  };
}

export function subscribeDiagnostics(listener: () => void) {
  if (!hasWindow()) return () => undefined;
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}

export function downloadDiagnosticsReport(toggles: Record<string, unknown>) {
  if (!hasWindow()) return;
  const snapshot = getDiagnosticsSnapshot();
  const report = {
    generatedAt: new Date().toISOString(),
    route: window.location.pathname + window.location.search,
    origin: window.location.origin,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    visibilityState: document.visibilityState,
    navigationType: performance.getEntriesByType("navigation")[0]?.toJSON?.()?.type || "unknown",
    toggles,
    lastReloadReason: snapshot.lastReloadReason,
    runtimeErrors: snapshot.entries.filter((entry) => entry.type.includes("error") || entry.type === "rejection"),
    entries: snapshot.entries,
  };
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `mr-diagnostics-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}