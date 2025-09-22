import React from 'react';
import { Helmet } from 'react-helmet-async';

interface RepairServiceSEOProps {
  serviceName: string;
  deviceBrand?: string;
  deviceModel?: string;
  deviceCategory?: string;
  partCategory?: string;
  estimatedPrice?: number;
  serviceDescription?: string;
}

export const RepairServiceSEO: React.FC<RepairServiceSEOProps> = ({
  serviceName,
  deviceBrand,
  deviceModel,
  deviceCategory,
  partCategory,
  estimatedPrice,
  serviceDescription
}) => {
  // Generate dynamic title
  const generateTitle = () => {
    if (deviceBrand && deviceModel && partCategory) {
      return `${deviceBrand} ${deviceModel} ${partCategory} Repair Service | Blueprint Phone Zen`;
    }
    if (deviceBrand && partCategory) {
      return `${deviceBrand} ${partCategory} Repair Service | Professional Fix`;
    }
    if (deviceCategory && partCategory) {
      return `${deviceCategory} ${partCategory} Repair | Expert Service`;
    }
    if (partCategory) {
      return `${partCategory} Repair Service | Professional Mobile Repair`;
    }
    return `${serviceName} | Professional Mobile Repair Service`;
  };

  // Generate dynamic description
  const generateDescription = () => {
    if (serviceDescription) return serviceDescription;
    
    if (deviceBrand && deviceModel && partCategory) {
      return `Professional ${deviceBrand} ${deviceModel} ${partCategory.toLowerCase()} repair service. Expert technicians, genuine parts, fast turnaround, warranty included.`;
    }
    if (deviceBrand && partCategory) {
      return `Expert ${deviceBrand} ${partCategory.toLowerCase()} repair service. Genuine parts, professional diagnosis, warranty coverage.`;
    }
    if (partCategory) {
      return `Professional ${partCategory.toLowerCase()} repair service for all device brands. Expert technicians, quality parts, warranty included.`;
    }
    return `Professional mobile device repair service with expert technicians and warranty coverage.`;
  };

  // Generate dynamic keywords
  const generateKeywords = () => {
    const baseKeywords = ['phone repair', 'mobile repair', 'device repair service'];
    
    if (deviceBrand) {
      baseKeywords.push(`${deviceBrand} repair`, `${deviceBrand} fix`, `${deviceBrand} service`);
    }
    
    if (deviceModel) {
      baseKeywords.push(`${deviceModel} repair`, `${deviceModel} fix`);
    }
    
    if (partCategory) {
      const partLower = partCategory.toLowerCase();
      baseKeywords.push(`${partLower} repair`, `${partLower} replacement`, `${partLower} fix`);
      
      if (deviceBrand) {
        baseKeywords.push(`${deviceBrand} ${partLower} repair`);
      }
    }
    
    if (deviceCategory) {
      baseKeywords.push(`${deviceCategory.toLowerCase()} repair`);
    }
    
    return baseKeywords.join(', ');
  };

  // Generate structured data for the repair service
  const generateServiceSchema = () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": serviceName,
      "description": generateDescription(),
      "provider": {
        "@type": "LocalBusiness",
        "name": "Blueprint Phone Zen",
        "url": "https://phoneHub.com"
      },
      "serviceType": "Mobile Device Repair",
      "category": partCategory || "Device Repair",
      "areaServed": {
        "@type": "Country",
        "name": "Worldwide"
      },
      "availableChannel": {
        "@type": "ServiceChannel",
        "serviceUrl": window.location.href,
        "serviceName": "Online Repair Booking"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Repair Services",
        "itemListElement": [{
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": serviceName,
            "description": generateDescription()
          },
          "availability": "https://schema.org/InStock",
          "validFrom": new Date().toISOString(),
          ...(estimatedPrice && {
            "priceSpecification": {
              "@type": "PriceSpecification",
              "price": estimatedPrice,
              "priceCurrency": "EUR"
            }
          })
        }]
      },
      "brand": deviceBrand && {
        "@type": "Brand",
        "name": deviceBrand
      },
      "model": deviceModel,
      "warranty": {
        "@type": "WarrantyPromise",
        "durationOfWarranty": "P90D", // 90 days
        "warrantyScope": "Repair service and parts"
      }
    };

    return schema;
  };

  return (
    <Helmet>
      <title>{generateTitle()}</title>
      <meta name="description" content={generateDescription()} />
      <meta name="keywords" content={generateKeywords()} />
      
      {/* Open Graph */}
      <meta property="og:title" content={generateTitle()} />
      <meta property="og:description" content={generateDescription()} />
      <meta property="og:type" content="service" />
      
      {/* Twitter */}
      <meta name="twitter:title" content={generateTitle()} />
      <meta name="twitter:description" content={generateDescription()} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(generateServiceSchema())}
      </script>
    </Helmet>
  );
};

export default RepairServiceSEO;
