import React, { useState } from 'react';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Loader2 } from 'lucide-react';

const schema = z.object({
  email: z.string().trim().email('Please enter a valid email').max(255),
  name: z.string().trim().max(100).optional(),
});

interface Props {
  variant?: 'inline' | 'card';
}

export const NewsletterSignup: React.FC<Props> = ({ variant = 'card' }) => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, name });
    if (!parsed.success) {
      toast({ title: 'Invalid input', description: parsed.error.errors[0].message, variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: parsed.data.email, name: parsed.data.name || '' });
    setSubmitting(false);
    if (error) {
      if (error.code === '23505') {
        toast({ title: "You're already subscribed", description: 'Thanks for being with us!' });
        setEmail(''); setName('');
      } else {
        toast({ title: 'Subscription failed', description: error.message, variant: 'destructive' });
      }
    } else {
      toast({ title: 'Subscribed!', description: 'Thanks for joining our newsletter.' });
      setEmail(''); setName('');
    }
  };

  if (variant === 'inline') {
    return (
      <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-2 max-w-md w-full">
        <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="flex-1" />
        <Button type="submit" variant="hero" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Mail className="h-4 w-4 mr-2" /> Subscribe</>}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={subscribe} className="max-w-xl mx-auto mt-8 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input placeholder="Your name (optional)" value={name} onChange={e => setName(e.target.value)} />
        <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <Button type="submit" variant="hero" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
        Subscribe to Newsletter
      </Button>
    </form>
  );
};
