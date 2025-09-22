import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noIndex?: boolean;
  canonical?: string;
}

const defaultSEO = {
  title: 'Blueprint Phone Zen - Premium Phone Repair & Accessories Store',
  description: 'Expert phone repair services and premium mobile accessories. Fast repairs, genuine parts, competitive prices. iPhone, Samsung, Google Pixel repair specialists with warranty.',
  keywords: 'phone repair, mobile repair, iPhone repair, Samsung repair, screen replacement, battery replacement, phone accessories, mobile store, device repair service',
  image: '/hero-phone.jpg',
  url: 'https://phoneHub.com',
  type: 'website',
  siteName: 'Blueprint Phone Zen',
  author: 'Blueprint Phone Zen Team'
};

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  siteName,
  author,
  publishedTime,
  modifiedTime,
  section,
  tags,
  noIndex = false,
  canonical
}) => {
  const { t, language } = useLanguage();
  
  // Get site name and tagline from translations
  const defaultSiteName = t('seo.siteName');
  const tagline = t('seo.tagline');
  
  const seo = {
    title: title ? `${title} | ${siteName || defaultSiteName}` : `${defaultSiteName} - ${tagline}`,
    description: description || t('seo.descriptions.home'),
    keywords: keywords || t('seo.keywords.home'),
    image: image || defaultSEO.image,
    url: url || defaultSEO.url,
    author: author || defaultSEO.author,
    siteName: siteName || defaultSiteName
  };

  // Convert relative image URLs to absolute
  const imageUrl = seo.image.startsWith('http') 
    ? seo.image 
    : `${window.location.origin}${seo.image}`;

  const canonicalUrl = canonical || seo.url;

  return (
    <Helmet htmlAttributes={{ lang: language }}>
      {/* Primary Meta Tags */}
      <title>{seo.title}</title>
      <meta name="title" content={seo.title} />
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords} />
      <meta name="author" content={seo.author} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={seo.title} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={seo.siteName} />
      <meta property="og:locale" content={language === 'nl' ? 'nl_NL' : 'en_US'} />

      {/* Article specific meta tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && section && (
        <meta property="article:section" content={section} />
      )}
      {type === 'article' && tags && tags.map((tag, index) => (
        <meta key={index} property="article:tag" content={tag} />
      ))}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={seo.url} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={seo.title} />

      {/* Additional SEO enhancements */}
      <meta name="theme-color" content="#3B82F6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="format-detection" content="telephone=yes" />
    </Helmet>
  );
};

// Pre-defined SEO configurations for different pages
export const getPageSEOConfig = (page: string, t: (key: string) => string) => ({
  home: {
    title: t('seo.titles.home'),
    description: t('seo.descriptions.home'),
    keywords: t('seo.keywords.home'),
  },
  
  repairs: {
    title: t('seo.titles.repairs'),
    description: t('seo.descriptions.repairs'),
    keywords: t('seo.keywords.repairs'),
  },
  
  accessories: {
    title: t('seo.titles.accessories'),
    description: t('seo.descriptions.accessories'),
    keywords: t('seo.keywords.accessories'),
  },
  
  dashboard: {
    title: t('seo.titles.dashboard'),
    description: t('seo.descriptions.dashboard'),
    keywords: t('seo.keywords.base'),
    noIndex: true, // Dashboard should not be indexed
  },
  
  adminRepairs: {
    title: 'Admin - ' + t('seo.titles.repairs'),
    description: t('seo.descriptions.repairs'),
    keywords: t('seo.keywords.base'),
    noIndex: true, // Admin pages should not be indexed
  },
  
  auth: {
    title: t('seo.titles.auth'),
    description: t('seo.descriptions.auth'),
    keywords: t('seo.keywords.base'),
    noIndex: true, // Auth pages should not be indexed
  },

  // Dynamic repair page configs
  repairCategories: {
    title: t('seo.titles.categories'),
    description: t('seo.descriptions.categories'),
    keywords: t('seo.keywords.categories'),
  },

  repairBrands: {
    title: t('seo.titles.brands'),
    description: t('seo.descriptions.brands'),
    keywords: t('seo.keywords.brands'),
  },

  repairModels: {
    title: t('seo.titles.models'),
    description: t('seo.descriptions.models'),
    keywords: t('seo.keywords.models'),
  },

  repairParts: {
    title: t('seo.titles.parts'),
    description: t('seo.descriptions.parts'),
    keywords: t('seo.keywords.parts'),
  },
}[page] || {
  title: t('seo.titles.home'),
  description: t('seo.descriptions.home'),
  keywords: t('seo.keywords.base'),
});

// Keep the old export for backward compatibility but mark as deprecated
export const pageSEOConfigs = {
  home: {
    title: 'Home',
    description: 'Expert phone repair services and premium mobile accessories. Fast repairs, genuine parts, competitive prices with warranty coverage.',
    keywords: 'phone repair, mobile repair, iPhone repair, Samsung repair, screen replacement, battery replacement',
  },
  
  repairs: {
    title: 'Phone Repair Services',
    description: 'Professional phone repair services for all major brands. Screen replacement, battery repair, water damage recovery, and more with warranty.',
    keywords: 'phone repair, screen replacement, battery replacement, iPhone repair, Samsung repair, mobile repair service',
  },

  // Specific repair categories
  repairCategories: {
    title: 'Device Repair Services',
    description: 'Choose your device type for professional repair services. Smartphones, tablets, laptops, and more with expert technicians.',
    keywords: 'device repair, smartphone repair, tablet repair, laptop repair, mobile device service',
  },

  repairBrands: {
    title: 'Brand-Specific Repair Services',
    description: 'Professional repair services for all major device brands. Genuine parts, expert technicians, warranty coverage.',
    keywords: 'brand repair service, authorized repair, genuine parts, warranty repair',
  },

  repairModels: {
    title: 'Device Model Repair Services',
    description: 'Specific repair services for your exact device model. Expert diagnosis, genuine parts, fast turnaround.',
    keywords: 'model repair, device specific repair, exact model service, professional diagnosis',
  },

  repairParts: {
    title: 'Component Repair & Replacement',
    description: 'Professional component repair and replacement services. Screen, battery, camera, speaker repairs with warranty.',
    keywords: 'component repair, part replacement, screen repair, battery replacement, camera fix',
  },
  
  accessories: {
    title: 'Phone Accessories',
    description: 'Premium phone accessories including cases, chargers, screen protectors, headphones and more. Compatible with iPhone, Samsung, Google Pixel.',
    keywords: 'phone accessories, phone cases, screen protectors, chargers, headphones, mobile accessories',
  },
  
  dashboard: {
    title: 'Dashboard',
    description: 'Manage your repair bookings, track order status, and access your account information.',
    keywords: 'repair dashboard, order tracking, booking management',
    noIndex: true, // Dashboard should not be indexed
  },
  
  adminRepairs: {
    title: 'Admin - Repair Management',
    description: 'Admin panel for managing repair services, devices, and parts inventory.',
    keywords: 'admin, repair management, inventory management',
    noIndex: true, // Admin pages should not be indexed
  },
  
  auth: {
    title: 'Login & Registration',
    description: 'Sign in to your account or create a new account to book repair services and track your orders.',
    keywords: 'login, register, sign in, account, user authentication',
    noIndex: true, // Auth pages should not be indexed
  }
};

export default SEO;
