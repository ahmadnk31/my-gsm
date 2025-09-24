import Hero from "@/components/Hero";
import DeviceCategoriesSection from "@/components/DeviceCategoriesSection";
import DeviceBrandsSection from "@/components/DeviceBrandsSection";
import DeviceModelsSection from "@/components/DeviceModelsSection";
import Features from "@/components/Features";
import StatsCounter from "@/components/StatsCounter";
import FeaturedProductsAndParts from "@/components/FeaturedProductsAndParts";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import TrustIndicators from "@/components/TrustIndicators";
import FAQ from "@/components/FAQ";
import BlogAndUpdates from "@/components/BlogAndUpdates";
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
      <StatsCounter />
      <DeviceCategoriesSection />
      <DeviceBrandsSection />
      <DeviceModelsSection />
      <FeaturedProductsAndParts />
      <HowItWorks />
      <Features />
      <Testimonials />
      <TrustIndicators />
      <BlogAndUpdates />
      <FAQ />
    </div>
  );
};

export default Index;
