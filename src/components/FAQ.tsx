import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, Phone, Mail, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const FAQ: React.FC = () => {
  const { t } = useLanguage();

  const faqs = [
    {
      id: "repair-time",
      question: t('faq.questions.repairTime.question'),
      answer: t('faq.questions.repairTime.answer')
    },
    {
      id: "warranty",
      question: t('faq.questions.warranty.question'),
      answer: t('faq.questions.warranty.answer')
    },
    {
      id: "data-safety",
      question: t('faq.questions.dataSafety.question'),
      answer: t('faq.questions.dataSafety.answer')
    },
    {
      id: "pricing",
      question: t('faq.questions.pricing.question'),
      answer: t('faq.questions.pricing.answer')
    },
    {
      id: "parts-quality",
      question: t('faq.questions.partsQuality.question'),
      answer: t('faq.questions.partsQuality.answer')
    },
    {
      id: "appointment",
      question: t('faq.questions.appointment.question'),
      answer: t('faq.questions.appointment.answer')
    },
    {
      id: "device-types",
      question: t('faq.questions.deviceTypes.question'),
      answer: t('faq.questions.deviceTypes.answer')
    },
    {
      id: "payment",
      question: t('faq.questions.payment.question'),
      answer: t('faq.questions.payment.answer')
    },
    {
      id: "emergency",
      question: t('faq.questions.emergency.question'),
      answer: t('faq.questions.emergency.answer')
    },
    {
      id: "trade-in",
      question: t('faq.questions.tradeIn.question'),
      answer: t('faq.questions.tradeIn.answer')
    }
  ];

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
            {t('faq.title')}
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('faq.description')}
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
            <h3 className="text-3xl font-bold mb-4">{t('faq.stillHaveQuestions')}</h3>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              {t('faq.supportTeamDescription')}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-background text-foreground hover:bg-background/90 px-8 py-3 font-semibold"
              >
                <Phone className="h-5 w-5 mr-2" />
                {t('faq.callUs')}
              </Button>
              
              <Button 
                size="lg" 
                variant="glass" 
              
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                {t('faq.liveChatSupport')}
              </Button>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-6 text-sm opacity-80">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{t('faq.supportEmail')}</span>
              </div>
              <div className="hidden sm:block">•</div>
              <div>{t('faq.available247')}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default FAQ;
