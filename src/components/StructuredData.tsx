import React from 'react';
import { Helmet } from 'react-helmet-async';

interface ProductStructuredDataProps {
  name: string;
  description: string;
  image: string;
  brand: string;
  price: number;
  currency?: string;
  rating?: number;
  reviewCount?: number;
  availability?: 'InStock' | 'OutOfStock';
  sku?: string;
  category?: string;
}

interface OrganizationStructuredDataProps {
  name: string;
  description: string;
  url: string;
  logo: string;
  contactPoint: {
    telephone: string;
    contactType: string;
    areaServed: string;
    availableLanguage: string[];
  };
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  sameAs: string[];
}

interface ServiceStructuredDataProps {
  name: string;
  description: string;
  provider: string;
  serviceType: string;
  areaServed: string;
  availableChannel: {
    url: string;
    name: string;
  };
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbStructuredDataProps {
  items: BreadcrumbItem[];
}

export const ProductStructuredData: React.FC<ProductStructuredDataProps> = ({
  name,
  description,
  image,
  brand,
  price,
  currency = 'EUR',
  rating,
  reviewCount,
  availability = 'InStock',
  sku,
  category
}) => {
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": name,
    "description": description,
    "image": [image],
    "brand": {
      "@type": "Brand",
      "name": brand
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": currency,
      "price": price,
      "availability": `https://schema.org/${availability}`,
      "itemCondition": "https://schema.org/NewCondition"
    },
    ...(sku && { "sku": sku }),
    ...(category && { "category": category }),
    ...(rating && reviewCount && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": rating,
        "reviewCount": reviewCount,
        "bestRating": 5,
        "worstRating": 1
      }
    })
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export const OrganizationStructuredData: React.FC<OrganizationStructuredDataProps> = ({
  name,
  description,
  url,
  logo,
  contactPoint,
  address,
  sameAs
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": name,
    "description": description,
    "url": url,
    "logo": logo,
    "image": logo,
    "@id": url,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": contactPoint.telephone,
      "contactType": contactPoint.contactType,
      "areaServed": contactPoint.areaServed,
      "availableLanguage": contactPoint.availableLanguage
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": address.streetAddress,
      "addressLocality": address.addressLocality,
      "addressRegion": address.addressRegion,
      "postalCode": address.postalCode,
      "addressCountry": address.addressCountry
    },
    "sameAs": sameAs,
    "priceRange": "€€",
    "paymentAccepted": ["Credit Card", "PayPal", "Cash"],
    "currenciesAccepted": "EUR"
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export const ServiceStructuredData: React.FC<ServiceStructuredDataProps> = ({
  name,
  description,
  provider,
  serviceType,
  areaServed,
  availableChannel
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": name,
    "description": description,
    "provider": {
      "@type": "LocalBusiness",
      "name": provider
    },
    "serviceType": serviceType,
    "areaServed": {
      "@type": "City",
      "name": areaServed
    },
    "availableChannel": {
      "@type": "ServiceChannel",
      "serviceUrl": availableChannel.url,
      "serviceName": availableChannel.name
    },
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export const BreadcrumbStructuredData: React.FC<BreadcrumbStructuredDataProps> = ({
  items
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

// Website structured data for the homepage
export const WebsiteStructuredData: React.FC = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Blueprint Phone Zen",
    "alternateName": ["Phone Zen", "Blueprint Phone"],
    "url": "https://phoneHub.com",
    "description": "Expert phone repair services and premium mobile accessories. Fast repairs, genuine parts, competitive prices with warranty coverage.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://phoneHub.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Blueprint Phone Zen",
      "logo": {
        "@type": "ImageObject",
        "url": "https://phoneHub.com/hero-phone.jpg"
      }
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default {
  ProductStructuredData,
  OrganizationStructuredData,
  ServiceStructuredData,
  BreadcrumbStructuredData,
  WebsiteStructuredData
};
