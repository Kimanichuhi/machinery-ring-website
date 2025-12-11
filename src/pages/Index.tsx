import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Leaf, Users, TrendingUp, Award, ShoppingCart, Wrench, BookOpen } from 'lucide-react';
import heroImage from '@/assets/herobg.jpg';
import productsImage from '@/assets/productDisplay.jpg';

// Features
const features = [
  { name: 'Quality Agricultural Inputs', description: 'Premium seeds, fertilizers, and farming tools from trusted suppliers across Kenya.', icon: Leaf, color: 'text-green-600' },
  { name: 'Expert Farm Services', description: 'Professional consultancy, soil testing, and irrigation setup by certified agricultural experts.', icon: Wrench, color: 'text-blue-600' },
  { name: 'Educational Resources', description: 'Comprehensive guides, seasonal tips, and best practices for sustainable farming.', icon: BookOpen, color: 'text-purple-600' },
  { name: 'Community Marketplace', description: 'Connect with fellow farmers, buy and sell produce, and access local agricultural markets.', icon: Users, color: 'text-orange-600' },
];

// Stats
const stats = [
  { name: 'Active Farmers', value: '5,000+', icon: Users },
  { name: 'Products Listed', value: '1,200+', icon: ShoppingCart },
  { name: 'Expert Services', value: '50+', icon: Award },
  { name: 'Yield Improvement', value: '35%', icon: TrendingUp },
];

// Testimonials duplicated to 10
const baseTestimonials = [
  { content: 'Through the capacity building workshops, I learned about climate-smart farming and financial management — very practical lessons.', author: "Paul Wachanga", role: "Smallholder Farmer", location: "Matura MR" },
  { content: 'Before I started using lime supplied by Machinery Ring, my soil was too acidic, and my potato yields kept dropping every season. After proper soil testing and lime application guidance from the team, my yields have more than doubled!', author: "Martin Macharia", role: "Potato Farmer", location: "Weru MR" },
  { content: 'Mechanization has made farming easier for me as a woman. The team is professional and the machines are always in good condition. My maize yields have greatly improved.', author: "Faith Wanjiku", role: "Maize Farmer", location: "Rurii MR" },
];
const testimonials = Array(4).fill(baseTestimonials).flat().slice(0, 10);

// Sliding Testimonials Component with hover pause
const TestimonialsSlider = () => {
  const [index, setIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (isHovering) return;
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovering]);

  const currentTestimonials = [
    testimonials[index],
    testimonials[(index + 1) % testimonials.length]
  ];

  return (
    <section
      className="bg-muted/50 py-16 sm:py-24"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
            Trusted by Farmers Across Kenya
          </h2>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-muted-foreground">
            See how Machinery Ring is helping farmers achieve better yields and sustainable growth.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 transition-transform duration-700 ease-in-out">
          {currentTestimonials.map((testimonial, i) => (
            <Card key={i} className="product-card h-full shadow-md">
              <CardContent className="pt-6 p-4 sm:p-6">
                <blockquote className="text-base sm:text-lg text-muted-foreground italic">
                  "{testimonial.content}"
                </blockquote>
                <div className="mt-4 sm:mt-6">
                  <div className="font-semibold text-foreground">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  <div className="text-sm text-primary">{testimonial.location}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Full Index Page
const Index = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Agricultural landscape in Kenya" className="h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-24 lg:px-8 lg:py-40">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-white animate-fade-in">
              Smart Farming, Better Yields
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-white/90 animate-slide-up">
              Connect with quality agricultural inputs, expert services, and a thriving community of farmers across Kenya. Transform your farming with Machinery Ring.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-scale-in">
              <Link to="/marketplace">
                <Button size="lg" variant="hero" className="w-full sm:w-auto">
                  Explore Marketplace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/services">
                <Button variant="hero-outline" size="lg" className="w-full sm:w-auto border-white text-white">
                  Our Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.name} className="text-center">
                <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary">
                  <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <p className="mt-3 sm:mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-primary">{stat.value}</p>
                <p className="text-xs sm:text-sm leading-6 text-muted-foreground">{stat.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              Everything You Need for Successful Farming
            </h2>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-muted-foreground">
              From premium inputs to expert guidance, we provide comprehensive solutions for modern agricultural practices.
            </p>
          </div>
          <div className="mx-auto mt-12 sm:mt-16 lg:mt-24 max-w-2xl lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 sm:gap-y-16 lg:max-w-none lg:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                    <feature.icon className={`h-5 w-5 flex-none ${feature.color}`} />
                    {feature.name}
                  </dt>
                  <dd className="mt-3 sm:mt-4 flex flex-auto flex-col text-sm sm:text-base leading-7 text-muted-foreground">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Products Showcase */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 sm:gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center">
            <div className="lg:pr-8">
              <div className="lg:max-w-lg">
                <Badge variant="secondary" className="mb-4">Featured Products</Badge>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                  Premium Agricultural Products
                </h2>
                <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-muted-foreground">
                  Discover our carefully curated selection of seeds, fertilizers, tools, and fresh produce from verified suppliers across Kenya.
                </p>
                <div className="mt-6 sm:mt-8">
                  <Link to="/marketplace">
                    <Button variant="hero">
                      Browse All Products
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src={productsImage}
                alt="Fresh agricultural products"
                className="w-full rounded-xl shadow-xl ring-1 ring-gray-400/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sliding Testimonials */}
      <TestimonialsSlider />

      {/* CTA Section */}
      <section className="bg-primary py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Ready to Transform Your Farming?
            </h2>
            <p className="mx-auto mt-4 sm:mt-6 max-w-xl text-base sm:text-lg leading-7 sm:leading-8 text-primary-foreground/90">
              Join thousands of farmers who are already using Machinery Ring to improve their yields and grow their agricultural business.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/marketplace">
                <Button size="lg" variant="secondary">
                  Start Shopping
                </Button>
              </Link>
              <Link to="/services">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  Book Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
