import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Users, Clock, Award, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePageContent } from '@/hooks/usePageContent';

const ICONS: Record<string, any> = { CheckCircle, Users, Award };

const FALLBACK_STATS = [
  { name: 'Certified Experts', value: '50+', icon: 'Users' },
  { name: 'Services Completed', value: '2,800+', icon: 'Award' },
  { name: 'Satisfaction Rate', value: '98%', icon: 'CheckCircle' },
];

const Services = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { get, items } = usePageContent('services');
  const hero = get('hero', { title: 'Expert Agricultural Services', content: 'Professional farming services from certified experts to help you maximize yields, optimize resources and grow your agricultural business.' });
  const stats = items('stats', FALLBACK_STATS);
  const cta = get('cta', { title: 'Need Custom Agricultural Support?', content: 'Our team of agricultural experts is ready to provide personalized solutions for your specific farming needs.', metadata: { cta_primary: { label: 'Contact Our Experts', href: '/contact' }, cta_secondary: { label: 'Request Quote', href: '/contact' } } });

  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await supabase.from('services').select('*').order('sort_order');
      setServices(data || []);
      setLoading(false);
    };
    fetchServices();
  }, []);

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">{hero.title}</h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-muted-foreground max-w-2xl mx-auto px-4">{hero.content}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-muted/50 py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-${Math.min(stats.length, 4)} text-center`}>
            {stats.map((s: any) => {
              const Icon = ICONS[s.icon] || Users;
              return (
                <div key={s.name}>
                  <div className="flex justify-center mb-2"><Icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" /></div>
                  <p className="text-2xl sm:text-3xl font-bold text-primary">{s.value}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{s.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
            {services.map((service) => (
              <Card key={service.id} className="product-card">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {service.category}
                      </Badge>
                      <CardTitle className="text-lg sm:text-xl font-bold">
                        {service.name}
                      </CardTitle>
                      <CardDescription className="mt-2 text-sm sm:text-base">
                        {service.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-2">
                    <div>
                      <p className="text-base sm:text-lg font-bold text-primary">{service.price}</p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{service.duration}</span>
                        </div>
                        {service.rating && <span>★ {service.rating}</span>}
                        {service.bookings && <span>{service.bookings} bookings</span>}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                  {service.features && service.features.length > 0 && (
                    <div className="space-y-3 mb-4 sm:mb-6">
                      <h4 className="font-semibold text-sm">What's included:</h4>
                      <ul className="space-y-2">
                        {service.features.map((feature: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2 text-xs sm:text-sm">
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="flex-1" variant="hero">
                      Book Service
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-primary py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">{cta.title}</h2>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-primary-foreground/90 max-w-2xl mx-auto">{cta.content}</p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {cta.metadata?.cta_primary && (
                <Link to={cta.metadata.cta_primary.href}>
                  <Button size="lg" variant="secondary">{cta.metadata.cta_primary.label}</Button>
                </Link>
              )}
              {cta.metadata?.cta_secondary && (
                <Link to={cta.metadata.cta_secondary.href}>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">{cta.metadata.cta_secondary.label}</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;