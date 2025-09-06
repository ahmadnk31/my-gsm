import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const routeLabels: Record<string, string> = {
  '': 'Home',
  'repairs': 'Repairs',
  'accessories': 'Accessories',
  'auth': 'Authentication',
  'dashboard': 'Dashboard',
  'admin': 'Admin',
  'admin/repairs': 'Repair Management',
  'admin/accessories': 'Accessories Management'
};

const routeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  '': Home
};

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: 'Home',
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
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground py-3 px-4 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex items-center space-x-1">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            const IconComponent = item.icon;
            
            return (
              <li key={item.href || item.label} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
                )}
                
                {isLast ? (
                  <span className="flex items-center font-medium text-foreground">
                    {IconComponent && <IconComponent className="h-4 w-4 mr-1" />}
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.href!}
                    className={cn(
                      "flex items-center hover:text-foreground transition-colors",
                      index === 0 && "text-primary hover:text-primary/80"
                    )}
                  >
                    {IconComponent && <IconComponent className="h-4 w-4 mr-1" />}
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};
