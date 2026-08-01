import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const navigation = {
  main: [
    { name: 'Marketplace', href: '/marketplace' },
    { name: 'Services', href: '/services' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Resources', href: '/resources' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ],
  services: [
    { name: 'Mechanization Services', href: '/services' },
    { name: 'Feed Formulation', href: '/services' },
    { name: 'Capacity Building', href: '/services' },
    { name: 'Agronomy Services', href: '/services' },
    { name: 'Soil Testing', href: '/services' },
    { name: 'Agrodealership Services', href: '/services' },
    { name: 'Agreggation and Marketing', href: '/services' },
  ],
  resources: [
    { name: 'Farming Guides', href: '/resources' },
    { name: 'Seasonal Tips', href: '/resources' },
    { name: 'FAQ', href: '/resources' },
    { name: 'Downloads', href: '/resources' },
  ],
  social: [
    { name: 'Facebook', href: '#', icon: Facebook },
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'Instagram', href: '#', icon: Instagram },
  ],
};

export function Footer() {
  return (
    <footer className="bg-muted border-t">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Company info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/mrlogo.png" alt="Machinery Ring" className="h-10 w-10 rounded-lg object-contain" />
              <span className="text-2xl font-bold text-primary">Machinery Ring - Nyandarua</span>
            </Link>
            <p className="text-sm leading-6 text-muted-foreground max-w-md">
              Smart farming solutions for Kenyan agriculture. We connect farmers with quality inputs, 
              expert services, and sustainable farming practices for better yields.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+254 741595086</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>nyandarua-mr@machineryring.org</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Nyandarua, Kenya</span>
              </div>
            </div>
          </div>

          {/* Navigation links */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-foreground">Navigation</h3>
                <ul className="mt-6 space-y-4">
                  {navigation.main.map((item) => (
                    <li key={item.name}>
                      <Link to={item.href} className="text-sm leading-6 text-muted-foreground hover:text-primary transition-colors">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-foreground">Services</h3>
                <ul className="mt-6 space-y-4">
                  {navigation.services.map((item) => (
                    <li key={item.name}>
                      <Link to={item.href} className="text-sm leading-6 text-muted-foreground hover:text-primary transition-colors">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-foreground">Resources</h3>
                <ul className="mt-6 space-y-4">
                  {navigation.resources.map((item) => (
                    <li key={item.name}>
                      <Link to={item.href} className="text-sm leading-6 text-muted-foreground hover:text-primary transition-colors">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-foreground">Follow Us</h3>
                <div className="mt-6 flex space-x-4">
                  {navigation.social.map((item) => (
                    <a key={item.name} href={item.href} className="text-muted-foreground hover:text-primary transition-colors">
                      <item.icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-border pt-8">
          <p className="text-xs leading-5 text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Machinery Ring - Nyandarua. All rights reserved. Smart farming, better yields.
          </p>
        </div>
      </div>
    </footer>
  );
}
