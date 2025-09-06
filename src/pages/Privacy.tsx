import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, Lock, Users, Database, ArrowRight, Star, Zap, CheckCircle, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const Privacy = () => {
  const privacyPrinciples = [
    {
      icon: Shield,
      title: "Data Protection",
      description: "We protect your personal information with industry-standard security measures"
    },
    {
      icon: Eye,
      title: "Transparency",
      description: "We're transparent about how we collect, use, and share your data"
    },
    {
      icon: Lock,
      title: "Security",
      description: "Your data is encrypted and stored securely using advanced technologies"
    },
    {
      icon: Users,
      title: "Control",
      description: "You have full control over your personal information and privacy settings"
    }
  ];

  const dataCollection = [
    {
      category: "Personal Information",
      items: [
        "Name and contact information",
        "Billing and shipping addresses",
        "Payment information",
        "Account credentials"
      ]
    },
    {
      category: "Device Information",
      items: [
        "Device type and model",
        "Operating system",
        "Browser type and version",
        "IP address and location"
      ]
    },
    {
      category: "Usage Information",
      items: [
        "Website usage patterns",
        "Purchase history",
        "Search queries",
        "Customer service interactions"
      ]
    },
    {
      category: "Technical Information",
      items: [
        "Cookies and tracking technologies",
        "Log files and analytics data",
        "Performance metrics",
        "Error reports"
      ]
    }
  ];

  const dataUsage = [
    {
      purpose: "Order Processing",
      description: "Process and fulfill your orders, send order confirmations and updates",
      examples: ["Payment processing", "Shipping coordination", "Order tracking"]
    },
    {
      purpose: "Customer Service",
      description: "Provide customer support and respond to your inquiries",
      examples: ["Technical support", "Returns processing", "Account assistance"]
    },
    {
      purpose: "Personalization",
      description: "Personalize your experience and provide relevant recommendations",
      examples: ["Product recommendations", "Customized content", "Targeted offers"]
    },
    {
      purpose: "Security & Fraud Prevention",
      description: "Protect against fraud and ensure account security",
      examples: ["Identity verification", "Fraud detection", "Account protection"]
    },
    {
      purpose: "Analytics & Improvement",
      description: "Analyze usage patterns to improve our services",
      examples: ["Website optimization", "Product development", "Service improvements"]
    },
    {
      purpose: "Legal Compliance",
      description: "Comply with legal obligations and regulatory requirements",
      examples: ["Tax reporting", "Legal proceedings", "Regulatory compliance"]
    }
  ];

  const dataSharing = [
    {
      partner: "Payment Processors",
      purpose: "Process payments securely",
      data: "Payment information, billing details",
      protection: "PCI DSS compliant"
    },
    {
      partner: "Shipping Partners",
      purpose: "Deliver your orders",
      data: "Name, address, contact information",
      protection: "Contractual safeguards"
    },
    {
      partner: "Service Providers",
      purpose: "Support our operations",
      data: "Limited access as needed",
      protection: "Data processing agreements"
    },
    {
      partner: "Legal Authorities",
      purpose: "Comply with legal requirements",
      data: "As required by law",
      protection: "Legal compliance only"
    }
  ];

  const userRights = [
    {
      right: "Access",
      description: "Request access to your personal information",
      icon: Eye
    },
    {
      right: "Correction",
      description: "Request correction of inaccurate information",
      icon: CheckCircle
    },
    {
      right: "Deletion",
      description: "Request deletion of your personal information",
      icon: AlertTriangle
    },
    {
      right: "Portability",
      description: "Request a copy of your data in a portable format",
      icon: Database
    },
    {
      right: "Restriction",
      description: "Request restriction of data processing",
      icon: Lock
    },
    {
      right: "Objection",
      description: "Object to certain types of data processing",
      icon: Shield
    }
  ];

  const securityMeasures = [
    {
      measure: "Encryption",
      description: "All data is encrypted in transit and at rest using industry-standard protocols"
    },
    {
      measure: "Access Controls",
      description: "Strict access controls limit who can access your personal information"
    },
    {
      measure: "Regular Audits",
      description: "We conduct regular security audits and assessments"
    },
    {
      measure: "Employee Training",
      description: "All employees receive privacy and security training"
    },
    {
      measure: "Incident Response",
      description: "We have procedures in place to respond to security incidents"
    },
    {
      measure: "Data Minimization",
      description: "We only collect and retain the data necessary for our services"
    }
  ];

  const faqs = [
    {
      question: "How do you protect my personal information?",
      answer: "We use industry-standard security measures including encryption, access controls, regular security audits, and employee training to protect your personal information."
    },
    {
      question: "Do you sell my personal information?",
      answer: "No, we do not sell your personal information to third parties. We only share data as described in this privacy policy and with your consent."
    },
    {
      question: "How long do you keep my data?",
      answer: "We retain your personal information only as long as necessary to provide our services, comply with legal obligations, and resolve disputes."
    },
    {
      question: "Can I request deletion of my data?",
      answer: "Yes, you can request deletion of your personal information by contacting our privacy team. We'll process your request within 30 days."
    },
    {
      question: "Do you use cookies?",
      answer: "Yes, we use cookies and similar technologies to improve your experience, analyze usage, and provide personalized content."
    },
    {
      question: "How can I update my privacy preferences?",
      answer: "You can update your privacy preferences in your account settings or contact our privacy team for assistance."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-primary-glow/5 to-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-elegant">
              <Shield className="h-4 w-4" />
              <span>Privacy Policy</span>
            </div>
            
            <h1 className="text-display text-foreground mb-6">
              Your Privacy
              <span className="block text-gradient-primary"> 
                Matters
              </span>
            </h1>
            
            <p className="text-body text-muted-foreground max-w-3xl mx-auto">
              We are committed to protecting your privacy and ensuring the security of your personal information. 
              This policy explains how we collect, use, and protect your data.
            </p>
          </div>

          {/* Privacy Principles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {privacyPrinciples.map((principle, index) => (
              <Card key={index} className="text-center bg-card border-0 shadow-elegant hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <principle.icon className="h-8 w-8 text-primary" />
                  </div>
                  
                  <h3 className="text-subheading text-foreground mb-4">
                    {principle.title}
                  </h3>
                  
                  <p className="text-body text-muted-foreground">
                    {principle.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Data Collection */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading text-foreground mb-6">
              Information We
              <span className="block text-gradient-primary"> 
                Collect
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {dataCollection.map((category, index) => (
              <Card key={index} className="bg-card border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="text-subheading text-foreground">
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

      {/* Data Usage */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading text-foreground mb-6">
              How We Use
              <span className="block text-gradient-primary"> 
                Your Data
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dataUsage.map((usage, index) => (
              <Card key={index} className="bg-card border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="text-subheading text-foreground">
                    {usage.purpose}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-body text-muted-foreground">
                    {usage.description}
                  </p>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Examples:</h4>
                    <ul className="space-y-1">
                      {usage.examples.map((example, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                          <Star className="h-3 w-3 text-primary" />
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Data Sharing */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading text-foreground mb-6">
              Data
              <span className="block text-gradient-primary"> 
                Sharing
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {dataSharing.map((partner, index) => (
              <Card key={index} className="bg-card border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="text-subheading text-foreground">
                    {partner.partner}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="font-semibold text-foreground">Purpose:</span>
                    <p className="text-body text-muted-foreground">{partner.purpose}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Data Shared:</span>
                    <p className="text-body text-muted-foreground">{partner.data}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Protection:</span>
                    <p className="text-body text-muted-foreground">{partner.protection}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Rights */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading text-foreground mb-6">
              Your Privacy
              <span className="block text-gradient-primary"> 
                Rights
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {userRights.map((right, index) => (
              <Card key={index} className="bg-card border-0 shadow-elegant hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <right.icon className="h-6 w-6 text-primary" />
                    </div>
                    
                    <div>
                      <h3 className="text-subheading text-foreground mb-2">
                        {right.right}
                      </h3>
                      
                      <p className="text-body text-muted-foreground">
                        {right.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Measures */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading text-foreground mb-6">
              Security
              <span className="block text-gradient-primary"> 
                Measures
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityMeasures.map((measure, index) => (
              <Card key={index} className="bg-card border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="text-subheading text-foreground">
                    {measure.measure}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-body text-muted-foreground">
                    {measure.description}
                  </p>
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
              Privacy
              <span className="block text-gradient-primary"> 
                FAQ
              </span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {faqs.map((faq, index) => (
                <Card key={index} className="bg-card border-0 shadow-elegant">
                  <CardContent className="p-6">
                    <h3 className="text-subheading text-foreground mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
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
                <span className="text-sm font-medium">Questions About Privacy?</span>
              </div>
              
              <h3 className="text-subheading text-white mb-4">
                Contact Our Privacy Team
              </h3>
              
              <p className="text-body text-white/80 mb-8 max-w-2xl mx-auto">
                Have questions about your privacy rights or our data practices? 
                Our privacy team is here to help and ensure your rights are protected.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button size="lg" className="btn-primary group">
                    <Shield className="h-5 w-5 mr-2" />
                    Contact Privacy Team
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/terms">
                  <Button variant="outline" size="lg" className="btn-ghost border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-md">
                    <Lock className="h-5 w-5 mr-2" />
                    View Terms of Service
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

export default Privacy;
