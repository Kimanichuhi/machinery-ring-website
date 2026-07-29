import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

/**
 * Minimal isolation page to diagnose preview reloads / render issues.
 * No data fetching, no animations, no dependency on layout components.
 */
export default function Diagnostics() {
  const [animations, setAnimations] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [heavy, setHeavy] = useState(false);
  const [tick, setTick] = useState(0);

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Diagnostics</h1>
          <Link to="/"><Button variant="outline" size="sm">Home</Button></Link>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Isolation toggles</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Row label="Animations" checked={animations} onCheckedChange={setAnimations} />
            <Row label="Data fetching" checked={fetching} onCheckedChange={setFetching} />
            <Row label="Non-essential components" checked={heavy} onCheckedChange={setHeavy} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Environment</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1 font-mono">
            <div>UA: {typeof navigator !== "undefined" ? navigator.userAgent : "n/a"}</div>
            <div>Viewport: {typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "n/a"}</div>
            <div>Origin: {typeof window !== "undefined" ? window.location.origin : "n/a"}</div>
            <div>Mode: {import.meta.env.MODE}</div>
            <div>Supabase URL set: {String(!!import.meta.env.VITE_SUPABASE_URL)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Render probe</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">Click to bump state without navigation. Tick: {tick}</p>
            <Button size="sm" onClick={() => setTick((t) => t + 1)}>Bump</Button>
          </CardContent>
        </Card>

        {heavy && (
          <div className={animations ? "animate-fade-in" : ""}>
            <p className="text-sm">Heavy block visible.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, checked, onCheckedChange }: { label: string; checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <Label>{label}</Label>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
