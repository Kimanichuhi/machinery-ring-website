import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { SEO } from '@/components/SEO';

const seasonalTips = [
  {
    season: 'Dry Season',
    title: 'Preparing for the Dry Season',
    tips: [
      'Install drip irrigation systems',
      'Mulch around plants to retain moisture',
      'Plant drought-resistant crop varieties',
      'Harvest rainwater during the wet season'
    ]
  },
  {
    season: 'Rainy Season',
    title: 'Making the Most of Rains',
    tips: [
      'Ensure proper drainage to prevent waterlogging',
      'Plant water-loving crops like rice and vegetables',
      'Apply organic fertilizers for better nutrient absorption',
      'Monitor for fungal diseases in humid conditions'
    ]
  },
  {
    season: 'Planting Season',
    title: 'Optimal Planting Practices',
    tips: [
      'Test soil pH and nutrient levels',
      'Use certified seeds from reputable suppliers',
      'Follow proper spacing recommendations',
      'Apply pre-planting fertilizers appropriately'
    ]
  }
];

const faqs = [
  { question: "What is the best time to plant maize in Kenya?", answer: "The best time to plant maize in Kenya is at the beginning of the long rains (March-May) and short rains (October-December). However, timing can vary by region, so consult local agricultural extension officers for specific guidance in your area." },
  { question: "How do I test my soil's pH level?", answer: "You can test soil pH using digital pH meters, pH test strips, or by sending samples to agricultural laboratories. For accurate results, we recommend professional soil testing services which also provide nutrient analysis and fertilizer recommendations." },
  { question: "What are the signs of nutrient deficiency in crops?", answer: "Common signs include yellowing leaves (nitrogen deficiency), purple-tinged leaves (phosphorus deficiency), brown leaf edges (potassium deficiency), and stunted growth. Different crops show different symptoms, so proper identification is important for treatment." },
  { question: "How often should I water my crops?", answer: "Watering frequency depends on crop type, soil type, weather conditions, and growth stage. Generally, most crops need water when the top 2-3 inches of soil are dry. Drip irrigation systems can help maintain consistent moisture levels." },
  { question: "What is integrated pest management (IPM)?", answer: "IPM is a holistic approach to pest control that combines biological, cultural, physical, and chemical methods. It focuses on prevention, monitoring, and using the least toxic methods first, only resorting to pesticides when necessary." },
  { question: "How can I improve my soil fertility naturally?", answer: "You can improve soil fertility by adding organic matter (compost, manure), practicing crop rotation, using cover crops, applying green manure, and maintaining proper soil pH. These methods enhance soil structure, water retention, and nutrient availability." }
];

const Resources = () => {
  const [activeTab, setActiveTab] = useState('guides');
  const [guides, setGuides] = useState<any[]>([]);
  const [loadingGuides, setLoadingGuides] = useState(true);

  useEffect(() => {
    supabase.from('guides').select('*').eq('is_published', true).order('sort_order')
      .then(({ data }) => { setGuides(data || []); setLoadingGuides(false); });
  }, []);

  return (
    <div className="bg-background min-h-screen">
      <SEO
        title="Farmer Resources — Guides, Seasonal Tips & FAQs | Machinery Ring"
        description="Practical farming guides, seasonal tips, and answers to common questions for smallholder and commercial farmers in Kenya."
        path="/resources"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map(f => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer },
          })),
        }}
      />
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">Farmer Resources</h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-8 text-muted-foreground max-w-2xl mx-auto px-4">
              Access comprehensive guides, seasonal tips, and expert knowledge to improve your farming practices and increase productivity.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-16 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="guides" className="text-xs sm:text-sm">Farming Guides</TabsTrigger>
            <TabsTrigger value="tips" className="text-xs sm:text-sm">Seasonal Tips</TabsTrigger>
            <TabsTrigger value="faq" className="text-xs sm:text-sm">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="guides" className="mt-6 sm:mt-8">
            {loadingGuides ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : guides.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No guides published yet. Check back soon.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                {guides.map((guide) => (
                  <Card key={guide.id} className="product-card flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge variant="secondary">{guide.category}</Badge>
                            {guide.is_popular && <Badge className="bg-accent text-accent-foreground">Popular</Badge>}
                          </div>
                          <CardTitle className="text-lg sm:text-xl font-bold">{guide.title}</CardTitle>
                          <p className="mt-2 text-sm sm:text-base text-muted-foreground">{guide.description}</p>
                        </div>
                        <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground flex-shrink-0 ml-2" />
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1"><Clock className="h-3 w-3" /><span>{guide.read_time}</span></div>
                      </div>
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <Link to={`/guides/${guide.slug}`}>
                        <Button className="w-full" variant="hero">
                          Read Guide<ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tips" className="mt-6 sm:mt-8">
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {seasonalTips.map((seasonal, index) => (
                <Card key={index} className="product-card">
                  <CardHeader>
                    <Badge variant="outline" className="w-fit mb-2">{seasonal.season}</Badge>
                    <CardTitle className="text-base sm:text-lg font-bold">{seasonal.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {seasonal.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start space-x-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="faq" className="mt-6 sm:mt-8">
            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left text-sm sm:text-base">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm sm:text-base">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="bg-muted/50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">Stay Updated with Latest Farming Tips</h2>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              Subscribe to our newsletter for seasonal farming advice, new resource updates, and expert insights delivered to your inbox.
            </p>
            <NewsletterSignup />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources;
