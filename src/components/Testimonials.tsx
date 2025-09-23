import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote, Verified, Shield, Award } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Business Owner",
    company: "TechStart LLC",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Absolutely incredible service! They fixed my iPhone 13 Pro screen in just 30 minutes. The quality is outstanding and the price was very reasonable. Highly recommend!",
    location: "New York, NY",
    verified: true,
    service: "Screen Repair"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Software Developer",
    company: "Google",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Professional, fast, and reliable. My Samsung Galaxy was back to perfect condition. The technician explained everything clearly and the warranty gave me peace of mind.",
    location: "San Francisco, CA",
    verified: true,
    service: "Battery Replacement"
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    role: "Marketing Manager",
    company: "Adobe",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Best phone repair experience I've ever had. Quick turnaround, excellent customer service, and my phone looks brand new. Will definitely come back!",
    location: "Austin, TX",
    verified: true,
    service: "Water Damage Repair"
  },
  {
    id: 4,
    name: "David Kim",
    role: "Entrepreneur",
    company: "StartupXYZ",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "They saved my business! My phone had critical data and they recovered everything while fixing the hardware. True professionals with amazing skills.",
    location: "Seattle, WA",
    verified: true,
    service: "Data Recovery"
  },
  {
    id: 5,
    name: "Lisa Thompson",
    role: "Doctor",
    company: "City Hospital",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Exceptional service with genuine care for customers. They explained the repair process, provided updates, and delivered exactly what they promised.",
    location: "Miami, FL",
    verified: true,
    service: "Screen & Battery"
  },
  {
    id: 6,
    name: "James Wilson",
    role: "Real Estate Agent",
    company: "Premium Properties",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Outstanding value and quality. My phone looks and works like new. The team is knowledgeable, friendly, and truly cares about customer satisfaction.",
    location: "Chicago, IL",
    verified: true,
    service: "Complete Restoration"
  }
];

const Testimonials: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-success/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-elegant">
            <Quote className="h-4 w-4" />
            <span>Customer Stories</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Trusted by Thousands
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Real experiences from real customers who trust us with their most important devices
          </p>
        </div>

        {/* Bento Grid Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-16">
          {testimonials.map((testimonial, index) => {
            const getBentoClasses = (index: number) => {
              const patterns = [
                "md:col-span-2 lg:col-span-2 md:row-span-2", // Large
                "md:col-span-2 lg:col-span-2", // Standard
                "md:col-span-4 lg:col-span-2", // Wide
                "md:col-span-2 lg:col-span-3", // Wide
                "md:col-span-2 lg:col-span-3", // Wide
                "md:col-span-4 lg:col-span-6", // Full width
              ];
              return patterns[index % patterns.length];
            };

            const isLarge = index === 0;
            const isFullWidth = index === 5;

            return (
              <Card 
                key={testimonial.id}
                className={`group relative bg-card/50 backdrop-blur-sm border-border/50 hover:border-border transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-2 ${getBentoClasses(index)} flex flex-col`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className={`${isLarge ? 'p-8' : isFullWidth ? 'p-10' : 'p-6'} flex flex-col justify-between h-full`}>
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className={`${isLarge ? 'text-lg' : isFullWidth ? 'text-xl' : 'text-base'} text-foreground mb-6 leading-relaxed italic flex-grow`}>
                    "{testimonial.text}"
                  </blockquote>

                  {/* Customer Info */}
                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-border"
                    />
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                        {testimonial.verified && (
                          <Verified className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <span>{testimonial.location}</span>
                        <span>•</span>
                        <span>{testimonial.service}</span>
                      </p>
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">15K+</div>
            <div className="text-muted-foreground">Repairs Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-success mb-2">99%</div>
            <div className="text-muted-foreground">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-warning mb-2">4.9★</div>
            <div className="text-muted-foreground">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-info mb-2">24/7</div>
            <div className="text-muted-foreground">Support Available</div>
          </div>
        </div>

        {/* Certifications */}
        <div className="text-center">
          <p className="text-muted-foreground mb-6">Trusted & Certified</p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-5 w-5" />
              <span className="text-sm">Certified Technicians</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Award className="h-5 w-5" />
              <span className="text-sm">Quality Guaranteed</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Verified className="h-5 w-5" />
              <span className="text-sm">Authorized Service</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
