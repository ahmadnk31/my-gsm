import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Award, Zap, Users, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const companyLogos = [
  {
    name: "Apple Authorized",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    description: "Authorized Service Provider"
  },
  {
    name: "Samsung Certified",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg",
    description: "Official Repair Partner"
  },
  {
    name: "Google Certified",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    description: "Pixel Repair Specialist"
  },
  {
    name: "OnePlus Partner",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/02/OnePlus_logo.svg",
    description: "Certified Technicians"
  }
];

const achievements = [
  {
    icon: Award,
    title: "Industry Recognition",
    items: [
      "Best Phone Repair Service 2024",
      "Customer Choice Award",
      "Excellence in Service Quality",
      "Top-Rated Business Certificate"
    ]
  },
  {
    icon: Shield,
    title: "Certifications",
    items: [
      "IPC Certified Technicians",
      "ISO 9001:2015 Quality Management",
      "Mobile Device Repair Certification",
      "Data Privacy Compliance"
    ]
  },
  {
    icon: Users,
    title: "Community Trust",
    items: [
      "BBB A+ Rating",
      "5-Star Google Reviews",
      "Yelp Business of the Year",
      "Local Community Partner"
    ]
  }
];

const locations = [
  {
    city: "New York",
    address: "123 Tech Street, Manhattan, NY 10001",
    phone: "(555) 123-0001",
    hours: "Mon-Sat 9AM-8PM, Sun 11AM-6PM"
  },
  {
    city: "Los Angeles",
    address: "456 Repair Ave, Hollywood, CA 90028",
    phone: "(555) 123-0002",
    hours: "Mon-Sat 9AM-8PM, Sun 11AM-6PM"
  },
  {
    city: "Chicago",
    address: "789 Mobile Blvd, Chicago, IL 60601",
    phone: "(555) 123-0003",
    hours: "Mon-Sat 9AM-8PM, Sun 11AM-6PM"
  },
  {
    city: "Miami",
    address: "321 Phone Plaza, Miami, FL 33101",
    phone: "(555) 123-0004",
    hours: "Mon-Sat 9AM-8PM, Sun 11AM-6PM"
  }
];

const TrustIndicators: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-0 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-success/3 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Authorized Partners */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-success to-success/80 text-success-foreground px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-elegant">
            <Shield className="h-4 w-4" />
            <span>Authorized & Trusted</span>
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
            Official Repair Partners
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
            We're officially authorized by major manufacturers to provide warranty-compliant repairs
          </p>

          {/* Company Logos */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {companyLogos.map((company, index) => (
              <Card key={index} className="group bg-card/50 backdrop-blur-sm border-border/50 hover:border-border hover:shadow-lg transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-background rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                    <img 
                      src={company.logo} 
                      alt={company.name}
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{company.name}</h3>
                  <p className="text-sm text-muted-foreground">{company.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Achievements & Certifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {achievements.map((achievement, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-border hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-elegant">
                  <achievement.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-foreground text-center mb-6">
                  {achievement.title}
                </h3>
                
                <div className="space-y-3">
                  {achievement.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-success rounded-full flex-shrink-0" />
                      <span className="text-muted-foreground text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Service Guarantees */}
        <Card className="bg-gradient-to-r from-foreground via-foreground to-foreground text-background mb-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-success/10" />
          <CardContent className="p-12 relative">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">Our Service Guarantees</h3>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                We stand behind our work with industry-leading guarantees and commitments
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-background/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-background" />
                </div>
                <h4 className="font-bold mb-2">6-Month Warranty</h4>
                <p className="text-sm opacity-80">Full coverage on all repairs</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-background/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-background" />
                </div>
                <h4 className="font-bold mb-2">Same-Day Service</h4>
                <p className="text-sm opacity-80">Most repairs completed today</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-background/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-background" />
                </div>
                <h4 className="font-bold mb-2">Price Match</h4>
                <p className="text-sm opacity-80">We'll beat competitor prices</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-background/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-background" />
                </div>
                <h4 className="font-bold mb-2">100% Satisfaction</h4>
                <p className="text-sm opacity-80">Not happy? We'll make it right</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Locations */}
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-foreground mb-6">Visit Our Locations</h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
            Conveniently located across major cities with expert technicians ready to help
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {locations.map((location, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-border hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h4 className="font-bold text-foreground">{location.city}</h4>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="text-muted-foreground">
                    {location.address}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-foreground font-medium">{location.phone}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground text-xs">{location.hours}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustIndicators;
