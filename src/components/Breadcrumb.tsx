import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const getRouteLabels = (t: (key: string) => string): Record<string, string> => ({
  '': t('common.home'),
  'repairs': t('nav.repairs'),
  'accessories': t('nav.accessories'),
  'auth': t('nav.signIn'),
  'dashboard': t('nav.dashboard'),
  'admin': t('nav.admin'),
  'admin/repairs': t('admin.repairManagement'),
  'admin/accessories': t('admin.accessoriesManagement'),
  'cart': t('nav.cart'),
  'wishlist': t('nav.wishlist'),
  'trade-in': t('nav.tradeIn'),
  'warranty': t('footer.warranty'),
  'contact': t('footer.contact'),
  'faq': t('footer.faq'),
  'support': t('footer.support'),
  'shipping': t('footer.shipping'),
  'returns': t('footer.returns'),
  'privacy': t('footer.privacy'),
  'terms': t('footer.terms'),
  'cookies': t('footer.cookies'),
});

const routeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  '': Home
};

export const Breadcrumb: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const routeLabels = getRouteLabels(t);
  
  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: t('common.home'),
      href: '/',
      icon: Home
    }
  ];

  let currentPath = '';
  for (const segment of pathSegments) {
    currentPath += `/${segment}`;
    const fullPath = currentPath.slice(1); // Remove leading slash for lookup
    const label = routeLabels[fullPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const icon = routeIcons[fullPath];
    
    breadcrumbItems.push({
      label,
      href: currentPath,
      icon
    });
  }

  // Don't show breadcrumb if we're on the home page
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav className="bg-muted/30 border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3">
          <ol className="flex items-center space-x-1 text-sm text-muted-foreground overflow-x-auto scrollbar-hide">
            {breadcrumbItems.map((item, index) => {
              const isLast = index === breadcrumbItems.length - 1;
              const IconComponent = item.icon;
              
              return (
                <li key={item.href || item.label} className="flex items-center flex-shrink-0">
                  {index > 0 && (
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 mx-1 sm:mx-2 text-muted-foreground flex-shrink-0" />
                  )}
                  
                  {isLast ? (
                    <span className="flex items-center font-medium text-foreground text-sm sm:text-base">
                      {IconComponent && <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />}
                      <span className="truncate max-w-[120px] sm:max-w-none">{item.label}</span>
                    </span>
                  ) : (
                    <Link
                      to={item.href!}
                      className={cn(
                        "flex items-center hover:text-foreground transition-colors text-sm sm:text-base",
                        index === 0 && "text-primary hover:text-primary/80"
                      )}
                    >
                      {IconComponent && <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />}
                      <span className="truncate max-w-[100px] sm:max-w-none">{item.label}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </nav>
  );
};
