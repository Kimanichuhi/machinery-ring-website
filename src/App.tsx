import React, { Suspense, lazy } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/hooks/useCart";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DiagnosticsPanel } from "@/components/DiagnosticsPanel";
import { Loader2 } from "lucide-react";

const Index = lazy(() => import("./pages/Index"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const Services = lazy(() => import("./pages/Services"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail"));
const BookingForm = lazy(() => import("./pages/BookingForm"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Resources = lazy(() => import("./pages/Resources"));
const GuideDetail = lazy(() => import("./pages/GuideDetail"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Cart = lazy(() => import("./pages/Cart"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Admin = lazy(() => import("./pages/Admin"));
const Diagnostics = lazy(() => import("./pages/Diagnostics"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center animate-fade-in">
    <div className="flex flex-col items-center gap-3 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm">Loading…</p>
    </div>
  </div>
);

const PublicShell: React.FC = () => {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 animate-page-in">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/book/:id" element={<BookingForm mode="booking" />} />
            <Route path="/consultation" element={<BookingForm mode="consultation" />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/guides/:slug" element={<GuideDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ErrorBoundary>
        <CartProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Sonner />
            <Toaster />
            <DiagnosticsPanel />
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/admin" element={<Admin />} />
                <Route path="/diagnostics" element={<Diagnostics />} />
                <Route path="*" element={<PublicShell />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </CartProvider>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
