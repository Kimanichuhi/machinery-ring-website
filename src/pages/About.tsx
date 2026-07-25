import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Leaf, Users, Award, Target, Heart, Globe } from 'lucide-react';
import { usePageContent } from '@/hooks/usePageContent';
import { SEO } from '@/components/SEO';

const ICONS: Record<string, any> = { Leaf, Users, Award, Target, Heart, Globe };

const FALLBACK_STATS = [
  { name: 'Farmers Served', value: '6,000+', icon: 'Users' },
  { name: 'Years of Experience', value: '4+', icon: 'Award' },
  { name: 'Sub-Counties Covered', value: '2', icon: 'Globe' },
  { name: 'Success Rate', value: '80%', icon: 'Target' },
];

const About = () => {
  const { get, items } = usePageContent('about');
  const hero = get('hero', { title: 'About Machinery Ring', content: '', metadata: { image: '/mrlogo.png' } });
  const stats = items('stats', FALLBACK_STATS);
  const mission = get('mission', { title: 'Our Mission', content: '' });
  const vision = get('vision', { title: 'Our Vision', content: '' });
  const values = get('values', { title: 'Our Core Values', content: 'The principles that guide everything we do at Machinery Ring.' });
  const valueItems = items('values', []);
  const team = get('team', { title: 'Meet Our Team', content: '' });
  const teamItems = items('team', []);
  const cta = get('cta', { title: 'Ready to Join Our Community?', content: '', metadata: { cta_primary: { label: 'Get Started Today', href: '/marketplace' }, cta_secondary: { label: 'Contact Us', href: '/contact' } } });

  const paragraphs = (hero.content || '').split(/\n\n+/).filter(Boolean);

  return (
    <div className="bg-background min-h-screen">
      <SEO
        title="About Machinery Ring — Farmer-Owned Agri Services in Nyandarua"
        description="Machinery Ring is a farmer-owned organization in Nyandarua, Kenya delivering quality inputs, mechanization, training and community programs."
        path="/about"
      />
      {/* Hero */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:px-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4 sm:mb-6">{hero.title}</h1>
          {hero.metadata?.image && (
            <div className="float-none sm:float-right sm:ml-6 mb-4 w-full sm:w-1/2 md:w-2/5 lg:w-1/3">
              <img src={hero.metadata.image} alt={hero.title || 'About'} className="rounded-xl shadow-md object-cover w-full h-auto" />
            </div>
          )}
          {paragraphs.map((p, i) => (
            <p key={i} className="text-base sm:text-lg leading-7 sm:leading-8 text-muted-foreground text-justify mt-4 first:mt-0">{p}</p>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-muted/50 py-12 sm:py-16">
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
      </div>

      {/* Mission & Vision */}
      <div className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 sm:gap-16 lg:grid-cols-2">
            {[mission, vision].map((sec, i) => (
              <div key={i}>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">{sec.title}</h2>
                {(sec.content || '').split(/\n\n+/).map((p, j) => (
                  <p key={j} className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-muted-foreground">{p}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values */}
      {valueItems.length > 0 && (
        <div className="bg-muted/50 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">{values.title}</h2>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-muted-foreground">{values.content}</p>
            </div>
            <div className="mx-auto mt-12 sm:mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-2">
              {valueItems.map((v: any) => {
                const Icon = ICONS[v.icon] || Leaf;
                return (
                  <Card key={v.title} className="product-card">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-lg sm:text-xl font-bold">{v.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent><p className="text-sm sm:text-base text-muted-foreground">{v.description}</p></CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Team */}
      {teamItems.length > 0 && (
        <div className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">{team.title}</h2>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-muted-foreground">{team.content}</p>
            </div>
            <div className="mx-auto mt-12 sm:mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-2">
              {teamItems.map((m: any) => (
                <Card key={m.name} className="product-card">
                  <CardHeader>
                    <div className="flex items-start space-x-4">
                      <img src={m.image || '/placeholder.svg'} alt={m.name} className="h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover" />
                      <div>
                        <CardTitle className="text-base sm:text-lg font-bold">{m.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1 text-xs">{m.role}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent><p className="text-sm sm:text-base text-muted-foreground">{m.bio}</p></CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="bg-primary py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">{cta.title}</h2>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-primary-foreground/90 max-w-2xl mx-auto">{cta.content}</p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {cta.metadata?.cta_primary && (
              <Link to={cta.metadata.cta_primary.href}><Button size="lg" variant="secondary">{cta.metadata.cta_primary.label}</Button></Link>
            )}
            {cta.metadata?.cta_secondary && (
              <Link to={cta.metadata.cta_secondary.href}><Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">{cta.metadata.cta_secondary.label}</Button></Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
