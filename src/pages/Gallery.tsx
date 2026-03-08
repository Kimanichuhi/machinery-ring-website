import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Gallery = () => {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      const { data } = await supabase.from('gallery_images').select('*').order('sort_order');
      setImages(data || []);
      setLoading(false);
    };
    fetchImages();
  }, []);

  // Fill remaining slots to show 50 placeholders
  const placeholderCount = Math.max(0, 50 - images.length);

  return (
    <div className="bg-background min-h-screen">
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Photo Gallery
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-8 text-muted-foreground max-w-2xl mx-auto px-4">
              Explore our collection of images showcasing farming activities, products, and community events.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {images.map((image) => (
              <Card key={image.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-0">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {(image.title || image.description) && (
                    <div className="p-2 sm:p-3">
                      {image.title && <p className="font-medium text-xs sm:text-sm truncate text-foreground">{image.title}</p>}
                      {image.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{image.description}</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {Array.from({ length: placeholderCount }, (_, i) => (
              <Card key={`placeholder-${i}`} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    <div className="flex flex-col items-center text-muted-foreground p-2">
                      <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 mb-1" />
                      <span className="text-xs text-center">Image {images.length + i + 1}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="bg-muted/50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              More Photos Coming Soon
            </h2>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              We're continuously updating our gallery with new images from the field.
              Check back regularly for updates!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gallery;
