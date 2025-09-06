import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Shield, Users, AlertTriangle, ArrowRight, Star, Zap, CheckCircle, Lock, Scale } from "lucide-react";
import { Link } from "react-router-dom";

const Terms = () => {
  const termsSections = [
    {
      icon: Users,
      title: "Account Terms",
      description: "Rules and requirements for creating and maintaining your account"
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "How we protect your information and maintain security"
    },
    {
      icon: FileText,
      title: "Order Terms",
      description: "Terms governing purchases, payments, and order fulfillment"
    },
    {
      icon: AlertTriangle,
      title: "Prohibited Activities",
      description: "Activities that are not allowed on our platform"
    }
  ];

  const accountTerms = [
    {
      term: "Account Creation",
      description: "You must provide accurate information when creating an account"
    },
    {
      term: "Account Security",
      description: "You are responsible for maintaining the security of your account"
    },
    {
      term: "Age Requirement",
      description: "You must be at least 18 years old to create an account"
    },
    {
      term: "Account Termination",
      description: "We reserve the right to terminate accounts that violate our terms"
    }
  ];

  const orderTerms = [
    {
      term: "Order Acceptance",
      description: "Orders are subject to acceptance and availability"
    },
    {
      term: "Pricing",
      description: "Prices are subject to change without notice"
    },
    {
      term: "Payment",
      description: "Payment is required at the time of order placement"
    },
    {
      term: "Shipping",
      description: "Shipping times are estimates and may vary"
    }
  ];

  const prohibitedActivities = [
    "Using false or misleading information",
    "Attempting to gain unauthorized access to our systems",
    "Interfering with the proper functioning of our website",
    "Violating any applicable laws or regulations",
    "Harassing or threatening other users",
    "Attempting to circumvent security measures"
  ];

  const userObligations = [
    {
      obligation: "Compliance",
      description: "Comply with all applicable laws and regulations"
    },
    {
      obligation: "Accuracy",
      description: "Provide accurate and complete information"
    },
    {
      obligation: "Security",
      description: "Maintain the security of your account and information"
    },
    {
      obligation: "Respect",
      description: "Respect the rights of other users and our staff"
    }
  ];

  const companyObligations = [
    {
      obligation: "Service Quality",
      description: "Provide high-quality products and services"
    },
    {
      obligation: "Security",
      description: "Protect your personal information and data"
    },
    {
      obligation: "Support",
      description: "Provide customer support and assistance"
    },
    {
      obligation: "Transparency",
      description: "Be transparent about our practices and policies"
    }
  ];

  const liabilityLimitations = [
    {
      limitation: "Service Availability",
      description: "We do not guarantee uninterrupted service availability"
    },
    {
      limitation: "Third-Party Content",
      description: "We are not responsible for third-party content or services"
    },
    {
      limitation: "Data Loss",
      description: "We are not liable for data loss or corruption"
    },
    {
      limitation: "Indirect Damages",
      description: "We are not liable for indirect or consequential damages"
    }
  ];

  const faqs = [
    {
      question: "Can I cancel my order after it's placed?",
      answer: "Orders can be cancelled within 1 hour of placement. After that, please contact customer service immediately."
    },
    {
      question: "What happens if my item arrives damaged?",
      answer: "If your item arrives damaged, contact us within 48 hours with photos. We'll arrange a replacement or refund."
    },
    {
      question: "Are there any age restrictions?",
      answer: "You must be at least 18 years old to create an account and make purchases on our platform."
    },
    {
      question: "Can I return items purchased on sale?",
      answer: "Yes, sale items can be returned within the 30-day window, unless marked as 'Final Sale'."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, Apple Pay, Google Pay, and bank transfers."
    },
    {
      question: "How do you protect my payment information?",
      answer: "We use industry-standard SSL encryption and never store your payment information on our servers."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-primary-glow/5 to-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-elegant">
              <FileText className="h-4 w-4" />
              <span>Terms of Service</span>
            </div>
            
            <h1 className="text-display text-foreground mb-6">
              Terms of
              <span className="block text-gradient-primary"> 
                Service
              </span>
            </h1>
            
            <p className="text-body text-muted-foreground max-w-3xl mx-auto">
              These terms govern your use of our website and services. By using our platform, 
              you agree to these terms and our privacy policy.
            </p>
          </div>

          {/* Terms Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {termsSections.map((section, index) => (
              <Card key={index} className="text-center bg-card border-0 shadow-elegant hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <section.icon className="h-8 w-8 text-primary" />
                  </div>
                  
                  <h3 className="text-subheading text-foreground mb-4">
                    {section.title}
                  </h3>
                  
                  <p className="text-body text-muted-foreground">
                    {section.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Account Terms */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading text-foreground mb-6">
              Account
              <span className="block text-gradient-primary"> 
                Terms
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {accountTerms.map((term, index) => (
              <Card key={index} className="bg-card border-0 shadow-elegant">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    
                    <div>
                      <h3 className="text-subheading text-foreground mb-2">
                        {term.term}
                      </h3>
                      
                      <p className="text-body text-muted-foreground">
                        {term.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Order Terms */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading text-foreground mb-6">
              Order
              <span className="block text-gradient-primary"> 
                Terms
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {orderTerms.map((term, index) => (
              <Card key={index} className="bg-card border-0 shadow-elegant">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    
                    <div>
                      <h3 className="text-subheading text-foreground mb-2">
                        {term.term}
                      </h3>
                      
                      <p className="text-body text-muted-foreground">
                        {term.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Prohibited Activities */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading text-foreground mb-6">
              Prohibited
              <span className="block text-gradient-primary"> 
                Activities
              </span>
            </h2>
          </div>

          <Card className="max-w-4xl mx-auto bg-card border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="text-subheading text-foreground flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Activities Not Allowed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prohibitedActivities.map((activity, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
                    <span className="text-body text-muted-foreground">{activity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* User & Company Obligations */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* User Obligations */}
            <div>
              <div className="text-center mb-12">
                <h2 className="text-heading text-foreground mb-6">
                  Your
                  <span className="block text-gradient-primary"> 
                    Obligations
                  </span>
                </h2>
              </div>

              <div className="space-y-6">
                {userObligations.map((obligation, index) => (
                  <Card key={index} className="bg-card border-0 shadow-elegant">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="h-6 w-6 text-primary" />
                        </div>
                        
                        <div>
                          <h3 className="text-subheading text-foreground mb-2">
                            {obligation.obligation}
                          </h3>
                          
                          <p className="text-body text-muted-foreground">
                            {obligation.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Company Obligations */}
            <div>
              <div className="text-center mb-12">
                <h2 className="text-heading text-foreground mb-6">
                  Our
                  <span className="block text-gradient-primary"> 
                    Obligations
                  </span>
                </h2>
              </div>

              <div className="space-y-6">
                {companyObligations.map((obligation, index) => (
                  <Card key={index} className="bg-card border-0 shadow-elegant">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Shield className="h-6 w-6 text-primary" />
                        </div>
                        
                        <div>
                          <h3 className="text-subheading text-foreground mb-2">
                            {obligation.obligation}
                          </h3>
                          
                          <p className="text-body text-muted-foreground">
                            {obligation.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Liability Limitations */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading text-foreground mb-6">
              Liability
              <span className="block text-gradient-primary"> 
                Limitations
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {liabilityLimitations.map((limitation, index) => (
              <Card key={index} className="bg-card border-0 shadow-elegant">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-warning/20 to-warning/80 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Scale className="h-6 w-6 text-warning" />
                    </div>
                    
                    <div>
                      <h3 className="text-subheading text-foreground mb-2">
                        {limitation.limitation}
                      </h3>
                      
                      <p className="text-body text-muted-foreground">
                        {limitation.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {faqs.map((faq, index) => (
                <Card key={index} className="bg-card border-0 shadow-elegant">
                  <CardContent className="p-6">
                    <h3 className="text-subheading text-foreground mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      {faq.question}
                    </h3>
                    <p className="text-body text-muted-foreground">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                <Zap className="h-4 w-4" />
                <span className="text-sm font-medium">Questions About Terms?</span>
              </div>
              
              <h3 className="text-subheading text-white mb-4">
                Contact Our Legal Team
              </h3>
              
              <p className="text-body text-white/80 mb-8 max-w-2xl mx-auto">
                Have questions about our terms of service or legal policies? 
                Our legal team is here to help clarify any concerns.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button size="lg" className="btn-primary group">
                    <FileText className="h-5 w-5 mr-2" />
                    Contact Legal Team
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/privacy">
                  <Button variant="outline" size="lg" className="btn-ghost border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-md">
                    <Lock className="h-5 w-5 mr-2" />
                    Privacy Policy
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Terms;
