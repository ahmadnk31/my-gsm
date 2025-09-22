import Hero from "@/components/Hero";
import ProductShowcase from "@/components/ProductShowcase";
import Features from "@/components/Features";
import { SEO, getPageSEOConfig } from "@/components/SEO";
import { WebsiteStructuredData, OrganizationStructuredData } from "@/components/StructuredData";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();
  const seoConfig = getPageSEOConfig('home', t);

  return (
    <div className="min-h-screen">
      <SEO {...seoConfig} />
      <WebsiteStructuredData />
      <OrganizationStructuredData 
        name={t('seo.siteName')}
        description={t('seo.descriptions.home')}
        url="https://phoneHub.com"
        logo="https://phoneHub.com/hero-phone.jpg"
        contactPoint={{
          telephone: "+1-555-PHONE-ZEN",
          contactType: "customer service",
          areaServed: "Worldwide",
          availableLanguage: ["English", "Dutch"]
        }}
        address={{
          streetAddress: "123 Tech Street",
          addressLocality: "Tech City",
          addressRegion: "TC",
          postalCode: "12345",
          addressCountry: "US"
        }}
        sameAs={[
          "https://facebook.com/blueprintphonezen",
          "https://twitter.com/phonezenrepair",
          "https://instagram.com/blueprintphonezen"
        ]}
      />
      <Hero />
      <ProductShowcase />
      <Features />
    </div>
  );
};

export default Index;
