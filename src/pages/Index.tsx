import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Leaf, Users, TrendingUp, Award, ShoppingCart, Wrench, BookOpen, CheckCircle, Globe, Target, Heart } from 'lucide-react';
import { PromoPosters } from '@/components/PromoPosters';
import { usePageContent } from '@/hooks/usePageContent';
import { SEO } from '@/components/SEO';
import heroImage from '@/assets/herobg.jpg';
import productsImage from '@/assets/productDisplay.jpg';

const ICONS: Record<string, any> = { Leaf, Users, TrendingUp, Award, ShoppingCart, Wrench, BookOpen, CheckCircle, Globe, Target, Heart };

// Fallback data — mirrors DB seed so page renders even if the fetch fails
const FALLBACK = {
  hero: { title: 'Smart Farming, Better Yields', content: 'Connect with quality agricultural inputs, expert services, and a thriving community of farmers across Kenya. Transform your farming with Machinery Ring.', metadata: { cta_primary: { label: 'Explore Marketplace', href: '/marketplace' }, cta_secondary: { label: 'Our Services', href: '/services' } } },
  features: { title: 'Everything You Need for Successful Farming', content: 'From premium inputs to expert guidance, we provide comprehensive solutions for modern agricultural practices.' },
  showcase: { title: 'Premium Agricultural Products', content: 'Discover our carefully curated selection of seeds, fertilizers, tools, and fresh produce from verified suppliers across Kenya.', metadata: { badge: 'Featured Products', cta: { label: 'Browse All Products', href: '/marketplace' } } },
  testimonials: { title: 'Trusted by Farmers Across Kenya', content: 'See how Machinery Ring is helping farmers achieve better yields and sustainable growth.' },
  cta: { title: 'Ready to Transform Your Farming?', content: 'Join thousands of farmers who are already using Machinery Ring to improve their yields and grow their agricultural business.', metadata: { cta_primary: { label: 'Start Shopping', href: '/marketplace' }, cta_secondary: { label: 'Book Consultation', href: '/services' } } },
};

const FALLBACK_STATS = [
  { name: 'Active Farmers', value: '5,000+', icon: 'Users' },
  { name: 'Products Listed', value: '1,200+', icon: 'ShoppingCart' },
  { name: 'Expert Services', value: '50+', icon: 'Award' },
  { name: 'Yield Improvement', value: '35%', icon: 'TrendingUp' },
];
const FALLBACK_FEATURES = [
  { name: 'Quality Agricultural Inputs', description: 'Premium seeds, fertilizers, and farming tools from trusted suppliers across Kenya.', icon: 'Leaf', color: 'text-green-600' },
  { name: 'Expert Farm Services', description: 'Professional consultancy, soil testing, and irrigation setup by certified agricultural experts.', icon: 'Wrench', color: 'text-blue-600' },
  { name: 'Educational Resources', description: 'Comprehensive guides, seasonal tips, and best practices for sustainable farming.', icon: 'BookOpen', color: 'text-purple-600' },
  { name: 'Community Marketplace', description: 'Connect with fellow farmers, buy and sell produce, and access local agricultural markets.', icon: 'Users', color: 'text-orange-600' },
];
const FALLBACK_TESTIMONIALS = [
  { content: 'Through the capacity building workshops, I learned about climate-smart farming and financial management — very practical lessons.', author: 'Paul Wachanga', role: 'Smallholder Farmer', location: 'Matura MR' },
  { content: 'Before I started using lime supplied by Machinery Ring, my soil was too acidic. After proper soil testing and lime application, my yields have more than doubled!', author: 'Martin Macharia', role: 'Potato Farmer', location: 'Weru MR' },
  { content: 'Mechanization has made farming easier for me as a woman. My maize yields have greatly improved.', author: 'Faith Wanjiku', role: 'Maize Farmer', location: 'Rurii MR' },
];

