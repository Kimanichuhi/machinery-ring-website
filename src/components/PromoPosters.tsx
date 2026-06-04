import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight } from 'lucide-react';

interface Poster {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link_url: string;
  link_label: string;
  start_date: string;
  end_date: string;
}

export const PromoPosters: React.FC = () => {
  const [posters, setPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosters = async () => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from('promo_posters')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('sort_order');
      setPosters(data || []);
      setLoading(false);
    };
    fetchPosters();
  }, []);

  if (loading || posters.length === 0) return null;

  const formatDate = (s: string) => new Date(s).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <section className="bg-muted/30 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <Badge variant="secondary" className="mb-3">Featured</Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
            Upcoming Events & Trainings
          </h2>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground">
            Don't miss these limited-time opportunities
          </p>
        </div>
        <div className={`grid gap-6 ${posters.length === 1 ? 'max-w-2xl mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {posters.map(p => (
            <Card key={p.id} className="overflow-hidden group hover:shadow-xl transition-shadow">
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(p.start_date)} – {formatDate(p.end_date)}</span>
                </div>
                <h3 className="font-bold text-lg text-foreground">{p.title}</h3>
                {p.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{p.description}</p>}
                {p.link_url && (
                  <a href={p.link_url} target={p.link_url.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer">
                    <Button variant="hero" size="sm" className="mt-4">
                      {p.link_label || 'Learn More'}
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
