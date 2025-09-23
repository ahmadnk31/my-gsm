import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-accordion', '@radix-ui/react-alert-dialog', '@radix-ui/react-avatar', '@radix-ui/react-checkbox', '@radix-ui/react-collapsible', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-label', '@radix-ui/react-menubar', '@radix-ui/react-navigation-menu', '@radix-ui/react-popover', '@radix-ui/react-progress', '@radix-ui/react-radio-group', '@radix-ui/react-scroll-area', '@radix-ui/react-select', '@radix-ui/react-separator', '@radix-ui/react-slider', '@radix-ui/react-slot', '@radix-ui/react-switch', '@radix-ui/react-tabs', '@radix-ui/react-toast', '@radix-ui/react-toggle', '@radix-ui/react-toggle-group', '@radix-ui/react-tooltip'],
          'vendor-icons': ['lucide-react'],
          'vendor-utils': ['clsx', 'tailwind-merge', 'class-variance-authority'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-form': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-misc': ['sonner', 'date-fns', 'embla-carousel-react', 'vaul'],
          
          // Application chunks
          'pages-admin': [
            '/src/pages/AdminRepairs.tsx',
            '/src/pages/AdminAccessories.tsx', 
            '/src/pages/AdminTradeIn.tsx',
            '/src/pages/AdminOrders.tsx'
          ],
          'pages-main': [
            '/src/pages/Index.tsx',
            '/src/pages/Repairs.tsx',
            '/src/pages/Accessories.tsx',
            '/src/pages/Dashboard.tsx'
          ],
          'pages-secondary': [
            '/src/pages/About.tsx',
            '/src/pages/TradeIn.tsx',
            '/src/pages/Warranty.tsx',
            '/src/pages/Contact.tsx',
            '/src/pages/FAQ.tsx',
            '/src/pages/Support.tsx',
            '/src/pages/Shipping.tsx',
            '/src/pages/Returns.tsx',
            '/src/pages/Privacy.tsx',
            '/src/pages/Terms.tsx',
            '/src/pages/Cookies.tsx'
          ],
          'components-admin': [
            '/src/components/admin/RepairItemForm.tsx',
            '/src/components/admin/RepairItemsList.tsx',
            '/src/components/admin/HierarchicalAdmin.tsx',
            '/src/components/admin/DeviceCategoriesManager.tsx',
            '/src/components/admin/DeviceBrandsManager.tsx',
            '/src/components/admin/DeviceModelsManager.tsx',
            '/src/components/admin/DevicePartsManager.tsx',
            '/src/components/admin/QuoteRequestsManager.tsx',
            '/src/components/admin/BannerManagement.tsx'
          ]
        }
      }
    }
  }
}));
