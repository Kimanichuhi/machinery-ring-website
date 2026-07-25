import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Loader2 } from 'lucide-react';
import { SEO } from '@/components/SEO';

const GuideDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [guide, setGuide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    supabase.from('guides').select('*').eq('slug', slug).eq('is_published', true).maybeSingle()
      .then(({ data }) => {
        if (!data) setNotFound(true);
        else setGuide(data);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (notFound) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-3xl font-bold mb-2">Guide not found</h1>
        <p className="text-muted-foreground mb-6">This guide may have been moved or unpublished.</p>
        <Link to="/resources"><Button variant="hero">Back to Resources</Button></Link>
      </div>
    );
  }

  // Simple markdown-ish renderer: split by paragraphs, support ## headers and - bullets
  const renderContent = (text: string) => {
    const blocks = text.split(/\n\n+/);
    return blocks.map((block, i) => {
      if (block.startsWith('## ')) {
        return <h2 key={i} className="text-xl sm:text-2xl font-bold mt-8 mb-3 text-foreground">{block.replace(/^## /, '')}</h2>;
      }
      const lines = block.split('\n');
      if (lines.every(l => l.startsWith('- '))) {
        return (
          <ul key={i} className="list-disc pl-6 space-y-1 my-3 text-muted-foreground">
            {lines.map((l, j) => <li key={j}>{l.replace(/^- /, '')}</li>)}
          </ul>
        );
      }
      return <p key={i} className="text-muted-foreground leading-7 my-3">{block}</p>;
    });
  };

  return (
    <article className="bg-background min-h-screen">
      <SEO
        title={`${guide.title} — Machinery Ring Guide`}
        description={guide.description || `${guide.title} — a practical farming guide from Machinery Ring Nyandarua.`}
        path={`/guides/${guide.slug}`}
        ogType="article"
        image={guide.image_url || undefined}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: guide.title,
          description: guide.description || undefined,
          image: guide.image_url || undefined,
          author: { '@type': 'Organization', name: 'Machinery Ring Nyandarua' },
          publisher: { '@type': 'Organization', name: 'Machinery Ring Nyandarua', logo: { '@type': 'ImageObject', url: 'https://machringalliance.lovable.app/mrlogo.png' } },
          datePublished: guide.created_at,
          dateModified: guide.updated_at,
        }}
      />
      <div className="bg-white border-b">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14 lg:px-8">
          <Link to="/resources" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Resources
          </Link>
          <Badge variant="secondary" className="mb-3">{guide.category}</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{guide.title}</h1>
          {guide.description && <p className="mt-3 text-base sm:text-lg text-muted-foreground">{guide.description}</p>}
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{guide.read_time}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12 lg:px-8">
        {guide.image_url && (
          <img src={guide.image_url} alt={guide.title} className="w-full rounded-xl shadow mb-8" />
        )}
        <div className="prose prose-lg max-w-none">
          {renderContent(guide.content || 'Content coming soon.')}
        </div>
      </div>
    </article>
  );
};

export default GuideDetail;
