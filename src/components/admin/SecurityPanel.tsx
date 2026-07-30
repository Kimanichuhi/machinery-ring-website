import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, ShieldCheck, ShieldAlert, RefreshCw } from "lucide-react";

type Scan = {
  id: string;
  scanned_at: string;
  source: string;
  total_findings: number;
  fixed_count: number;
  ignored_count: number;
  open_count: number;
  notes: string | null;
};

type Finding = {
  id: string;
  scan_id: string | null;
  internal_id: string;
  title: string;
  description: string | null;
  severity: string;
  status: string;
  fix_notes: string | null;
  fixed_at: string | null;
};

const severityTone: Record<string, string> = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-destructive/80 text-destructive-foreground",
  medium: "bg-amber-500 text-white",
  low: "bg-muted text-muted-foreground",
};

export function SecurityPanel() {
  const { toast } = useToast();
  const [scans, setScans] = useState<Scan[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [scanRes, findingRes] = await Promise.all([
      (supabase as any).from("security_scans").select("*").order("scanned_at", { ascending: false }),
      (supabase as any).from("security_findings").select("*").order("created_at", { ascending: false }),
    ]);
    if (scanRes.error || findingRes.error) {
      toast({
        title: "Failed to load security data",
        description: scanRes.error?.message || findingRes.error?.message,
        variant: "destructive",
      });
    }
    setScans(scanRes.data || []);
    setFindings(findingRes.data || []);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const exportBaseline = () => {
    const payload = {
      generated_at: new Date().toISOString(),
      findings: findings.map((f) => ({
        internal_id: f.internal_id,
        title: f.title,
        severity: f.severity,
        status: f.status,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "security-baseline.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const openFindings = findings.filter((f) => f.status === "open");
  const fixedFindings = findings.filter((f) => f.status === "fixed");
  const ignoredFindings = findings.filter((f) => f.status === "ignored");

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Open findings" value={openFindings.length} tone={openFindings.length ? "alert" : "ok"} />
        <StatCard label="Fixed findings" value={fixedFindings.length} tone="ok" />
        <StatCard label="Ignored" value={ignoredFindings.length} tone="neutral" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={load}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
        <Button size="sm" variant="outline" onClick={exportBaseline}>
          <Download className="h-4 w-4 mr-1" /> Export baseline for CI
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scan history</CardTitle>
        </CardHeader>
        <CardContent>
          {scans.length === 0 ? (
            <p className="text-sm text-muted-foreground">No scans recorded yet.</p>
          ) : (
            <div className="divide-y rounded-lg border">
              {scans.map((s) => (
                <div key={s.id} className="p-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{new Date(s.scanned_at).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{s.source}{s.notes ? ` · ${s.notes}` : ""}</p>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <Badge variant="secondary">{s.total_findings} found</Badge>
                    <Badge variant="secondary">{s.fixed_count} fixed</Badge>
                    <Badge variant={s.open_count ? "destructive" : "secondary"}>{s.open_count} open</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Findings</CardTitle>
        </CardHeader>
        <CardContent>
          {findings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No findings recorded.</p>
          ) : (
            <div className="divide-y rounded-lg border">
              {findings.map((f) => (
                <div key={f.id} className="p-3 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${severityTone[f.severity] || severityTone.low}`}>
                      {f.severity}
                    </span>
                    <p className="font-medium">{f.title}</p>
                    <Badge variant={f.status === "fixed" ? "secondary" : f.status === "open" ? "destructive" : "outline"}>
                      {f.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">{f.internal_id}</p>
                  {f.description && <p className="text-sm text-muted-foreground">{f.description}</p>}
                  {f.fix_notes && (
                    <p className="text-sm">
                      <span className="font-medium">Fix:</span> {f.fix_notes}
                      {f.fixed_at ? ` (${new Date(f.fixed_at).toLocaleDateString()})` : ""}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: "ok" | "alert" | "neutral" }) {
  const Icon = tone === "alert" ? ShieldAlert : ShieldCheck;
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <Icon className={`h-8 w-8 ${tone === "alert" ? "text-destructive" : tone === "ok" ? "text-primary" : "text-muted-foreground"}`} />
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default SecurityPanel;
