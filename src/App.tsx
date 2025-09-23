import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Layout } from "@/components/Layout";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Suspense, lazy } from "react";

// Immediate imports for critical pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy imports for pages
const Repairs = lazy(() => import("./pages/Repairs"));
const Accessories = lazy(() => import("./pages/Accessories"));
const AccessoryProduct = lazy(() => import("./pages/AccessoryProduct"));
const Cart = lazy(() => import("./pages/Cart"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const Orders = lazy(() => import("./pages/Orders"));
const OrderDetail = lazy(() => import("./pages/OrderDetail"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

// Admin pages - lazy loaded
const AdminRepairs = lazy(() => import("./pages/AdminRepairs"));
const AdminAccessories = lazy(() => import("./pages/AdminAccessories"));
const AdminTradeIn = lazy(() => import("./pages/AdminTradeIn"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));

// Other pages - lazy loaded
const About = lazy(() => import("./pages/About"));
const TradeIn = lazy(() => import("./pages/TradeIn"));
const Warranty = lazy(() => import("./pages/Warranty"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Support = lazy(() => import("./pages/Support"));
const Shipping = lazy(() => import("./pages/Shipping"));
const Returns = lazy(() => import("./pages/Returns"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Cookies = lazy(() => import("./pages/Cookies"));

// Components - lazy loaded
const SearchPage = lazy(() => import("@/components/SearchPage").then(module => ({ default: module.SearchPage })));

// Loading component for Suspense
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex items-center space-x-2">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="text-muted-foreground">Loading...</span>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Lazy-loaded pages with Suspense */}
              <Route path="/repairs" element={
                <Suspense fallback={<PageLoader />}>
                  <Repairs />
                </Suspense>
              } />
              <Route path="/accessories" element={
                <Suspense fallback={<PageLoader />}>
                  <Accessories />
                </Suspense>
              } />
              <Route path="/accessories/product" element={
                <Suspense fallback={<PageLoader />}>
                  <AccessoryProduct />
                </Suspense>
              } />
              <Route path="/cart" element={
                <Suspense fallback={<PageLoader />}>
                  <Cart />
                </Suspense>
              } />
              <Route path="/wishlist" element={
                <Suspense fallback={<PageLoader />}>
                  <Wishlist />
                </Suspense>
              } />
              <Route path="/checkout" element={
                <Suspense fallback={<PageLoader />}>
                  <Checkout />
                </Suspense>
              } />
              <Route path="/orders" element={
                <Suspense fallback={<PageLoader />}>
                  <Orders />
                </Suspense>
              } />
              <Route path="/orders/:orderId" element={
                <Suspense fallback={<PageLoader />}>
                  <OrderDetail />
                </Suspense>
              } />
              <Route path="/order-confirmation" element={
                <Suspense fallback={<PageLoader />}>
                  <OrderConfirmation />
                </Suspense>
              } />
              <Route path="/dashboard" element={
                <Suspense fallback={<PageLoader />}>
                  <Dashboard />
                </Suspense>
              } />
              <Route path="/about" element={
                <Suspense fallback={<PageLoader />}>
                  <About />
                </Suspense>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin/repairs" element={
                <Suspense fallback={<PageLoader />}>
                  <AdminRepairs />
                </Suspense>
              } />
              <Route path="/admin/accessories" element={
                <Suspense fallback={<PageLoader />}>
                  <AdminAccessories />
                </Suspense>
              } />
              <Route path="/admin/trade-in" element={
                <Suspense fallback={<PageLoader />}>
                  <AdminTradeIn />
                </Suspense>
              } />
              <Route path="/admin/orders" element={
                <Suspense fallback={<PageLoader />}>
                  <AdminOrders />
                </Suspense>
              } />
              
              <Route path="/search" element={
                <Suspense fallback={<PageLoader />}>
                  <SearchPage />
                </Suspense>
              } />
              
              {/* Footer Links - New Pages */}
              <Route path="/trade-in" element={
                <Suspense fallback={<PageLoader />}>
                  <TradeIn />
                </Suspense>
              } />
              <Route path="/warranty" element={
                <Suspense fallback={<PageLoader />}>
                  <Warranty />
                </Suspense>
              } />
              <Route path="/contact" element={
                <Suspense fallback={<PageLoader />}>
                  <Contact />
                </Suspense>
              } />
              <Route path="/faq" element={
                <Suspense fallback={<PageLoader />}>
                  <FAQ />
                </Suspense>
              } />
              <Route path="/support" element={
                <Suspense fallback={<PageLoader />}>
                  <Support />
                </Suspense>
              } />
              <Route path="/shipping" element={
                <Suspense fallback={<PageLoader />}>
                  <Shipping />
                </Suspense>
              } />
              <Route path="/returns" element={
                <Suspense fallback={<PageLoader />}>
                  <Returns />
                </Suspense>
              } />
              <Route path="/privacy" element={
                <Suspense fallback={<PageLoader />}>
                  <Privacy />
                </Suspense>
              } />
              <Route path="/terms" element={
                <Suspense fallback={<PageLoader />}>
                  <Terms />
                </Suspense>
              } />
              <Route path="/cookies" element={
                <Suspense fallback={<PageLoader />}>
                  <Cookies />
                </Suspense>
              } />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
