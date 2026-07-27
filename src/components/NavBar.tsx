import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ShoppingCart, User, LogOut, Package } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

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
  const [accountOpen, setAccountOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const { count } = useCart();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMobileMenuOpen(false);
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { setMobileMenuOpen(false); setAccountOpen(false); }, [location.pathname]);

  const signOut = async () => { await supabase.auth.signOut(); navigate("/"); };

  const CartBtn = (
    <Link to="/cart" className="relative inline-flex">
      <Button variant="ghost" size="sm" aria-label="Shopping cart" className="h-9 w-9 p-0">
        <ShoppingCart className="h-4 w-4" />
      </Button>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );

  const AccountBtn = (
    <div className="relative" ref={accountRef}>
      <Button variant="ghost" size="sm" className="h-9 w-9 p-0" aria-label="Account" onClick={() => setAccountOpen((o) => !o)}>
        <User className="h-4 w-4" />
      </Button>
      {accountOpen && (
        <div className="absolute right-0 top-11 w-44 rounded-lg border bg-background shadow-lg animate-fade-in z-50">
          {user ? (
            <>
              <div className="px-4 py-2 text-xs text-muted-foreground truncate border-b">{user.email}</div>
              <Link to="/orders" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"><Package className="h-4 w-4" /> My Orders</Link>
              <button onClick={signOut} className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted text-left"><LogOut className="h-4 w-4" /> Sign out</button>
            </>
          ) : (
            <>
              <Link to="/auth" className="block px-4 py-2 text-sm hover:bg-muted">Sign in</Link>
              <Link to="/auth" className="block px-4 py-2 text-sm hover:bg-muted">Create account</Link>
            </>
          )}
        </div>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img src="/mrlogo.png" alt="Machinery Ring Logo" className="h-10 w-auto object-contain" />
          <span className="font-semibold text-lg">Machinery Ring</span>
        </Link>

        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <Link key={item.name} to={item.href}
              className={`text-sm font-medium ${isActive(item.href) ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex lg:items-center lg:space-x-1">
          {CartBtn}
          {AccountBtn}
        </div>

        <div className="lg:hidden flex items-center gap-1" ref={menuRef}>
          {CartBtn}
          {AccountBtn}
          <div className="relative">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            {mobileMenuOpen && (
              <div className="absolute right-0 top-10 w-44 rounded-lg border bg-background shadow-lg animate-fade-in z-50">
                <nav className="flex flex-col py-2">
                  {navigation.map((item) => (
                    <Link key={item.name} to={item.href} onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${isActive(item.href) ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-primary hover:bg-muted"}`}>
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default NavBar;
