import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, ArrowRight, Star, Gift, Zap, Clock, Sparkles, Percent, Bell, Calendar, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useActiveBanners, type Banner as BannerType } from '@/hooks/useBanners';
import './banner-animations.css';

interface Banner {
  id: string;
  type: 'promotion' | 'announcement' | 'feature' | 'seasonal';
  title: string;
  subtitle?: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
  image?: string;
  backgroundColor: string;
  textColor: string;
  priority: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  icon?: React.ReactNode;
}

interface DynamicBannerProps {
  banners?: Banner[];
  autoSlide?: boolean;
  slideInterval?: number;
  showNavigation?: boolean;
  showCloseButton?: boolean;
  onClose?: () => void;
}

// Helper function to get icon for banner type with enhanced design
const getBannerIcon = (type: string) => {
  const iconMap = {
    promotion: { icon: <Percent className="h-5 w-5" />, bgColor: 'bg-gradient-to-br from-red-500 to-red-600' },
    feature: { icon: <Sparkles className="h-5 w-5" />, bgColor: 'bg-gradient-to-br from-blue-500 to-purple-600' },
    announcement: { icon: <Bell className="h-5 w-5" />, bgColor: 'bg-gradient-to-br from-green-500 to-emerald-600' },
    seasonal: { icon: <Gift className="h-5 w-5" />, bgColor: 'bg-gradient-to-br from-orange-500 to-pink-600' },
    default: { icon: <Star className="h-5 w-5" />, bgColor: 'bg-gradient-to-br from-indigo-500 to-purple-600' }
  };
  
  return iconMap[type as keyof typeof iconMap] || iconMap.default;
};

// Helper function to get banner type info
const getBannerTypeInfo = (type: string) => {
  const typeInfo = {
    promotion: { label: 'LIMITED OFFER', color: 'bg-red-500/90 text-white' },
    feature: { label: 'NEW FEATURE', color: 'bg-blue-500/90 text-white' },
    announcement: { label: 'ANNOUNCEMENT', color: 'bg-green-500/90 text-white' },
    seasonal: { label: 'SEASONAL', color: 'bg-orange-500/90 text-white' }
  };
  
  return typeInfo[type as keyof typeof typeInfo] || { label: 'FEATURED', color: 'bg-indigo-500/90 text-white' };
};

