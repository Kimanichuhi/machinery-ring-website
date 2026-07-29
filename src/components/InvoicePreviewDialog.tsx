import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { createInvoicePreviewUrl, downloadInvoicePDF, type InvoiceOrder } from "@/lib/invoice";

interface InvoicePreviewDialogProps {
  open: boolean;
  order: InvoiceOrder | null;
  onOpenChange: (open: boolean) => void;
}

export function InvoicePreviewDialog({ open, order, onOpenChange }: InvoicePreviewDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let active = true;

    if (!open || !order) {
      setPreviewUrl(null);
      return () => undefined;
    }

    setLoading(true);
    createInvoicePreviewUrl(order).then(({ url, revoke }) => {
      if (!active) {
        revoke();
        return;
      }
      cleanup = revoke;
      setPreviewUrl(url);
      setLoading(false);
    }).catch(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
      cleanup?.();
    };
  }, [open, order]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle>Invoice preview{order ? ` · ${order.order_number}` : ""}</DialogTitle>
        </DialogHeader>
        <div className="h-[70vh] bg-muted/40">
          {loading && (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" /> Preparing invoice…
            </div>
          )}
          {!loading && previewUrl && (
            <iframe title="Invoice preview" src={previewUrl} className="h-full w-full bg-background" />
          )}
          {!loading && !previewUrl && (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Preview unavailable.</div>
          )}
        </div>
        <DialogFooter className="border-t px-5 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button variant="hero" onClick={() => order && downloadInvoicePDF(order)} disabled={!order}>
            <Download className="mr-2 h-4 w-4" /> Download invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}