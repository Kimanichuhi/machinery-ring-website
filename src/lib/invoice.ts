import jsPDF from "jspdf";

export interface InvoiceOrder {
  order_number: string;
  created_at: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address?: string;
  notes?: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  items: Array<{ product_name: string; unit_price: number; quantity: number; subtotal: number }>;
}

const GREEN: [number, number, number] = [34, 139, 34]; // matches primary green
const TEXT: [number, number, number] = [30, 30, 30];
const MUTED: [number, number, number] = [110, 110, 110];

const KES = (n: number) => `KES ${Number(n || 0).toLocaleString()}`;

async function tryLoadLogo(): Promise<string | null> {
  try {
    const res = await fetch("/mrlogo.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const r = new FileReader();
      r.onloadend = () => resolve(r.result as string);
      r.readAsDataURL(blob);
    });
  } catch { return null; }
}

export async function generateInvoicePDF(order: InvoiceOrder) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header band
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, pageWidth, 80, "F");

  const logo = await tryLoadLogo();
  if (logo) {
    try { doc.addImage(logo, "PNG", 40, 20, 40, 40); } catch { /* ignore */ }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Machinery Ring Nyandarua", logo ? 92 : 40, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Njabini - Olkalou Highway, Nyandarua, Kenya", logo ? 92 : 40, 56);
  doc.text("nyandarua-mr@machineryring.org  ·  +254 741595086", logo ? 92 : 40, 70);

  // Invoice meta
  doc.setTextColor(...TEXT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("INVOICE", pageWidth - 40, 40, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(`# ${order.order_number}`, pageWidth - 40, 56, { align: "right" });
  doc.text(new Date(order.created_at).toLocaleDateString(), pageWidth - 40, 70, { align: "right" });

  // Bill to
  let y = 120;
  doc.setTextColor(...TEXT);
  doc.setFont("helvetica", "bold"); doc.setFontSize(11);
  doc.text("BILL TO", 40, y);
  doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  y += 16;
  doc.text(order.customer_name, 40, y); y += 14;
  doc.text(order.customer_email, 40, y); y += 14;
  doc.text(order.customer_phone, 40, y); y += 14;
  if (order.delivery_address) { doc.text(order.delivery_address, 40, y, { maxWidth: 260 }); y += 14; }

  // Status
  doc.setFont("helvetica", "bold"); doc.setFontSize(10);
  doc.setTextColor(...GREEN);
  doc.text(`Status: ${order.status.toUpperCase()}`, pageWidth - 40, 120, { align: "right" });

  // Items table
  y = Math.max(y + 20, 220);
  doc.setFillColor(...GREEN);
  doc.rect(40, y, pageWidth - 80, 24, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold"); doc.setFontSize(10);
  doc.text("ITEM", 50, y + 16);
  doc.text("QTY", pageWidth - 240, y + 16, { align: "right" });
  doc.text("UNIT PRICE", pageWidth - 150, y + 16, { align: "right" });
  doc.text("SUBTOTAL", pageWidth - 50, y + 16, { align: "right" });
  y += 34;

  doc.setTextColor(...TEXT);
  doc.setFont("helvetica", "normal");
  order.items.forEach((it, i) => {
    if (i % 2 === 0) { doc.setFillColor(248, 250, 248); doc.rect(40, y - 12, pageWidth - 80, 22, "F"); }
    doc.text(it.product_name, 50, y + 2, { maxWidth: 260 });
    doc.text(String(it.quantity), pageWidth - 240, y + 2, { align: "right" });
    doc.text(KES(it.unit_price), pageWidth - 150, y + 2, { align: "right" });
    doc.text(KES(it.subtotal), pageWidth - 50, y + 2, { align: "right" });
    y += 22;
  });

  // Totals
  y += 12;
  doc.setDrawColor(220);
  doc.line(pageWidth - 260, y, pageWidth - 40, y);
  y += 16;
  doc.setFontSize(10);
  doc.text("Subtotal", pageWidth - 200, y); doc.text(KES(order.subtotal), pageWidth - 50, y, { align: "right" });
  y += 16;
  doc.text("Delivery", pageWidth - 200, y); doc.text(KES(order.delivery_fee), pageWidth - 50, y, { align: "right" });
  y += 18;
  doc.setFont("helvetica", "bold"); doc.setFontSize(13);
  doc.setTextColor(...GREEN);
  doc.text("TOTAL", pageWidth - 200, y); doc.text(KES(order.total), pageWidth - 50, y, { align: "right" });

  // Notes
  if (order.notes) {
    y += 40; doc.setTextColor(...TEXT); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
    doc.text("Notes", 40, y); y += 14;
    doc.setFont("helvetica", "normal"); doc.setTextColor(...MUTED);
    doc.text(order.notes, 40, y, { maxWidth: pageWidth - 80 });
  }

  // Footer
  doc.setFontSize(9); doc.setTextColor(...MUTED);
  doc.text("Thank you for choosing Machinery Ring — Smart Farming, Better Yields.",
    pageWidth / 2, doc.internal.pageSize.getHeight() - 30, { align: "center" });

  doc.save(`invoice-${order.order_number}.pdf`);
}
