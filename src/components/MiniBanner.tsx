import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Star, Gift, Sparkles, Percent, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface MiniSingleBanner {
  id: string;
  type: 'promotion' | 'announcement' | 'feature' | 'seasonal';
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundColor: string;
  textColor: string;
}

interface MiniBannerProps {
  banner: MiniSingleBanner;
  onClose?: () => void;
  showCloseButton?: boolean;
  className?: string;
}

// Helper function for mini banner icons
const getMiniIcon = (type: string) => {
  const iconMap = {
    promotion: <Percent className="h-4 w-4" />,
    feature: <Sparkles className="h-4 w-4" />,
    announcement: <Bell className="h-4 w-4" />,
    seasonal: <Gift className="h-4 w-4" />,
  };
  
  return iconMap[type as keyof typeof iconMap] || <Star className="h-4 w-4" />;
};

export const MiniBanner: React.FC<MiniBannerProps> = ({
  banner,
  onClose,
  showCloseButton = false,
  className = ""
}) => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div className={`relative ${className}`}>
      <div 
        className={`relative overflow-hidden rounded-2xl ${banner.backgroundColor} ${banner.textColor} p-4 lg:p-6 group hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl`}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-white/10" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/5 to-transparent" />

        {/* Close Button */}
        {showCloseButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute top-2 right-2 z-20 text-current hover:bg-white/20 rounded-full p-1.5 h-auto w-auto"
          >
            <X className="h-3 w-3" />
          </Button>
        )}

        {/* Content */}
        <div className="relative z-10 flex items-center gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              {getMiniIcon(banner.type)}
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            {banner.subtitle && (
              <Badge className="bg-white/20 text-current border-white/30 text-xs mb-2">
                {banner.subtitle}
              </Badge>
            )}
            <h3 className="font-bold text-lg lg:text-xl leading-tight truncate">
              {banner.title}
            </h3>
          </div>

          {/* CTA */}
          {banner.buttonText && banner.buttonLink && (
            <div className="flex-shrink-0">
              <Button
                asChild
                size="sm"
                className="bg-white/90 hover:bg-white text-gray-900 font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
              >
                <a href={banner.buttonLink} className="flex items-center gap-2 text-sm">
                  <span className="hidden sm:inline">{banner.buttonText}</span>
                  <ArrowRight className="h-3 w-3" />
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MiniBanner;
