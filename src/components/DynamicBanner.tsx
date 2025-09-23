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
    <div className="relative w-full h-auto lg:h-[500px] xl:h-[600px] banner-container">
      {/* Modern Professional Banner Container - Now properly contained */}
      <div 
        className={`relative overflow-hidden h-full w-full bg-white shadow-xl border border-gray-100 rounded-2xl lg:rounded-3xl group`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Clean Professional Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-10 left-10 w-24 h-24 bg-blue-100 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-32 h-32 bg-orange-100 rounded-full blur-3xl" />
          </div>
        </div>

        {/* Close Button - Professional Style adapted for mobile background */}
        {showCloseButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute top-6 right-6 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm lg:bg-white/80 lg:hover:bg-white text-white lg:text-gray-500 lg:hover:text-gray-700 rounded-full p-2.5 transition-all duration-300 border border-white/20 lg:border-gray-200"
          >
            <X className="h-5 w-5" />
          </Button>
        )}

        {/* Professional Content Layout */}
        <div className="relative z-20 h-full flex items-stretch">
          <div className="flex flex-col lg:flex-row w-full h-full">
            
            {/* Left Content - Professional Text Section */}
            <div className="flex-1 flex items-center justify-start p-8 lg:p-12 xl:p-16 min-h-[400px] lg:min-h-full relative">
              {/* Mobile Background Image Overlay */}
              {currentBanner.image && (
                <div className="absolute inset-0 lg:hidden">
                  <img 
                    src={currentBanner.image} 
                    alt={currentBanner.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50" />
                </div>
              )}
              
              <div className="space-y-6 lg:space-y-8 max-w-lg relative z-10">
                
                {/* Professional Header */}
                <div className="space-y-2">
                  {currentBanner.subtitle && (
                    <p className="text-sm font-medium text-white lg:text-gray-500 uppercase tracking-wide">
                      {currentBanner.subtitle}
                    </p>
                  )}
                  
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white lg:text-gray-900 banner-title">
                    {currentBanner.title}
                  </h1>
                </div>

                {/* Professional Description */}
                <p className="text-lg lg:text-xl text-white/90 lg:text-gray-600 leading-relaxed banner-description" 
                   style={{ animationDelay: '0.2s' }}>
                  {currentBanner.description}
                </p>

                {/* Professional Date Display */}
                {(currentBanner.startDate || currentBanner.endDate) && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 p-4 bg-white/10 lg:bg-gray-50 rounded-xl border border-white/20 lg:border-gray-200 banner-description" 
                       style={{ animationDelay: '0.4s' }}>
                    {currentBanner.startDate && (
                      <div className="flex items-center gap-2 text-white/80 lg:text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm font-medium">Starts: {currentBanner.startDate.toLocaleDateString()}</span>
                      </div>
                    )}
                    {currentBanner.endDate && (
                      <div className="flex items-center gap-2 text-white/80 lg:text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">Ends: {currentBanner.endDate.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Professional CTA Button */}
                {currentBanner.buttonText && currentBanner.buttonLink && (
                  <div className="pt-4 banner-button" style={{ animationDelay: '0.6s' }}>
                    <Button
                      asChild
                      className="bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 lg:bg-gray-900 lg:hover:bg-gray-800 lg:text-white lg:border-gray-900 px-8 py-3 rounded-lg text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl banner-cta-button group"
                    >
                      <a href={currentBanner.buttonLink} className="flex items-center gap-3">
                        <span>{currentBanner.buttonText}</span>
                        <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Content - Professional Image Section (Hidden on Mobile) */}
            <div className="hidden lg:flex flex-1 relative h-64 sm:h-80 lg:h-full overflow-hidden lg:rounded-r-2xl">
              {currentBanner.image ? (
                <div className="relative w-full h-full banner-image" style={{ animationDelay: '0.8s' }}>
                  <img 
                    src={currentBanner.image} 
                    alt={currentBanner.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  
                  {/* Professional overlay */}
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white/10" />
                  
                  {/* Professional corner accent */}
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-black/20 to-transparent" />
                </div>
              ) : (
                // Professional placeholder with business theme
                <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 banner-image" 
                     style={{ animationDelay: '0.8s' }}>
                  <div className="relative">
                    {/* Professional icon presentation */}
                    <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                      <div className="text-4xl lg:text-5xl text-gray-600">
                        {bannerIconInfo.icon}
                      </div>
                    </div>
                    
                    {/* Floating professional elements */}
                    <div className="absolute -top-4 -right-4 w-6 h-6 bg-blue-200 rounded-full animate-pulse" />
                    <div className="absolute -bottom-4 -left-4 w-4 h-4 bg-orange-200 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Professional Navigation Controls */}
        {showNavigation && activeBanners.length > 1 && (
          <>
            {/* Clean Navigation Arrows - Adapted for mobile background */}
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPrevious}
              className="absolute left-6 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm lg:bg-white/80 lg:hover:bg-white text-white lg:text-gray-700 lg:hover:text-gray-900 rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 border border-white/20 lg:border-gray-200"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNext}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm lg:bg-white/80 lg:hover:bg-white text-white lg:text-gray-700 lg:hover:text-gray-900 rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 border border-white/20 lg:border-gray-200"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            {/* Professional Dots Indicator - Adapted for mobile background */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
              <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-md lg:bg-white/90 rounded-full px-6 py-3 shadow-lg border border-white/20 lg:border-gray-200">
                {activeBanners.map((banner, index) => (
                  <button
                    key={banner.id}
                    onClick={() => goToSlide(index)}
                    className={`relative transition-all duration-500 ${
                      index === currentIndex
                        ? 'w-8 h-3 bg-white lg:bg-gray-900 rounded-full'
                        : 'w-3 h-3 bg-white/60 hover:bg-white/80 lg:bg-gray-300 lg:hover:bg-gray-500 rounded-full hover:scale-125'
                    }`}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Clean Progress Indicator - Adapted for mobile background */}
        {autoSlide && !isPaused && activeBanners.length > 1 && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 lg:bg-gray-200 overflow-hidden">
            <div 
              className="h-full bg-white lg:bg-gray-900 transition-all duration-100 ease-linear"
              style={{
                width: `${((currentIndex + 1) / activeBanners.length) * 100}%`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicBanner;
