import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ImageIcon, Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Gallery = () => {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      const { data } = await supabase.from('gallery_images').select('*').order('sort_order');
      setImages(data || []);
      setLoading(false);
    };
    fetchImages();
  }, []);

  const selectedImage = selectedIndex !== null ? images[selectedIndex] : null;

  const goNext = () => {
    if (selectedIndex !== null && selectedIndex < images.length - 1) setSelectedIndex(selectedIndex + 1);
  };
  const goPrev = () => {
    if (selectedIndex !== null && selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') setSelectedIndex(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedIndex, images.length]);

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
            {images.map((image, index) => (
              <Card
                key={image.id}
                className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow duration-300"
                onClick={() => setSelectedIndex(index)}
              >
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

      {/* Lightbox Modal */}
      <Dialog open={selectedIndex !== null} onOpenChange={(open) => !open && setSelectedIndex(null)}>
        <DialogContent className="max-w-4xl w-[95vw] p-0 bg-background border-none overflow-hidden [&>button]:hidden">
          {selectedImage && (
            <div className="relative">
              {/* Close button */}
              <button
                onClick={() => setSelectedIndex(null)}
                className="absolute top-3 right-3 z-10 rounded-full bg-background/80 p-2 text-foreground hover:bg-background transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Navigation */}
              {selectedIndex! > 0 && (
                <button
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/80 p-2 text-foreground hover:bg-background transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}
              {selectedIndex! < images.length - 1 && (
                <button
                  onClick={goNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/80 p-2 text-foreground hover:bg-background transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}

              {/* Image */}
              <div className="flex items-center justify-center bg-muted/30 max-h-[70vh]">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  className="max-h-[70vh] w-full object-contain"
                />
              </div>

              {/* Title & Description */}
              {(selectedImage.title || selectedImage.description) && (
                <div className="p-4 sm:p-6">
                  {selectedImage.title && (
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground">{selectedImage.title}</h3>
                  )}
                  {selectedImage.description && (
                    <p className="mt-2 text-sm sm:text-base text-muted-foreground">{selectedImage.description}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

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