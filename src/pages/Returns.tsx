import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Clock, Shield, CheckCircle, AlertTriangle, FileText, ArrowRight, Star, Zap, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

const Returns = () => {
  const returnPolicy = [
    {
      icon: Clock,
      title: "30-Day Return Window",
      description: "Return eligible items within 30 days of delivery",
      details: "Most items can be returned within 30 days of delivery for a full refund or exchange."
    },
    {
      icon: Package,
      title: "Original Condition",
      description: "Items must be in original condition with all packaging",
      details: "Products must be unused, undamaged, and include all original packaging, manuals, and accessories."
    },
    {
      icon: Shield,
      title: "Free Return Shipping",
      description: "Free return shipping for defective items",
      details: "We provide free return shipping labels for defective items. Customer pays return shipping for non-defective returns."
    },
    {
      icon: CheckCircle,
      title: "Quick Refund Process",
      description: "Refunds processed within 5-7 business days",
      details: "Once we receive your return, we'll process your refund within 5-7 business days."
    }
  ];

  const returnProcess = [
    {
      step: "01",
      title: "Initiate Return",
      description: "Log into your account and select the item to return"
    },
    {
      step: "02",
      title: "Print Label",
      description: "Download and print your return shipping label"
    },
    {
      step: "03",
      title: "Package Item",
      description: "Securely package the item with all original contents"
    },
    {
      step: "04",
      title: "Ship Return",
      description: "Drop off your package at any authorized shipping location"
    },
    {
      step: "05",
      title: "Receive Refund",
      description: "Get your refund within 5-7 business days"
    }
  ];

  const returnReasons = [
    {
      reason: "Defective Product",
      eligible: true,
      timeframe: "30 days",
      shipping: "Free",
      notes: "Product doesn't work as expected or has manufacturing defects"
    },
    {
      reason: "Wrong Item Received",
      eligible: true,
      timeframe: "30 days",
      shipping: "Free",
      notes: "Received different item than ordered"
    },
    {
      reason: "Changed Mind",
      eligible: true,
      timeframe: "30 days",
      shipping: "Customer pays",
      notes: "Simply changed your mind about the purchase"
    },
    {
      reason: "Damaged in Transit",
      eligible: true,
      timeframe: "7 days",
      shipping: "Free",
      notes: "Item arrived damaged due to shipping"
    },
    {
      reason: "Used/Damaged Item",
      eligible: false,
      timeframe: "N/A",
      shipping: "N/A",
      notes: "Item shows signs of use or damage"
    },
    {
      reason: "Missing Accessories",
      eligible: false,
      timeframe: "N/A",
      shipping: "N/A",
      notes: "Original packaging or accessories are missing"
    }
  ];

  const nonReturnableItems = [
    "Downloadable software or digital content",
    "Personalized or custom items",
    "Gift cards",
    "Items marked as 'Final Sale'",
    "Items purchased from third-party sellers",
    "Items that have been used, damaged, or modified"
  ];

  const faqs = [
    {
      question: "How do I start a return?",
      answer: "Log into your account, go to 'My Orders', select the item you want to return, and follow the return process. You can also contact our customer service team for assistance."
    },
    {
      question: "How long does it take to get my refund?",
      answer: "Once we receive your return, we process refunds within 5-7 business days. The time it takes for the refund to appear in your account depends on your bank or credit card issuer."
    },
    {
      question: "Can I exchange an item instead of returning it?",
      answer: "Yes, you can exchange an item for a different size, color, or model. The exchange process is similar to returns, and you'll only pay the difference if the new item costs more."
    },
    {
      question: "What if I received a damaged item?",
      answer: "If you received a damaged item, please contact us within 7 days of delivery. We'll provide a free return shipping label and send you a replacement or issue a refund."
    },
    {
      question: "Do I need the original packaging?",
      answer: "Yes, items must be returned in their original packaging with all accessories, manuals, and protective materials included. Missing packaging may result in a restocking fee."
    },
    {
      question: "Can I return items purchased on sale?",
      answer: "Yes, sale items can be returned within the 30-day window, unless they are marked as 'Final Sale'. Sale items are subject to the same return conditions as regular-priced items."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-primary-glow/5 to-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-success to-success/80 text-success-foreground px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-elegant">
              <RefreshCw className="h-4 w-4" />
              <span>Returns & Exchanges</span>
            </div>
            
            <h1 className="text-display text-foreground mb-6">
              Easy Returns &
              <span className="block text-gradient-primary"> 
                Exchanges
              </span>
            </h1>
            
            <p className="text-body text-muted-foreground max-w-3xl mx-auto">
              Not satisfied with your purchase? We make returns and exchanges simple and hassle-free. 
              Most items can be returned within 30 days for a full refund or exchange.
            </p>
          </div>

          {/* Return Policy Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {returnPolicy.map((policy, index) => (
              <Card key={index} className="text-center bg-card border-0 shadow-elegant hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <policy.icon className="h-8 w-8 text-primary" />
                  </div>
                  
                  <h3 className="text-subheading text-foreground mb-3">
                    {policy.title}
                  </h3>
                  
                  <p className="text-body text-muted-foreground mb-4">
                    {policy.description}
                  </p>
                  
                  <p className="text-sm text-muted-foreground">
                    {policy.details}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Return Process */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading text-foreground mb-6">
              Simple Return
              <span className="block text-gradient-primary"> 
                Process
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {returnProcess.map((step, index) => (
              <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto text-white font-bold text-lg relative z-10 shadow-glow">
                    {step.step}
                  </div>
                  {index < returnProcess.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-8 h-0.5 bg-gradient-to-r from-primary to-primary-glow"></div>
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

      {/* Return Reasons */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading text-foreground mb-6">
              Return
              <span className="block text-gradient-primary"> 
                Eligibility
              </span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {returnReasons.map((reason, index) => (
                <Card key={index} className="bg-card border-0 shadow-elegant">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        reason.eligible 
                          ? 'bg-gradient-to-br from-success/20 to-success/80' 
                          : 'bg-gradient-to-br from-warning/20 to-warning/80'
                      }`}>
                        {reason.eligible ? (
                          <CheckCircle className="h-6 w-6 text-success" />
                        ) : (
                          <AlertTriangle className="h-6 w-6 text-warning" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-subheading text-foreground mb-2">
                          {reason.reason}
                        </h3>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground">Timeframe: {reason.timeframe}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground">Shipping: {reason.shipping}</span>
                          </div>
                          <p className="text-muted-foreground">
                            {reason.notes}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Non-Returnable Items */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading text-foreground mb-6">
              Non-Returnable
              <span className="block text-gradient-primary"> 
                Items
              </span>
            </h2>
          </div>

          <Card className="max-w-4xl mx-auto bg-card border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="text-subheading text-foreground flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Items That Cannot Be Returned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nonReturnableItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
                    <span className="text-body text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
                      <Star className="h-4 w-4 text-primary" />
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
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Need Help?</span>
              </div>
              
              <h3 className="text-subheading text-white mb-4">
                Questions About Returns?
              </h3>
              
              <p className="text-body text-white/80 mb-8 max-w-2xl mx-auto">
                Our customer service team is here to help with any questions about returns, 
                exchanges, or refunds. Contact us for personalized assistance.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button size="lg" className="btn-primary group">
                    <Shield className="h-5 w-5 mr-2" />
                    Contact Support
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/faq">
                  <Button variant="outline" size="lg" className="btn-ghost border-2 border-white/30 hover:text-white hover:scale-105 hover:bg-white/10 backdrop-blur-md">
                    <FileText className="h-5 w-5 mr-2" />
                    View FAQ
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

export default Returns;
