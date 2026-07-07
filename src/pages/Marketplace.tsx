import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ShoppingCart, MapPin, Star, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Hardcoded fallback products
const fallbackProducts = [
  { id: '1', name: 'Certified Maize Seeds(628,6213,DK777,629)', category: 'Seeds', price: 310, unit: 'per kg', location: 'Olkalou', rating: 4.8, stock: 600, image_url: '/maize.jpg', tags: ['hybrid', 'drought-resistant'] },
  { id: '2', name: 'Beans Seed (Nyota)', category: 'Seeds', price: 150, unit: 'per kg', location: 'Ol Kalou', rating: 4.6, stock: 100, image_url: '/placeholder.svg', tags: ['Disease Resistant', 'Immune'] },
  { id: '3', name: 'Potato (Markies)', category: 'Seeds', price: 2000, unit: 'per 50kg', location: 'Ol Kalou', rating: 5.6, stock: 50, image_url: '/placeholder.svg', tags: ['Disease Resistant', 'Productive'] },
  { id: '4', name: 'Potato (Shangi)', category: 'Seeds', price: 1800, unit: 'per 50kg', location: 'Ol Kalou', rating: 6.6, stock: 100, image_url: '/placeholder.svg', tags: ['Disease Resistant', 'Productive'] },
  { id: '5', name: 'Potato (Wanjiku)', category: 'Seeds', price: 1700, unit: 'per 50kg', location: 'Ol Kalou', rating: 5.6, stock: 100, image_url: '/placeholder.svg', tags: ['Disease Resistant', 'Productive'] },
  { id: '6', name: 'Potato (Unica)', category: 'Seeds', price: 1800, unit: 'per 50kg', location: 'Ol Kalou', rating: 6.6, stock: 100, image_url: '/placeholder.svg', tags: ['local-variety', 'Productive'] },
  { id: '7', name: 'Lime', category: 'Fertilizer', price: 1600, unit: 'per 50kg bag', location: 'Olkalou', rating: 4.6, stock: 25, image_url: '/placeholder.svg', tags: ['organic', 'Friendly'] },
  { id: '8', name: 'DAP', category: 'Fertilizer', price: 6000, unit: 'per 50kg bag', location: 'Ol Kalou', rating: 4.6, stock: 25, image_url: '/placeholder.svg', tags: ['organic', 'On Offer'] },
  { id: '9', name: 'CAN', category: 'Fertilizer', price: 3000, unit: 'per 50kg bag', location: 'Olkalou', rating: 4.6, stock: 25, image_url: '/placeholder.svg', tags: ['organic', 'Effective'] },
  { id: '10', name: 'Urea', category: 'Fertilizer', price: 3000, unit: 'per 50kg bag', location: 'Ol Kalou', rating: 4.6, stock: 30, image_url: '/placeholder.svg', tags: ['organic', 'Effective'] },
  { id: '11', name: 'Foliar', category: 'Fertilizer', price: 2000, unit: 'per 50kg bag', location: 'Olkalou', rating: 4.6, stock: 25, image_url: '/placeholder.svg', tags: ['organic', 'Spray'] },
  { id: '12', name: 'Knapsack Sprayer', category: 'Tools', price: 3500, unit: 'each', location: 'Nyandarua', rating: 4.9, stock: 12, image_url: '/placeholder.svg', tags: ['manual', 'durable'] },
  { id: '13', name: 'Motorised Sprayer', category: 'Tools', price: 1000, unit: 'Per each Acre', location: 'Olkalou', rating: 4.9, stock: 12, image_url: '/placeholder.svg', tags: ['manual', 'durable'] },
  { id: '14', name: 'Actifeeds', category: 'Animal Feeds', price: 650, unit: 'per kg', location: 'Olkalou', rating: 5.5, stock: 200, image_url: '/placeholder.svg', tags: ['convinient', 'organic'] },
  { id: '15', name: 'Silage Bales', category: 'Animal Feeds', price: 700, unit: 'per 50kg', location: 'Olkalou', rating: 6.7, stock: 30, image_url: '/silage.jpg', tags: ['high-yield', 'Organic'] },
  { id: '16', name: 'Fungicide', category: 'Agrochemicals', price: 400, unit: 'per litre', location: 'Olkalou', rating: 4.8, stock: 50, image_url: '/placeholder.svg', tags: ['efficient', 'Productive'] },
  { id: '17', name: 'Herbicides', category: 'Agrochemicals', price: 400, unit: 'per litre', location: 'Olkalou', rating: 4.8, stock: 50, image_url: '/placeholder.svg', tags: ['efficient', 'Productive'] },
  { id: '18', name: 'Insecticides', category: 'Agrochemicals', price: 500, unit: 'per litre', location: 'Olkalou', rating: 4.8, stock: 50, image_url: '/placeholder.svg', tags: ['efficient', 'Productive'] },
];

const categories = ['All', 'Seeds', 'Fertilizer', 'Tools', 'Produce', 'Agrochemicals', 'Animal Feeds'];

const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [products, setProducts] = useState<any[]>(fallbackProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setProducts(data);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.tags || []).some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-background min-h-screen">
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              Agricultural Marketplace
            </h1>
            <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-muted-foreground px-4">
              Discover quality seeds, tools, fertilizers, and fresh produce from verified suppliers
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 lg:px-8">
        <div className="mb-6 sm:mb-8 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (<SelectItem key={category} value={category}>{category}</SelectItem>))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Sort by" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mb-4 sm:mb-6">
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading...' : `Showing ${filteredProducts.length} of ${products.length} products`}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="product-card group">
              <div className="relative aspect-square overflow-hidden rounded-t-xl bg-muted">
                <img
                  src={product.image_url || '/placeholder.svg'}
                  alt={product.name}
                  className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
                {product.description && (
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                    <p className="text-white font-semibold text-sm line-clamp-1">{product.name}</p>
                    <p className="text-white/90 text-xs line-clamp-3 mt-1">{product.description}</p>
                  </div>
                )}
              </div>
              <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Badge variant="secondary" className="mb-2 text-xs">{product.category}</Badge>
                    <CardTitle className="text-sm sm:text-base font-semibold leading-tight line-clamp-2">{product.name}</CardTitle>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-xs sm:text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" /><span>{product.location}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0 p-3 sm:p-4 sm:pt-0">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div>
                    <p className="text-base sm:text-lg font-bold text-primary">KES {Number(product.price).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{product.unit}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">{product.rating}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
                  {(product.tags || []).slice(0, 2).map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm text-muted-foreground">{product.stock} in stock</span>
                  <Button size="sm" variant="hero" className="text-xs sm:text-sm">
                    <ShoppingCart className="h-3 w-3 mr-1" /> Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 sm:mt-12 text-center">
          <Button variant="outline" size="lg">Load More Products</Button>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
