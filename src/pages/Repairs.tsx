import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingModal } from "@/components/booking/BookingModal";
import { HierarchicalRepairsGrid } from "@/components/HierarchicalRepairsGrid";
import { QuoteRequestModal } from "@/components/quote/QuoteRequestModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { Smartphone, Shield, Clock, CheckCircle, Wrench, Battery, Camera, Volume2, Wifi, Droplets, Star, Calendar, MapPin, Phone } from "lucide-react";


const RepairServices = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const brandParam = searchParams.get('brand');
  const categoryParam = searchParams.get('category');
  const serviceParam = searchParams.get('service');

  const services = [{
    icon: Smartphone,
    title: "Screen Replacement",
    description: "Cracked or damaged screen? We replace with genuine OEM parts.",
    price: "From $79",
    time: "30-45 min",
    popular: true
  }, {
    icon: Battery,
    title: "Battery Replacement",
    description: "Restore your phone's battery life with genuine battery replacements.",
    price: "From $49",
    time: "20-30 min",
    popular: true
  }, {
    icon: Camera,
    title: "Camera Repair",
    description: "Fix blurry photos, broken lenses, and camera malfunctions.",
    price: "From $89",
    time: "45-60 min",
    popular: false
  }, {
    icon: Volume2,
    title: "Speaker & Audio",
    description: "Repair speakers, microphones, and audio-related issues.",
    price: "From $59",
    time: "30-45 min",
    popular: false
  }, {
    icon: Wifi,
    title: "Connectivity Issues",
    description: "Fix WiFi, Bluetooth, and cellular connectivity problems.",
    price: "From $69",
    time: "45-60 min",
    popular: false
  }, {
    icon: Droplets,
    title: "Water Damage",
    description: "Professional water damage assessment and restoration services.",
    price: "From $99",
    time: "2-24 hours",
    popular: false
  }];
  return <section id="repairs-section" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-heading text-foreground mb-6">
            Our Repair
            <span className="block text-gradient-primary"> Services</span>
          </h2>
          <p className="text-body text-muted-foreground max-w-2xl mx-auto">
            Professional repair services for all major smartphone brands with genuine parts and expert technicians.
          </p>
        </div>

        <HierarchicalRepairsGrid />
      </div>
    </section>;
};
const RepairProcess = () => {
  const steps = [{
    step: "01",
    title: "Diagnosis",
    description: "Free diagnostic to identify the exact issue with your device."
  }, {
    step: "02",
    title: "Quote",
    description: "Transparent pricing with no hidden fees. Approve before we proceed."
  }, {
    step: "03",
    title: "Repair",
    description: "Expert repair using genuine parts and professional tools."
  }, {
    step: "04",
    title: "Testing",
    description: "Thorough quality testing to ensure everything works perfectly."
  }, {
    step: "05",
    title: "Warranty",
    description: "1-year warranty on parts and labor for your peace of mind."
  }];
  return <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-heading text-foreground mb-6">
            Our Repair
            <span className="block text-gradient-primary"> Process</span>
          </h2>
          <p className="text-body text-muted-foreground max-w-2xl mx-auto">
            Simple, transparent, and professional repair process designed to get your device back to perfect condition.
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
  const guarantees = [{
    icon: Shield,
    title: "1-Year Warranty",
    description: "All repairs come with comprehensive 1-year warranty coverage."
  }, {
    icon: CheckCircle,
    title: "Genuine Parts",
    description: "We only use authentic OEM parts for lasting quality and performance."
  }, {
    icon: Clock,
    title: "Fast Service",
    description: "Most repairs completed within 30-60 minutes while you wait."
  }, {
    icon: Star,
    title: "Expert Technicians",
    description: "Certified professionals with years of experience in mobile repairs."
  }];
  return <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-heading text-foreground mb-6">
            Why Choose Our
            <span className="block text-gradient-primary"> Repair Service</span>?
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
            <Button variant="outline" size="lg" className="btn-ghost border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-md">
              <MapPin className="h-5 w-5 mr-2" />
              {t('repairs.findStore')}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
            <div>
              <h3 className="text-subheading mb-2">Store Hours</h3>
              <p className="text-body text-white/80">Mon-Fri: 9AM-7PM</p>
              <p className="text-body text-white/80">Sat-Sun: 10AM-6PM</p>
            </div>
            <div>
              <h3 className="text-subheading mb-2">Contact</h3>
              <p className="text-body text-white/80">+1 (555) 123-4567</p>
              <p className="text-body text-white/80">repairs@phonehub.com</p>
            </div>
            <div>
              <h3 className="text-subheading mb-2">Location</h3>
              <p className="text-body text-white/80">123 Tech Street</p>
              <p className="text-body text-white/80">Mobile City, MC 12345</p>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
const Repairs = () => {
  return <div className="min-h-screen bg-background">
      <RepairServices />
      <RepairProcess />
      <RepairGuarantees />
      <ContactRepair />
    </div>;
};
export default Repairs;