const TestimonialsSlider: React.FC<{ items: any[]; heading: string; subheading: string }> = ({ items, heading, subheading }) => {
  const [index, setIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const loop = items.length ? items : FALLBACK_TESTIMONIALS;

  useEffect(() => {
    if (isHovering || loop.length < 2) return;
    const id = setInterval(() => setIndex(p => (p + 1) % loop.length), 4000);
    return () => clearInterval(id);
  }, [isHovering, loop.length]);

  const current = [loop[index], loop[(index + 1) % loop.length]].filter(Boolean);

  return (
    <section className="bg-muted/50 py-16 sm:py-24" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">{heading}</h2>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-muted-foreground">{subheading}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {current.map((t, i) => (
            <Card key={i} className="product-card h-full shadow-md">
              <CardContent className="pt-6 p-4 sm:p-6">
                <blockquote className="text-base sm:text-lg text-muted-foreground italic">"{t.content}"</blockquote>
                <div className="mt-4 sm:mt-6">
                  <div className="font-semibold text-foreground">{t.author}</div>
                  <div className="text-sm text-muted-foreground">{t.role}</div>
                  <div className="text-sm text-primary">{t.location}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

const Index = () => {
  const { get, items } = usePageContent('home');
  const hero = get('hero', FALLBACK.hero);
  const stats = items('stats', FALLBACK_STATS);
  const features = get('features', FALLBACK.features);
  const featureItems = items('features', FALLBACK_FEATURES);
  const showcase = get('products_showcase', FALLBACK.showcase);
  const testimonials = get('testimonials', FALLBACK.testimonials);
  const testimonialItems = items('testimonials', FALLBACK_TESTIMONIALS);
  const cta = get('cta', FALLBACK.cta);

  return (
    <div className="bg-background">
      <SEO
        title="Machinery Ring Nyandarua — Farm Inputs & Services in Kenya"
        description="Quality farm inputs, expert agri-services, and a farmer community across Nyandarua and Kenya. Better yields with Machinery Ring."
        path="/"
      />
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Agricultural landscape in Kenya" className="h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-24 lg:px-8 lg:py-40">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-white animate-fade-in">{hero.title}</h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-white/90 animate-slide-up">{hero.content}</p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-scale-in">
              {hero.metadata?.cta_primary && (
                <Link to={hero.metadata.cta_primary.href}>
                  <Button size="lg" variant="hero" className="w-full sm:w-auto">
                    {hero.metadata.cta_primary.label}<ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
              {hero.metadata?.cta_secondary && (
                <Link to={hero.metadata.cta_secondary.href}>
                  <Button variant="hero-outline" size="lg" className="w-full sm:w-auto border-white text-white">{hero.metadata.cta_secondary.label}</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <PromoPosters />

      {/* Stats */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
            {stats.map((s: any) => {
              const Icon = ICONS[s.icon] || Users;
              return (
                <div key={s.name} className="text-center">
                  <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <p className="mt-3 sm:mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-primary">{s.value}</p>
                  <p className="text-xs sm:text-sm leading-6 text-muted-foreground">{s.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">{features.title}</h2>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-muted-foreground">{features.content}</p>
          </div>
          <div className="mx-auto mt-12 sm:mt-16 lg:mt-24 max-w-2xl lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 sm:gap-y-16 lg:max-w-none lg:grid-cols-2">
              {featureItems.map((f: any) => {
                const Icon = ICONS[f.icon] || Leaf;
                return (
                  <div key={f.name} className="flex flex-col">
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                      <Icon className={`h-5 w-5 flex-none ${f.color || 'text-primary'}`} />
                      {f.name}
                    </dt>
                    <dd className="mt-3 sm:mt-4 flex flex-auto flex-col text-sm sm:text-base leading-7 text-muted-foreground">
                      <p className="flex-auto">{f.description}</p>
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      </section>

      {/* Products showcase */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 sm:gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center">
            <div className="lg:pr-8">
              <div className="lg:max-w-lg">
                {showcase.metadata?.badge && <Badge variant="secondary" className="mb-4">{showcase.metadata.badge}</Badge>}
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">{showcase.title}</h2>
                <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-muted-foreground">{showcase.content}</p>
                {showcase.metadata?.cta && (
                  <div className="mt-6 sm:mt-8">
                    <Link to={showcase.metadata.cta.href}>
                      <Button variant="hero">{showcase.metadata.cta.label}<ArrowRight className="ml-2 h-4 w-4" /></Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
            <div className="relative">
              <img src={productsImage} alt="Fresh agricultural products" className="w-full rounded-xl shadow-xl ring-1 ring-gray-400/10" />
            </div>
          </div>
        </div>
      </section>

      <TestimonialsSlider items={testimonialItems} heading={testimonials.title || ''} subheading={testimonials.content || ''} />

      {/* CTA */}
      <section className="bg-primary py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">{cta.title}</h2>
            <p className="mx-auto mt-4 sm:mt-6 max-w-xl text-base sm:text-lg leading-7 sm:leading-8 text-primary-foreground/90">{cta.content}</p>
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
      </section>
    </div>
  );
};

export default Index;
