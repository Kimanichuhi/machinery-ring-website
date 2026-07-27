import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Package } from "lucide-react";
import { generateInvoicePDF } from "@/lib/invoice";
import { SEO } from "@/components/SEO";

const MyOrders = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/auth?redirect=/orders"); return; }
    (async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      setOrders(data || []);
      setBusy(false);
    })();
  }, [user, loading, navigate]);

  const downloadInvoice = async (o: any) => {
    await generateInvoicePDF({
      order_number: o.order_number, created_at: o.created_at, status: o.status,
      customer_name: o.customer_name, customer_email: o.customer_email, customer_phone: o.customer_phone,
      delivery_address: o.delivery_address, notes: o.notes,
      subtotal: Number(o.subtotal), delivery_fee: Number(o.delivery_fee), total: Number(o.total),
      items: (o.order_items || []).map((i: any) => ({ product_name: i.product_name, unit_price: Number(i.unit_price), quantity: i.quantity, subtotal: Number(i.subtotal) })),
    });
  };

  if (loading || busy) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="bg-background min-h-screen">
      <SEO title="My Orders · Machinery Ring" description="Track your orders and download invoices." path="/orders" />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">My Orders</h1>
        {orders.length === 0 ? (
          <Card><CardContent className="py-16 text-center">
            <Package className="h-14 w-14 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No orders yet.</p>
            <Link to="/marketplace"><Button variant="hero">Start Shopping</Button></Link>
          </CardContent></Card>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <Card key={o.id}>
                <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
                  <div>
                    <CardTitle className="text-base sm:text-lg">{o.order_number}</CardTitle>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
                  </div>
                  <Badge variant="secondary" className="capitalize">{o.status}</Badge>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <ul className="space-y-1">
                    {(o.order_items || []).map((i: any) => (
                      <li key={i.id} className="flex justify-between">
                        <span className="truncate mr-2">{i.product_name} × {i.quantity}</span>
                        <span>KES {Number(i.subtotal).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t pt-2 flex items-center justify-between">
                    <span className="font-bold text-primary">Total: KES {Number(o.total).toLocaleString()}</span>
                    <Button size="sm" variant="outline" onClick={() => downloadInvoice(o)}>
                      <Download className="h-3 w-3 mr-1" /> Invoice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
