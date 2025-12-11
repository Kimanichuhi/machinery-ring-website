import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Calendar, Clock, User, ArrowRight } from 'lucide-react';

const blogPosts = [
  {
    id: 1,
    title: 'Maximizing Maize Yields with Modern Farming Techniques',
    excerpt: 'Learn how to increase your maize production by up to 40% using precision agriculture and improved seed varieties.',
    author: 'Dr. Jane Wanjiku',
    date: '2024-01-15',
    readTime: '8 min read',
    category: 'Crop Production',
    image: '/placeholder.svg',
    featured: true
  },
  {
    id: 2,
    title: 'Sustainable Farming Practices for Small-holder farmers in Kenya',
    excerpt: 'Discover eco-friendly farming methods that protect the environment while maintaining high productivity.',
    author: 'Prof. Samuel Kariuki',
    date: '2024-01-12',
    readTime: '12 min read',
    category: 'Sustainability',
    image: '/placeholder.svg',
    featured: false
  },
  {
    id: 3,
    title: 'Water Conservation Strategies for Dry Season Farming',
    excerpt: 'Effective irrigation techniques and water management systems to keep your crops thriving during drought.',
    author: 'Mary Njeri',
    date: '2024-01-10',
    readTime: '6 min read',
    category: 'Water Management',
    image: '/placeholder.svg',
    featured: false
  },
  {
    id: 4,
    title: 'Market Trends: Best Crops to Grow in 2024',
    excerpt: 'Analysis of market demand and pricing trends to help you choose the most profitable crops for this season.',
    author: 'John Kiprotich',
    date: '2024-01-08',
    readTime: '10 min read',
    category: 'Market Analysis',
    image: '/placeholder.svg',
    featured: true
  },
  {
    id: 5,
    title: 'Organic Pest Control Methods That Actually Work',
    excerpt: 'Natural and effective ways to protect your crops from pests without harmful chemicals.',
    author: 'Grace Muthoni',
    date: '2024-01-05',
    readTime: '7 min read',
    category: 'Plant Health',
    image: '/placeholder.svg',
    featured: false
  },
  {
    id: 6,
    title: 'Success Story: From 1 Acre to 50 Acres in 5 Years',
    excerpt: 'How Peter Mwangi scaled his farming operation using smart planning and agricultural technology.',
    author: 'Editorial Team',
    date: '2024-01-03',
    readTime: '5 min read',
    category: 'Success Stories',
    image: '/placeholder.svg',
    featured: false
  }
];

const categories = ['All Posts', 'Crop Production', 'Sustainability', 'Water Management', 'Market Analysis', 'Plant Health', 'Success Stories'];

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Posts');

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Posts' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Agricultural Blog
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              Stay informed with the latest farming techniques, market insights, and success stories 
              from agricultural experts and fellow farmers.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        {/* Search and Filter */}
        <div className="mb-12 flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "hero" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-8">Featured Articles</h2>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="product-card overflow-hidden">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="default" className="bg-accent text-accent-foreground">
                        Featured
                      </Badge>
                      <Badge variant="secondary">{post.category}</Badge>
                    </div>
                    <CardTitle className="text-xl font-bold leading-tight">
                      {post.title}
                    </CardTitle>
                    <p className="text-muted-foreground mt-2">{post.excerpt}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(post.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full" variant="hero">
                      Read Article
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Regular Posts */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-8">Latest Articles</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {regularPosts.map((post) => (
              <Card key={post.id} className="product-card group">
                <div className="aspect-video overflow-hidden rounded-t-xl">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader className="pb-3">
                  <Badge variant="secondary" className="w-fit mb-2">
                    {post.category}
                  </Badge>
                  <CardTitle className="text-lg font-bold leading-tight">
                    {post.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    Read More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Load More */}
        <div className="mt-12 text-center">
          <Button variant="outline" size="lg">
            Load More Articles
          </Button>
        </div>
      </div>

      {/* Newsletter CTA */}
      <div className="bg-primary py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Never Miss an Update
            </h2>
            <p className="mt-6 text-lg leading-8 text-primary-foreground/90 max-w-2xl mx-auto">
              Subscribe to our newsletter and get the latest farming insights, tips, and news 
              delivered directly to your inbox.
            </p>
            <div className="mt-10">
              <Button size="lg" variant="secondary">
                Subscribe Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;