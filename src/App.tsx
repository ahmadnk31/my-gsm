import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Repairs from "./pages/Repairs";
import Accessories from "./pages/Accessories";
import AccessoryProduct from "./pages/AccessoryProduct";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminRepairs from "./pages/AdminRepairs";
import AdminAccessories from "./pages/AdminAccessories";
import AdminTradeIn from "./pages/AdminTradeIn";
import NotFound from "./pages/NotFound";
import { SearchPage } from "@/components/SearchPage";

// New pages
import TradeIn from "./pages/TradeIn";
import Warranty from "./pages/Warranty";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Support from "./pages/Support";
import Shipping from "./pages/Shipping";
import Returns from "./pages/Returns";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/repairs" element={<Repairs />} />
              <Route path="/accessories" element={<Accessories />} />
              <Route path="/accessories/:categorySlug/:productSlug" element={<AccessoryProduct />} />
              <Route path="/accessories/:id" element={<AccessoryProduct />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
                                   <Route path="/admin/repairs" element={<AdminRepairs />} />
                     <Route path="/admin/accessories" element={<AdminAccessories />} />
                     <Route path="/admin/trade-in" element={<AdminTradeIn />} />
              <Route path="/search" element={<SearchPage />} />
              
              {/* Footer Links - New Pages */}
              <Route path="/trade-in" element={<TradeIn />} />
              <Route path="/warranty" element={<Warranty />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/support" element={<Support />} />
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/cookies" element={<Cookies />} />
              
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
