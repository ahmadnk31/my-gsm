import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, Phone, Mail, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const faqs = [
  {
    id: "repair-time",
    question: "How long does a typical phone repair take?",
    answer: "Most screen repairs and battery replacements take 30-60 minutes. More complex repairs like motherboard issues or water damage can take 2-4 hours. We'll give you an accurate time estimate during diagnosis and keep you updated throughout the process."
  },
  {
    id: "warranty",
    question: "Do you offer warranty on repairs?",
    answer: "Yes! We provide a 6-month warranty on all repairs using genuine parts, and 3 months on compatible parts. Our warranty covers defects in workmanship and part failures. If you experience any issues, just bring your device back and we'll fix it free of charge."
  },
  {
    id: "data-safety",
    question: "Will my data be safe during the repair?",
    answer: "Absolutely. We take data privacy very seriously. In most cases, your data remains untouched during repairs. However, we always recommend backing up your device before any repair. Our technicians are trained to handle devices with the utmost care and confidentiality."
  },
  {
    id: "pricing",
    question: "How much do repairs typically cost?",
    answer: "Repair costs vary by device and type of repair. Screen repairs typically range from $89-$299, battery replacements from $59-$149, and water damage repairs from $99-$249. We provide free diagnostics and transparent pricing before any work begins."
  },
  {
    id: "parts-quality",
    question: "Do you use genuine parts?",
    answer: "We offer both genuine OEM parts and high-quality compatible parts. Genuine parts come with our premium warranty, while compatible parts offer excellent value with standard warranty. We'll explain the differences and let you choose what's best for your needs and budget."
  },
  {
    id: "appointment",
    question: "Do I need an appointment?",
    answer: "While appointments are preferred and guarantee immediate service, we also accept walk-ins based on availability. Booking online ensures you get seen right away and can often secure same-day service for most repairs."
  },
  {
    id: "device-types",
    question: "What devices do you repair?",
    answer: "We repair all major smartphone brands including iPhone, Samsung, Google Pixel, OnePlus, Huawei, and more. We also service tablets, laptops, smartwatches, and gaming devices. If you're unsure about your device, just give us a call!"
  },
  {
    id: "payment",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, PayPal, Apple Pay, Google Pay, and cash. We also offer financing options for repairs over $200 through our partner Affirm, with 0% APR available for qualified customers."
  },
  {
    id: "emergency",
    question: "Do you offer emergency or same-day service?",
    answer: "Yes! We understand how important your device is. We offer priority emergency service for urgent repairs. Most screen and battery repairs can be completed the same day, often within 1-2 hours. Emergency service includes a small priority fee."
  },
  {
    id: "trade-in",
    question: "Can I trade in my old device?",
    answer: "Absolutely! We offer competitive trade-in values for working and non-working devices. Trade-in credit can be applied toward repairs, accessories, or even cash back. We'll evaluate your device and provide an instant quote."
  }
];

const FAQ: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-64 h-64 bg-info/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-warning/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-info to-info/80 text-info-foreground px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-elegant">
            <HelpCircle className="h-4 w-4" />
            <span>FAQ</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Frequently Asked Questions
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Get answers to the most common questions about our repair services, warranties, and process
          </p>
        </div>

        {/* FAQ Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* FAQ Accordion */}
          <div className="space-y-4">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.slice(0, 5).map((faq) => (
                <AccordionItem 
                  key={faq.id} 
                  value={faq.id}
                  className="border border-border/50 rounded-xl px-6 py-2 bg-card/50 backdrop-blur-sm hover:border-border transition-all duration-300"
                >
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Second Column */}
          <div className="space-y-4">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.slice(5).map((faq) => (
                <AccordionItem 
                  key={faq.id} 
                  value={faq.id}
                  className="border border-border/50 rounded-xl px-6 py-2 bg-card/50 backdrop-blur-sm hover:border-border transition-all duration-300"
                >
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Contact Support Section */}
        <Card className="bg-gradient-to-r from-foreground via-foreground to-foreground text-background relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-success/10" />
          <CardContent className="p-12 text-center relative">
            <h3 className="text-3xl font-bold mb-4">Still Have Questions?</h3>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Our friendly support team is here to help. Get in touch and we'll answer any questions you have about our services.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-background text-foreground hover:bg-background/90 px-8 py-3 font-semibold"
              >
                <Phone className="h-5 w-5 mr-2" />
                Call Us: (555) 123-REPAIR
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-background/20 text-background hover:bg-background/10 px-8 py-3 font-semibold"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Live Chat Support
              </Button>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-6 text-sm opacity-80">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@phonerepair.com</span>
              </div>
              <div className="hidden sm:block">•</div>
              <div>Available 24/7</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default FAQ;
