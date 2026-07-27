import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, CheckCircle, Calendar } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";

interface Props { mode?: "booking" | "consultation" }

const BookingForm: React.FC<Props> = ({ mode = "booking" }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(!!id);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", preferred_date: "", farm_size: "", location: "", message: "" });

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    supabase.from("services").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      setService(data); setLoading(false);
    });
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("bookings").insert({
      user_id: userData.user?.id ?? null,
      service_id: id || null,
      service_name: service?.name || (mode === "consultation" ? "General Consultation" : ""),
      booking_type: mode,
      full_name: form.full_name, email: form.email, phone: form.phone,
      preferred_date: form.preferred_date || null,
      farm_size: form.farm_size, location: form.location, message: form.message,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setDone(true);
    toast.success("Request submitted. Our team will contact you shortly.");
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const title = mode === "consultation" ? "Request a Consultation" : `Book: ${service?.name || "Service"}`;
  const path = mode === "consultation" ? "/consultation" : `/book/${id}`;

  return (
    <div className="bg-background min-h-screen">
      <SEO
        title={`${title} · Machinery Ring`}
        description="Book expert agricultural services and consultations with our certified team."
        path={path}
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>

        {done ? (
          <Card><CardContent className="py-16 text-center">
            <CheckCircle className="h-14 w-14 mx-auto text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-2">Request Received</h2>
            <p className="text-muted-foreground mb-6">Our team will call or email you within 24 hours to confirm details.</p>
            <div className="flex justify-center gap-3">
              <Link to="/services"><Button variant="outline">Browse Services</Button></Link>
              <Link to="/"><Button variant="hero">Back to Home</Button></Link>
            </div>
          </CardContent></Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> {title}</CardTitle>
              {service && (
                <div className="text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Category:</strong> {service.category}</p>
                  {service.price && <p><strong className="text-foreground">Price:</strong> {service.price}</p>}
                  {service.duration && <p><strong className="text-foreground">Duration:</strong> {service.duration}</p>}
                  {service.description && <p className="mt-2">{service.description}</p>}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><Label>Full name</Label><Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
                  <div><Label>Phone</Label><Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                  <div><Label>Preferred date</Label><Input type="date" value={form.preferred_date} onChange={(e) => setForm({ ...form, preferred_date: e.target.value })} /></div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><Label>Farm size (acres)</Label><Input value={form.farm_size} onChange={(e) => setForm({ ...form, farm_size: e.target.value })} /></div>
                  <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
                </div>
                <div><Label>Message / details</Label><Textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={mode === "consultation" ? "Tell us what you'd like to discuss…" : "Any specific requirements…"} /></div>
                <Button type="submit" variant="hero" className="w-full" disabled={busy}>
                  {busy ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting…</> : "Submit Request"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BookingForm;
