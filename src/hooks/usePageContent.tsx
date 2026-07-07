import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PageSection {
  title: string | null;
  content: string | null;
  metadata: any;
}

export function usePageContent(pageSlug: string) {
  const [sections, setSections] = useState<Record<string, PageSection>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase
      .from('page_content')
      .select('section_key,title,content,metadata')
      .eq('page_slug', pageSlug)
      .then(({ data }) => {
        if (!mounted) return;
        const map: Record<string, PageSection> = {};
        (data || []).forEach((r: any) => {
          map[r.section_key] = { title: r.title, content: r.content, metadata: r.metadata || {} };
        });
        setSections(map);
        setLoading(false);
      });
    return () => { mounted = false; };
  }, [pageSlug]);

  const get = (key: string, fallback?: Partial<PageSection>): PageSection => {
    return sections[key] || { title: fallback?.title ?? null, content: fallback?.content ?? null, metadata: fallback?.metadata ?? {} };
  };
  const items = (key: string, fallback: any[] = []) => {
    const s = sections[key];
    const arr = s?.metadata?.items;
    return Array.isArray(arr) && arr.length ? arr : fallback;
  };

  return { sections, loading, get, items };
}
