import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Phone, Wrench, CheckCircle, Smartphone, Clock, Shield, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const HowItWorks: React.FC = () => {
  const { t } = useLanguage();

  const steps = [
    {
      id: 1,
      icon: Phone,
      title: t('howItWorks.steps.book.title'),
      description: t('howItWorks.steps.book.description'),
      details: [
        t('howItWorks.steps.book.detail1'),
        t('howItWorks.steps.book.detail2'),
        t('howItWorks.steps.book.detail3')
      ],
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-500/10 to-blue-600/5"
    },
    {
      id: 2,
      icon: Wrench,
      title: t('howItWorks.steps.repair.title'),
      description: t('howItWorks.steps.repair.description'),
      details: [
        t('howItWorks.steps.repair.detail1'),
        t('howItWorks.steps.repair.detail2'),
        t('howItWorks.steps.repair.detail3')
      ],
      color: "from-orange-500 to-orange-600",
      bgColor: "from-orange-500/10 to-orange-600/5"
    },
    {
      id: 3,
      icon: CheckCircle,
      title: t('howItWorks.steps.test.title'),
      description: t('howItWorks.steps.test.description'),
      details: [
        t('howItWorks.steps.test.detail1'),
        t('howItWorks.steps.test.detail2'),
        t('howItWorks.steps.test.detail3')
      ],
      color: "from-green-500 to-green-600",
      bgColor: "from-green-500/10 to-green-600/5"
    },
    {
      id: 4,
      icon: Smartphone,
      title: t('howItWorks.steps.ready.title'),
      description: t('howItWorks.steps.ready.description'),
      details: [
        t('howItWorks.steps.ready.detail1'),
        t('howItWorks.steps.ready.detail2'),
        t('howItWorks.steps.ready.detail3')
      ],
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-500/10 to-purple-600/5"
    }
  ];

  const guarantees = [
    {
      icon: Clock,
      title: t('howItWorks.guarantees.fastTurnaround.title'),
      description: t('howItWorks.guarantees.fastTurnaround.description')
    },
    {
      icon: Shield,
      title: t('howItWorks.guarantees.secureProcess.title'),
      description: t('howItWorks.guarantees.secureProcess.description')
    },
    {
      icon: Star,
      title: t('howItWorks.guarantees.qualityGuarantee.title'),
      description: t('howItWorks.guarantees.qualityGuarantee.description')
    }
  ];

  return (
    <section className="py-24 bg-muted/20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-0 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-success/3 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-info to-info/80 text-info-foreground px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-elegant">
            <Wrench className="h-4 w-4" />
            <span>{t('howItWorks.ourProcess')}</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {t('howItWorks.title')}
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('howItWorks.description')}
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-border to-transparent z-0 transform translate-x-4" />
              )}
              
              <Card className="group relative bg-card/50 backdrop-blur-sm border-border/50 hover:border-border hover:shadow-xl transition-all duration-500 hover:-translate-y-2 z-10">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl`} />
                
                <CardContent className="p-8 text-center relative">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-background border-2 border-border rounded-full flex items-center justify-center text-sm font-bold text-foreground group-hover:border-primary group-hover:text-primary transition-colors">
                    {step.id}
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-foreground transition-colors">
                    {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Details */}
                  <div className="space-y-2">
                    {step.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Process Guarantees */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {guarantees.map((guarantee, index) => (
            <Card key={index} className="bg-card/30 backdrop-blur-sm border-border/50 text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center mx-auto mb-4">
                  <guarantee.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{guarantee.title}</h3>
                <p className="text-sm text-muted-foreground">{guarantee.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-foreground via-foreground to-foreground text-background relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-success/10" />
          <CardContent className="p-12 text-center relative">
            <h3 className="text-3xl font-bold mb-4">{t('howItWorks.cta.title')}</h3>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              {t('howItWorks.cta.description')}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                asChild
                size="lg" 
                className="bg-background text-foreground hover:bg-background/90 px-8 py-3 font-semibold"
              >
                <Link to="/repairs" className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  <span>{t('howItWorks.cta.bookRepairNow')}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              
              <Button 
                asChild
                size="lg" 
                variant="glass" 
                
              >
                <Link to="/contact" className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  <span>{t('howItWorks.cta.callUs')}</span>
                </Link>
              </Button>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-6 text-sm opacity-80">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                <span>{t('howItWorks.cta.freeDiagnosis')}</span>
              </div>
              <div>•</div>
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>{t('howItWorks.cta.sixMonthWarranty')}</span>
              </div>
              <div>•</div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{t('howItWorks.cta.sameDayService')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default HowItWorks;
