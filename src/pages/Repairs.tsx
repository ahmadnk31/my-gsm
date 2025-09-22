
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO, getPageSEOConfig } from "@/components/SEO";
import { ServiceStructuredData } from "@/components/StructuredData";
import { BookingModal } from "@/components/booking/BookingModal";
import { HierarchicalRepairsGrid } from "@/components/HierarchicalRepairsGrid";
import { useLanguage } from "@/contexts/LanguageContext";
import { Smartphone, Shield, Clock, CheckCircle, Wrench, Battery, Camera, Volume2, Wifi, Droplets, Star, Calendar, MapPin, Phone } from "lucide-react";


const RepairServices = () => {
  const { t } = useLanguage();
  
  return <section id="repairs-section" className="bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        

        <HierarchicalRepairsGrid />
      </div>
    </section>;
};
const RepairProcess = () => {
  const { t } = useLanguage();
  const steps = [{
    step: "01",
    title: t('repairs.diagnosis'),
    description: t('repairs.diagnosisDesc')
  }, {
    step: "02",
    title: t('repairs.quote'),
    description: t('repairs.quoteDesc')
  }, {
    step: "03",
    title: t('repairs.repair'),
    description: t('repairs.repairDesc')
  }, {
    step: "04",
    title: t('repairs.testing'),
    description: t('repairs.testingDesc')
  }, {
    step: "05",
    title: t('repairs.warranty'),
    description: t('repairs.warrantyDesc')
  }];
  return <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-heading text-foreground mb-6">
            {t('repairs.ourRepairProcess')}
            <span className="block text-gradient-primary"> {t('repairs.process')}</span>
          </h2>
          <p className="text-body text-muted-foreground max-w-2xl mx-auto">
            {t('repairs.processDescription')}
          </p>
        </div>

        <div className="relative">
          {/* Connection Lines */}
          
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {steps.map((step, index) => <div key={index} className="text-center animate-fade-in relative" style={{
            animationDelay: `${index * 0.2}s`
          }}>
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto text-white font-bold text-lg relative z-10 shadow-glow">
                    {step.step}
                  </div>
                  {index < steps.length - 1 && <div className="hidden lg:block absolute top-8 left-full w-8 h-0.5 bg-gradient-to-r from-primary to-primary-glow"></div>}
                </div>
                
                <p className="text-body text-muted-foreground">
                  {step.description}
                </p>
              </div>)}
          </div>
        </div>
      </div>
    </section>;
};
const RepairGuarantees = () => {
  const { t } = useLanguage();
  const guarantees = [{
    icon: Shield,
    title: t('repairs.oneYearWarranty'),
    description: t('repairs.oneYearWarrantyDesc')
  }, {
    icon: CheckCircle,
    title: t('repairs.genuineParts'),
    description: t('repairs.genuinePartsDesc')
  }, {
    icon: Clock,
    title: t('repairs.fastService'),
    description: t('repairs.fastServiceDesc')
  }, {
    icon: Star,
    title: t('repairs.expertTechnicians'),
    description: t('repairs.expertTechniciansDesc')
  }];
  return <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-heading text-foreground mb-6">
            {t('repairs.whyChooseOur')}
            <span className="block text-gradient-primary"> {t('repairs.repairService')}</span>?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {guarantees.map((guarantee, index) => <Card key={index} className="text-center group bg-card border-0 shadow-elegant hover:shadow-glow transition-all duration-300 hover:-translate-y-1 animate-fade-in" style={{
          animationDelay: `${index * 0.1}s`
        }}>
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-glow transition-all duration-300">
                  <guarantee.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-subheading text-foreground mb-4 group-hover:text-primary transition-colors">
                  {guarantee.title}
                </h3>
                <p className="text-body text-muted-foreground">
                  {guarantee.description}
                </p>
              </CardContent>
            </Card>)}
        </div>
      </div>
    </section>;
};
const ContactRepair = () => {
  const { t } = useLanguage();
  return <section className="py-20 bg-gradient-hero">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-heading text-white mb-6">
            {t('repairs.readyToFix')}
          </h2>
          <p className="text-body text-white/90 mb-8">
            {t('repairs.readyToFixDescription')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <BookingModal>
              <Button className="btn-primary" size="lg">
                <Calendar className="h-5 w-5 mr-2" />
                {t('repairs.bookAppointment')}
              </Button>
            </BookingModal>
            <Button variant="outline" size="lg" className="btn-ghost border-2 border-white/30 hover:text-white hover:scale-105 hover:bg-white/10 backdrop-blur-md">
              <MapPin className="h-5 w-5 mr-2" />
              {t('repairs.findStore')}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
            <div>
              <h3 className="text-subheading mb-2">{t('repairs.storeHours')}</h3>
              <p className="text-body text-white/80">{t('repairs.monFri')}</p>
              <p className="text-body text-white/80">{t('repairs.satSun')}</p>
            </div>
            <div>
              <h3 className="text-subheading mb-2">{t('repairs.contact')}</h3>
              <p className="text-body text-white/80">{t('repairs.phone')}</p>
              <p className="text-body text-white/80">{t('repairs.email')}</p>
            </div>
            <div>
              <h3 className="text-subheading mb-2">{t('repairs.location')}</h3>
              <p className="text-body text-white/80">{t('repairs.address1')}</p>
              <p className="text-body text-white/80">{t('repairs.address2')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
const Repairs = () => {
  const { t } = useLanguage();
  const seoConfig = getPageSEOConfig('repairs', t);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Base SEO - will be overridden by dynamic SEO in HierarchicalRepairsGrid */}
      <SEO 
        {...seoConfig}
        title={t('seo.titles.repairs')}
        description={t('seo.descriptions.repairs')}
      />
      <ServiceStructuredData 
        name={t('seo.serviceTypes.diagnostic') + ' ' + t('seo.titles.repairs')}
        description={t('seo.descriptions.repairs')}
        provider={t('seo.siteName')}
        serviceType="Electronics Repair"
        areaServed="Worldwide"
        availableChannel={{
          url: "https://phoneHub.com/repairs",
          name: "Online Booking System"
        }}
      />
      <RepairServices />
      <RepairProcess />
      <RepairGuarantees />
      <ContactRepair />
    </div>
  );
};

export default Repairs;