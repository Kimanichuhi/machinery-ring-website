import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Minus, Plus, ShoppingBag, Loader2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { type InvoiceOrder } from "@/lib/invoice";
import { InvoicePreviewDialog } from "@/components/InvoicePreviewDialog";
import { SEO } from "@/components/SEO";

const DELIVERY_FEE = 200;

const Cart = () => {
  const { items, subtotal, setQuantity, remove, clear, count } = useCart();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<InvoiceOrder | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [form, setForm] = useState({
    name: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    phone: user?.user_metadata?.phone || "",
    address: "",
    notes: "",
  });

  const total = subtotal + (items.length ? DELIVERY_FEE : 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate("/auth?redirect=/cart"); return; }
    if (items.length === 0) return;
    setPlacing(true);
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          delivery_address: form.address,
          notes: form.notes,
          subtotal,
          delivery_fee: DELIVERY_FEE,
          total,
        })
        .select()
        .single();
      if (error) throw error;

      const rows = items.map((i) => ({
        order_id: order.id,
        product_id: /^[0-9a-f-]{36}$/i.test(i.id) ? i.id : null,
        product_name: i.name,
        unit_price: i.price,
        quantity: i.quantity,
        subtotal: i.price * i.quantity,
      }));
      const { data: insertedItems, error: itemsError } = await supabase.from("order_items").insert(rows).select();
      if (itemsError) throw itemsError;

      // Prices are enforced server-side (trigger recomputes unit_price/subtotal
      // from the live product price and rolls the order's subtotal/total up from
      // that), so re-fetch the order to show the customer what was actually billed.
      const { data: finalOrder, error: refetchError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", order.id)
        .single();
      if (refetchError) throw refetchError;

      const nextInvoice: InvoiceOrder = {
        order_number: finalOrder.order_number,
        created_at: finalOrder.created_at,
        status: finalOrder.status,
        customer_name: finalOrder.customer_name,
        customer_email: finalOrder.customer_email,
        customer_phone: finalOrder.customer_phone,
        delivery_address: finalOrder.delivery_address,
        notes: finalOrder.notes,
        subtotal: Number(finalOrder.subtotal),
        delivery_fee: Number(finalOrder.delivery_fee),
        total: Number(finalOrder.total),
        items: (insertedItems || []).map((r) => ({ product_name: r.product_name, unit_price: Number(r.unit_price), quantity: r.quantity, subtotal: Number(r.subtotal) })),
      };

      setInvoiceOrder(nextInvoice);
      setInvoiceOpen(true);
      toast.success(`Order ${order.order_number} placed. Preview your invoice to download.`);
      clear();
    } catch (err: any) {
      toast.error(err.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="bg-background min-h-screen">
      <SEO title="Your Cart · Machinery Ring" description="Review your cart and place your order." path="/cart" />
      <InvoicePreviewDialog
        open={invoiceOpen}
        order={invoiceOrder}
        onOpenChange={(open) => {
          setInvoiceOpen(open);
          if (!open && invoiceOrder) navigate("/orders");
        }}
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Your Cart</h1>

        {count === 0 ? (
          <Card><CardContent className="py-16 text-center">
            <ShoppingBag className="h-14 w-14 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Your cart is empty.</p>
            <Link to="/marketplace"><Button variant="hero">Shop Marketplace</Button></Link>
          </CardContent></Card>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-3">
              {items.map((i) => (
                <Card key={i.id}>
                  <CardContent className="p-3 sm:p-4 flex gap-3 sm:gap-4 items-center">
                    <img src={i.image_url || "/placeholder.svg"} alt={i.name} className="h-16 w-16 sm:h-20 sm:w-20 rounded-md object-cover bg-muted" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm sm:text-base line-clamp-1">{i.name}</p>
                      <p className="text-xs text-muted-foreground">{i.unit}</p>
                      <p className="text-primary font-bold text-sm mt-1">KES {i.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setQuantity(i.id, i.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                      <span className="w-8 text-center text-sm">{i.quantity}</span>
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setQuantity(i.id, i.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => remove(i.id)} aria-label="Remove"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="h-fit">
              <CardHeader><CardTitle>Checkout</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>KES {subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Delivery</span><span>KES {DELIVERY_FEE.toLocaleString()}</span></div>
                  <div className="border-t pt-2 flex justify-between font-bold text-base text-primary">
                    <span>Total</span><span>KES {total.toLocaleString()}</span>
                  </div>
                </div>

                {!user ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-3">Sign in to place your order.</p>
                    <Button variant="hero" className="w-full" onClick={() => navigate("/auth?redirect=/cart")}>Sign In to Continue</Button>
                  </>
                ) : (
                  <form onSubmit={handleCheckout} className="space-y-3">
                    <div><Label>Full name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                    <div><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                    <div><Label>Phone</Label><Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                    <div><Label>Delivery address</Label><Textarea required rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
                    <div><Label>Notes (optional)</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                    <Button type="submit" variant="hero" className="w-full" disabled={placing}>
                      {placing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Placing…</> : <><Download className="h-4 w-4 mr-2" /> Place Order & Get Invoice</>}
                    </Button>
                    <p className="text-[11px] text-muted-foreground text-center">Payment on delivery — our team will call to confirm.</p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