export const DynamicBanner: React.FC<DynamicBannerProps> = ({
  banners: propBanners,
  autoSlide = true,
  slideInterval = 5000,
  showNavigation = true,
  showCloseButton = true,
  onClose
}) => {
  const { t } = useLanguage();
  const { data: hookBanners, isLoading } = useActiveBanners();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Use prop banners or hook banners, convert hook banners to component format
  const banners = propBanners || (hookBanners ? hookBanners.map((banner: BannerType): Banner => ({
    id: banner.id,
    type: banner.type,
    title: banner.title,
    subtitle: banner.subtitle,
    description: banner.description,
    buttonText: banner.buttonText,
    buttonLink: banner.buttonLink,
    image: banner.image,
    backgroundColor: banner.backgroundColor,
    textColor: banner.textColor,
    priority: banner.priority,
    startDate: banner.startDate,
    endDate: banner.endDate,
    isActive: banner.isActive,
    icon: getBannerIcon(banner.type).icon,
  })) : []);

  // Filter active banners and sort by priority
  const activeBanners = banners
    .filter(banner => {
      if (!banner.isActive) return false;
      
      const now = new Date();
      if (banner.startDate && now < banner.startDate) return false;
      if (banner.endDate && now > banner.endDate) return false;
      
      return true;
    })
    .sort((a, b) => a.priority - b.priority);

  const currentBanner = activeBanners[currentIndex];

  // Auto slide functionality
  useEffect(() => {
    if (!autoSlide || isPaused || activeBanners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, slideInterval);

    return () => clearInterval(interval);
  }, [autoSlide, slideInterval, activeBanners.length, isPaused]);

  // Navigation functions
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible || !currentBanner || activeBanners.length === 0) {
    return null;
  }

  const bannerIconInfo = getBannerIcon(currentBanner.type);
  const typeInfo = getBannerTypeInfo(currentBanner.type);

  return (
    <div className="relative w-full h-auto lg:h-[600px] xl:h-[700px] banner-container">
      {/* Main Banner Container - Constant height on desktop, flexible on mobile */}
      <div 
        className={`relative overflow-hidden h-full w-full shadow-2xl ${currentBanner.backgroundColor} ${currentBanner.textColor} group banner-hover-scale banner-glow banner-${currentBanner.type}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Minimal Background Effects */}
        <div className="absolute inset-0">
          {/* Very subtle gradient overlay - only on text side */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-transparent lg:via-black/5 lg:to-transparent" />
          
          {/* Clean separator line between sections on desktop */}
          <div className="hidden lg:block absolute top-0 left-1/2 w-px h-full bg-white/10 transform -translate-x-1/2" />
          
          {/* Minimal floating elements - only on text side */}
          <div className="absolute inset-0 overflow-hidden opacity-20 lg:w-1/2">
            <div className="absolute top-1/4 left-1/6 w-1 h-1 bg-white/40 rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '2s', animationDuration: '6s' }} />
          </div>
        </div>

        {/* Close Button */}
        {showCloseButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute top-6 right-6 z-30 text-current hover:bg-white/20 rounded-full p-2 transition-all duration-300 hover:scale-110"
          >
            <X className="h-5 w-5" />
          </Button>
        )}

        {/* Banner Content */}
        <div className="relative z-20 h-auto lg:h-full flex items-center justify-center p-0">
          <div className="flex flex-col-reverse lg:flex-row items-stretch w-full h-auto lg:h-full">
            {/* Left Content - Text Section */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 xl:p-16 bg-gradient-to-br from-white/5 to-transparent min-h-[400px] lg:min-h-full">
              <div className="space-y-4 sm:space-y-6 lg:space-y-8 max-w-lg xl:max-w-xl">
                {/* Brand/Type Badge */}
                <div className="flex items-center gap-3">
                  {currentBanner.subtitle && (
                    <Badge className="bg-black/20 text-current border-white/30 px-3 py-1 text-xs font-medium">
                      {typeInfo.label}
                    </Badge>
                  )}
                </div>

                {/* Main Title - Apple Style */}
                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight tracking-tight">
                    {currentBanner.title}
                  </h1>
                  {currentBanner.subtitle && (
                    <p className="text-lg sm:text-xl lg:text-2xl text-current/80 font-light">
                      {currentBanner.subtitle}
                    </p>
                  )}
                </div>

                {/* Description */}
                <p className="text-base sm:text-lg lg:text-xl text-current/70 leading-relaxed font-light max-w-md">
                  {currentBanner.description}
                </p>

                {/* Start/End Date Display */}
                {(currentBanner.startDate || currentBanner.endDate) && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm sm:text-base text-current/60">
                    {currentBanner.startDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Starts: {currentBanner.startDate.toLocaleDateString()}</span>
                      </div>
                    )}
                    {currentBanner.endDate && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Ends: {currentBanner.endDate.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* CTA Button - Apple Style */}
                {currentBanner.buttonText && currentBanner.buttonLink && (
                  <div className="pt-4">
                    <Button
                      asChild
                      variant="outline"
                      className="bg-transparent border-white/30 text-current hover:bg-white/10 px-6 py-3 rounded-full text-base font-medium transition-all duration-300 hover:border-white/50"
                    >
                      <a href={currentBanner.buttonLink} className="flex items-center gap-2">
                        <span>{currentBanner.buttonText}</span>
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Content - Product Image Section (Full Height, No Background, No Padding) */}
            <div className="flex-1 relative flex items-stretch justify-stretch overflow-hidden lg:bg-transparent  sm:h-80 lg:h-full p-0 m-0">
              {currentBanner.image ? (
                <div className="relative w-full h-full flex items-stretch justify-stretch m-0 p-0">
                  {/* Main product image - Full height container */}
                  <img 
                    src={currentBanner.image} 
                    alt={currentBanner.title}
                    className="w-full h-full object-cover lg:object-contain relative z-10 m-0 p-0"
                    style={{ 
                      filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.15))',
                      objectPosition: 'center center'
                    }}
                  />
                  
                  {/* Subtle overlay for mobile only */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 lg:hidden" />
                </div>
              ) : (
                // Geometric placeholder when no image - Full height, no padding
                <div className="relative w-full h-full flex items-center justify-center m-0 p-0">
                  {/* Background geometric shapes - Full height */}
                  <div className="absolute inset-0 bg-white/5 lg:bg-white/10" />
                  <div className="absolute inset-2 bg-white/10 lg:bg-white/10 rounded-2xl rotate-12 transform" />
                  <div className="absolute inset-4 bg-white/15 lg:bg-white/20 rounded-xl -rotate-6 transform" />
                  <div className="absolute inset-6 bg-white/20 lg:bg-white/20 rounded-xl rotate-3 transform backdrop-blur-sm border border-white/20 flex items-center justify-center">
                    <div className="text-8xl lg:text-9xl text-white/40">
                      {bannerIconInfo.icon}
                    </div>
                  </div>
                  
                  {/* Floating elements - closer to edges */}
                  <div className="absolute top-4 right-4 w-4 h-4 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="absolute bottom-6 left-4 w-3 h-3 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
                  <div className="absolute top-1/3 left-2 w-2 h-2 bg-white/50 rounded-full animate-pulse" />
                  <div className="absolute bottom-1/4 right-2 w-2 h-2 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        {showNavigation && activeBanners.length > 1 && (
          <>
            {/* Navigation Arrows - Positioned to avoid image area */}
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPrevious}
              className="absolute left-4 lg:left-6 bottom-20 lg:top-1/2 lg:bottom-auto transform lg:-translate-y-1/2 z-30 text-current hover:bg-white/20 rounded-full p-3 transition-all duration-300 hover:scale-110"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNext}
              className="absolute right-4 lg:right-6 bottom-20 lg:top-1/2 lg:bottom-auto transform lg:-translate-y-1/2 z-30 text-current hover:bg-white/20 rounded-full p-3 transition-all duration-300 hover:scale-110"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>

            {/* Enhanced Dots Indicator - Better positioning */}
            <div className="absolute bottom-4 lg:bottom-6 left-1/2 transform -translate-x-1/2 z-30">
              <div className="flex items-center space-x-3 bg-black/30 backdrop-blur-md rounded-full px-4 lg:px-6 py-2 lg:py-3">
                {activeBanners.map((banner, index) => (
                  <button
                    key={banner.id}
                    onClick={() => goToSlide(index)}
                    className={`relative transition-all duration-300 ${
                      index === currentIndex
                        ? 'w-6 lg:w-8 h-2 lg:h-3 bg-white rounded-full shadow-lg'
                        : 'w-2 lg:w-3 h-2 lg:h-3 bg-white/50 hover:bg-white/70 rounded-full'
                    }`}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Enhanced Progress Bar */}
        {autoSlide && !isPaused && activeBanners.length > 1 && (
          <div className="absolute bottom-0 left-0 w-full h-1.5 bg-black/20 overflow-hidden banner-progress">
            <div 
              className="h-full bg-gradient-to-r from-white/70 via-white/90 to-white/70 transition-all duration-100 ease-linear relative"
              style={{
                width: `${((currentIndex + 1) / activeBanners.length) * 100}%`
              }}
            >
              <div className="absolute inset-0 bg-white/40 animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicBanner;
