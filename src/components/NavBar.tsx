// src/components/NavBar.tsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ShoppingCart } from "lucide-react";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Marketplace", href: "/marketplace" },
  { name: "Services", href: "/services" },
  { name: "Gallery", href: "/gallery" },
  { name: "Resources", href: "/resources" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function NavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img src="/mrlogo.png" alt="Logo" className="h-10 w-auto object-contain" />
          <span className="font-semibold text-lg">Machinery Ring</span>
        </Link>

        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`text-sm font-medium ${
                isActive(item.href) ? "text-primary" : "text-gray-600 hover:text-primary"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex lg:items-center lg:space-x-3">
          <Button variant="ghost" size="sm">
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="lg:hidden ml-auto">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-72">
            <div className="flex flex-col space-y-6 p-4">
              <div className="flex items-center gap-3 mb-4">
                <img src="/mrlogo.png" alt="Logo" className="h-10 w-auto object-contain" />
                <span className="font-semibold text-lg">Machinery Ring</span>
              </div>

              <nav className="space-y-3">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-gray-700 font-medium text-lg"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}

export default NavBar;
