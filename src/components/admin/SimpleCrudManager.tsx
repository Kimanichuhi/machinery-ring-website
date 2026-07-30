import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, Save, X } from "lucide-react";

export type CrudField = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "boolean";
  placeholder?: string;
  required?: boolean;
};

type Row = Record<string, any>;

export function SimpleCrudManager({
  table,
  title,
  description,
  fields,
  orderBy = "sort_order",
  primaryField,
  defaults = {},
}: {
  table: string;
  title: string;
  description?: string;
  fields: CrudField[];
  orderBy?: string;
  primaryField: string;
  defaults?: Row;
}) {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Row>(defaults);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from(table)
      .select("*")
      .order(orderBy, { ascending: true });
    if (error) toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    setRows(data || []);
    setLoading(false);
  }, [table, orderBy, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const reset = () => {
    setEditingId(null);
    setCreating(false);
    setForm(defaults);
  };

  const save = async () => {
    for (const f of fields) {
      if (f.required && !String(form[f.name] ?? "").trim()) {
        toast({ title: `${f.label} is required`, variant: "destructive" });
        return;
      }
    }
    setSaving(true);
    const payload: Row = {};
    fields.forEach((f) => {
      let v = form[f.name];
      if (f.type === "number") v = v === "" || v == null ? 0 : Number(v);
      if (f.type === "boolean") v = !!v;
      payload[f.name] = v ?? null;
    });

    const query = editingId
      ? (supabase as any).from(table).update(payload).eq("id", editingId)
      : (supabase as any).from(table).insert(payload);
    const { error } = await query;
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: editingId ? "Updated" : "Created" });
    reset();
    load();
  };

  const remove = async (id: string) => {
    const { error } = await (supabase as any).from(table).delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Deleted" });
    load();
  };

  const editorOpen = creating || editingId !== null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        {!editorOpen && (
          <Button size="sm" onClick={() => { setForm(defaults); setCreating(true); }}>
            <Plus className="h-4 w-4 mr-1" /> New
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {editorOpen && (
          <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
            <div className="grid gap-3 sm:grid-cols-2">
              {fields.map((f) => (
                <div key={f.name} className={f.type === "textarea" ? "sm:col-span-2 space-y-1.5" : "space-y-1.5"}>
                  <Label htmlFor={`${table}-${f.name}`}>{f.label}</Label>
                  {f.type === "textarea" ? (
                    <Textarea
                      id={`${table}-${f.name}`}
                      value={form[f.name] ?? ""}
                      placeholder={f.placeholder}
                      onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    />
                  ) : f.type === "boolean" ? (
                    <div className="flex h-10 items-center">
                      <Switch
                        id={`${table}-${f.name}`}
                        checked={!!form[f.name]}
                        onCheckedChange={(v) => setForm({ ...form, [f.name]: v })}
                      />
                    </div>
                  ) : (
                    <Input
                      id={`${table}-${f.name}`}
                      type={f.type === "number" ? "number" : "text"}
                      value={form[f.name] ?? ""}
                      placeholder={f.placeholder}
                      onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={save} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Save
              </Button>
              <Button size="sm" variant="ghost" onClick={reset}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Nothing here yet.</p>
        ) : (
          <div className="divide-y rounded-lg border">
            {rows.map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{row[primaryField] || "Untitled"}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {fields
                      .filter((f) => f.name !== primaryField)
                      .slice(0, 3)
                      .map((f) => `${f.label}: ${f.type === "boolean" ? (row[f.name] ? "Yes" : "No") : row[f.name] ?? "—"}`)
                      .join(" · ")}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => { setEditingId(row.id); setCreating(false); setForm(row); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(row.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SimpleCrudManager;
