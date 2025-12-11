import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ImageIcon } from 'lucide-react';

// Generate 50 placeholder slots for images
const galleryImages = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  src: '', // Leave blank for user to add their own images
  alt: `Gallery image ${i + 1}`,
}));

const Gallery = () => {
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
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

      {/* Gallery Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {galleryImages.map((image) => (
            <Card 
              key={image.id} 
              className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow duration-300"
            >
              <CardContent className="p-0">
                <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
                  {image.src ? (
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground p-2">
                      <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 mb-1 sm:mb-2" />
                      <span className="text-xs text-center">Image {image.id}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Info Section */}
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
