import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, Clock, CheckCircle, AlertTriangle, FileText, Phone, Mail, ArrowRight, Star, Zap, Award } from "lucide-react";
import { Link } from "react-router-dom";

const Warranty = () => {
  const warrantyTypes = [
    {
      icon: Shield,
      title: "Standard Warranty",
      duration: "1 Year",
      description: "Comprehensive coverage for manufacturing defects",
      features: ["Parts & Labor", "Free Diagnostics", "Expert Repair", "Genuine Parts"],
      price: "Included",
      popular: false
    },
    {
      icon: Clock,
      title: "Extended Warranty",
      duration: "2 Years",
      description: "Extended protection for peace of mind",
      features: ["All Standard Features", "Accidental Damage", "Battery Replacement", "Priority Service"],
      price: "$99",
      popular: true
    },
    {
      icon: Zap,
      title: "Premium Protection",
      duration: "3 Years",
      description: "Complete protection with premium benefits",
      features: ["All Extended Features", "Screen Protection", "Water Damage", "Express Service"],
      price: "$199",
      popular: false
    }
  ];

  const coverageDetails = [
    {
      category: "Hardware Coverage",
      items: [
        "Manufacturing defects",
        "Component failures",
        "Battery issues",
        "Screen malfunctions",
        "Speaker problems",
        "Camera defects"
      ]
    },
    {
      category: "Software Support",
      items: [
        "Operating system issues",
        "App compatibility",
        "Performance optimization",
        "Data recovery assistance",
        "Security updates",
        "Technical support"
      ]
    },
    {
      category: "Service Benefits",
      items: [
        "Free diagnostics",
        "Expert technicians",
        "Genuine parts",
        "Quick turnaround",
        "Nationwide coverage",
        "Online tracking"
      ]
    }
  ];

  const exclusions = [
    "Physical damage from drops or impacts",
    "Water damage (unless covered by extended warranty)",
    "Unauthorized modifications",
    "Software issues caused by user error",
    "Cosmetic damage",
    "Loss or theft"
  ];

  const faqs = [
    {
      question: "What is covered under the standard warranty?",
      answer: "Our standard warranty covers manufacturing defects, component failures, and hardware issues that occur under normal use. This includes battery problems, screen malfunctions, speaker issues, and camera defects."
    },
    {
      question: "How long does warranty repair take?",
      answer: "Most repairs are completed within 24-48 hours. Complex issues may take 3-5 business days. We provide online tracking so you can monitor the progress of your repair."
    },
    {
      question: "Can I transfer my warranty to another person?",
      answer: "Yes, warranties are transferable to new owners. Simply contact our customer service team with the new owner's information and we'll update the warranty registration."
    },
    {
      question: "What if my device can't be repaired?",
      answer: "If your device cannot be repaired due to a covered defect, we will replace it with a comparable model or provide a refund based on the original purchase price."
    },
    {
      question: "Do I need to register my warranty?",
      answer: "Warranty registration is automatic when you purchase from PhoneHub. However, you can verify your warranty status by contacting our customer service team."
    },
    {
      question: "What's the difference between standard and extended warranty?",
      answer: "Standard warranty covers manufacturing defects for 1 year. Extended warranty adds accidental damage protection, battery replacement, and priority service for an additional year."
    }
  ];

  const processSteps = [
    {
      step: "01",
      title: "Contact Support",
      description: "Reach out to our warranty team with your issue"
    },
    {
      step: "02",
      title: "Diagnosis",
      description: "We'll diagnose the problem and determine coverage"
    },
    {
      step: "03",
      title: "Repair or Replace",
      description: "We'll repair your device or provide a replacement"
    },
    {
      step: "04",
      title: "Quality Check",
      description: "Thorough testing to ensure everything works perfectly"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-primary-glow/5 to-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-success to-success/80 text-success-foreground px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-elegant">
              <Shield className="h-4 w-4" />
              <span>Warranty Protection</span>
            </div>
            
            <h1 className="text-display text-foreground mb-6">
              Comprehensive
              <span className="block text-gradient-primary"> 
                Warranty Coverage
              </span>
            </h1>
            
            <p className="text-body text-muted-foreground max-w-3xl mx-auto">
              Protect your investment with our comprehensive warranty programs. From standard coverage 
              to premium protection plans, we've got you covered with expert service and genuine parts.
            </p>
          </div>

          {/* Warranty Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {warrantyTypes.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative bg-card border-0 shadow-elegant hover:shadow-glow transition-all duration-300 hover:-translate-y-2 ${
                  plan.popular ? 'ring-2 ring-primary' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <plan.icon className="h-8 w-8 text-primary" />
                  </div>
                  
                  <CardTitle className="text-subheading text-foreground">
                    {plan.title}
                  </CardTitle>
                  
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="secondary" className="text-lg font-semibold">
                      {plan.duration}
                    </Badge>
                    <span className="text-2xl font-bold text-primary">
                      {plan.price}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-body text-muted-foreground text-center">
                    {plan.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button className="w-full btn-primary mt-6">
                    Get {plan.title}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage Details */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading text-foreground mb-6">
              What's
              <span className="block text-gradient-primary"> 
                Covered
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {coverageDetails.map((category, index) => (
              <Card key={index} className="bg-card border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="text-subheading text-foreground flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {category.items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                        <span className="text-body text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Exclusions */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading text-foreground mb-6">
              What's Not
              <span className="block text-gradient-primary"> 
                Covered
              </span>
            </h2>
          </div>

          <Card className="max-w-4xl mx-auto bg-card border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="text-subheading text-foreground flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Warranty Exclusions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exclusions.map((exclusion, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
                    <span className="text-body text-muted-foreground">{exclusion}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading text-foreground mb-6">
              Warranty
              <span className="block text-gradient-primary"> 
                Process
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto text-white font-bold text-lg relative z-10 shadow-glow">
                    {step.step}
                  </div>
                  {index < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-8 h-0.5 bg-gradient-to-r from-primary to-primary-glow"></div>
                  )}
                </div>
                
                <h3 className="text-subheading text-foreground mb-3">
                  {step.title}
                </h3>
                
                <p className="text-body text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading text-foreground mb-6">
              Frequently Asked
              <span className="block text-gradient-primary"> 
                Questions
              </span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="bg-card border-0 shadow-elegant rounded-lg px-6">
                  <AccordionTrigger className="text-left text-subheading text-foreground hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-body text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-foreground via-foreground to-foreground rounded-3xl p-12 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary-glow/10 to-primary/10" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary-glow/20 to-primary/20 rounded-full blur-xl" />
            
            <div className="relative text-center">
              <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-white mb-6">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Need Help?</span>
              </div>
              
              <h3 className="text-subheading text-white mb-4">
                Contact Our Warranty Team
              </h3>
              
              <p className="text-body text-white/80 mb-8 max-w-2xl mx-auto">
                Have questions about your warranty coverage? Our expert team is here to help 
                you understand your protection and assist with any claims.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button size="lg" className="btn-primary group">
                    <Phone className="h-5 w-5 mr-2" />
                    Contact Support
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="btn-ghost border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-md">
                  <Mail className="h-5 w-5 mr-2" />
                  Email Support
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Warranty;
