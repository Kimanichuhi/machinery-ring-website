import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, CheckCircle, Clock } from "lucide-react";
import { SEO } from "@/components/SEO";

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("services").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      setService(data); setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!service) return <div className="min-h-[60vh] flex items-center justify-center flex-col gap-3"><p>Service not found.</p><Link to="/services"><Button variant="hero">Back to Services</Button></Link></div>;

  return (
    <div className="bg-background min-h-screen">
      <SEO title={`${service.name} · Machinery Ring`} description={service.description || `${service.name} — professional agricultural service.`} path={`/services/${id}`} />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        <Card>
          <CardHeader>
            {service.category && <Badge variant="secondary" className="w-fit mb-2">{service.category}</Badge>}
            <CardTitle className="text-2xl sm:text-3xl">{service.name}</CardTitle>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
              {service.price && <span className="text-primary font-bold text-lg">{service.price}</span>}
              {service.duration && <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {service.duration}</span>}
              {service.rating && <span>★ {service.rating}</span>}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {service.description && <p className="text-base leading-relaxed text-muted-foreground">{service.description}</p>}
            {service.features?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">What's included</h3>
                <ul className="space-y-2">
                  {service.features.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm"><CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /><span>{f}</span></li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link to={`/book/${service.id}`} className="flex-1"><Button variant="hero" className="w-full">Book This Service</Button></Link>
              <Link to="/consultation" className="flex-1"><Button variant="outline" className="w-full">Request Consultation</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServiceDetail;
