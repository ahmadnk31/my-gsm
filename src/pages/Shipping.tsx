import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Clock, MapPin, Package, Shield, ArrowRight, Star, Zap, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Shipping = () => {
  const shippingOptions = [
    {
      name: "Standard Shipping",
      price: "Free",
      duration: "3-5 business days",
      description: "Free shipping on orders over $50",
      features: ["Tracking included", "Signature not required", "Standard handling"],
      icon: Truck,
      popular: false
    },
    {
      name: "Express Shipping",
      price: "$9.99",
      duration: "1-2 business days",
      description: "Fast delivery for urgent orders",
      features: ["Priority handling", "Tracking included", "Signature required"],
      icon: Clock,
      popular: true
    },
    {
      name: "Same Day Delivery",
      price: "$19.99",
      duration: "Same day",
      description: "Available in select areas",
      features: ["Local delivery", "Real-time tracking", "Signature required"],
      icon: Zap,
      popular: false
    }
  ];

  const shippingFeatures = [
    {
      icon: Package,
      title: "Secure Packaging",
      description: "All items are carefully packaged to ensure safe delivery"
    },
    {
      icon: Shield,
      title: "Insurance Included",
      description: "All shipments include basic insurance coverage"
    },
    {
      icon: MapPin,
      title: "Real-time Tracking",
      description: "Track your package from warehouse to doorstep"
    },
    {
      icon: CheckCircle,
      title: "Delivery Confirmation",
      description: "Get notified when your package is delivered"
    }
  ];

  const deliveryAreas = [
    {
      region: "Continental US",
      deliveryTime: "3-5 business days",
      cost: "Free over $50",
      restrictions: "No restrictions"
    },
    {
      region: "Alaska & Hawaii",
      deliveryTime: "5-7 business days",
      cost: "$15.99",
      restrictions: "Some items may be restricted"
    },
    {
      region: "Puerto Rico",
      deliveryTime: "7-10 business days",
      cost: "$25.99",
      restrictions: "Battery restrictions apply"
    },
    {
      region: "International",
      deliveryTime: "10-15 business days",
      cost: "$45.99",
      restrictions: "Currently unavailable"
    }
  ];

  const trackingInfo = [
    {
      step: "Order Placed",
      description: "Your order is confirmed and being processed",
      icon: CheckCircle
    },
    {
      step: "Processing",
      description: "Your items are being prepared for shipment",
      icon: Package
    },
    {
      step: "Shipped",
      description: "Your package is on its way to you",
      icon: Truck
    },
    {
      step: "Out for Delivery",
      description: "Your package is being delivered today",
      icon: MapPin
    },
    {
      step: "Delivered",
      description: "Your package has been successfully delivered",
      icon: CheckCircle
    }
  ];

  const faqs = [
    {
      question: "How long does shipping take?",
      answer: "Standard shipping takes 3-5 business days, express shipping takes 1-2 business days, and same-day delivery is available in select areas."
    },
    {
      question: "Do you ship internationally?",
      answer: "Currently, we only ship within the United States. We're working on expanding our international shipping options."
    },
    {
      question: "How can I track my order?",
      answer: "You can track your order by logging into your account, using the tracking number from your confirmation email, or contacting our customer service team."
    },
    {
      question: "What if my package is damaged?",
      answer: "If your package arrives damaged, please contact us within 48 hours with photos. We'll arrange a replacement or refund."
    },
    {
      question: "Can I change my shipping address?",
      answer: "You can change your shipping address within 1 hour of placing your order. After that, please contact customer service immediately."
    },
    {
      question: "Do you offer free shipping?",
      answer: "Yes, we offer free standard shipping on all orders over $50. Free shipping applies to continental US addresses only."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-primary-glow/5 to-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-elegant">
              <Truck className="h-4 w-4" />
              <span>Shipping Information</span>
            </div>
            
            <h1 className="text-display text-foreground mb-6">
              Fast & Reliable
              <span className="block text-gradient-primary"> 
                Shipping
              </span>
            </h1>
            
            <p className="text-body text-muted-foreground max-w-3xl mx-auto">
              Get your devices and accessories delivered quickly and securely. We offer multiple shipping options 
              to meet your needs, with free shipping on orders over $50.
            </p>
          </div>

          {/* Shipping Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {shippingOptions.map((option, index) => (
              <Card 
                key={index} 
                className={`relative bg-card border-0 shadow-elegant hover:shadow-glow transition-all duration-300 hover:-translate-y-2 ${
                  option.popular ? 'ring-2 ring-primary' : ''
                }`}
              >
                {option.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <option.icon className="h-8 w-8 text-primary" />
                  </div>
                  
                  <CardTitle className="text-subheading text-foreground">
                    {option.name}
                  </CardTitle>
                  
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-bold text-primary">
                      {option.price}
                    </span>
                    <Badge variant="secondary" className="text-sm">
                      {option.duration}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-body text-muted-foreground text-center">
                    {option.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {option.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Shipping Features */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading text-foreground mb-6">
              Why Choose Our
              <span className="block text-gradient-primary"> 
                Shipping
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {shippingFeatures.map((feature, index) => (
              <Card key={index} className="text-center bg-card border-0 shadow-elegant hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  
                  <h3 className="text-subheading text-foreground mb-4">
                    {feature.title}
                  </h3>
                  
                  <p className="text-body text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Areas */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading text-foreground mb-6">
              Delivery
              <span className="block text-gradient-primary"> 
                Areas
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {deliveryAreas.map((area, index) => (
              <Card key={index} className="bg-card border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="text-subheading text-foreground">
                    {area.region}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">{area.deliveryTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">{area.cost}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">{area.restrictions}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tracking Process */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading text-foreground mb-6">
              Track Your
              <span className="block text-gradient-primary"> 
                Package
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {trackingInfo.map((step, index) => (
              <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto text-white relative z-10 shadow-glow">
                    <step.icon className="h-8 w-8" />
                  </div>
                  {index < trackingInfo.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-8 h-0.5 bg-gradient-to-r from-primary to-primary-glow"></div>
                  )}
                </div>
                
                <h3 className="text-subheading text-foreground mb-3">
                  {step.step}
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
                <Truck className="h-4 w-4" />
                <span className="text-sm font-medium">Ready to Order?</span>
              </div>
              
              <h3 className="text-subheading text-white mb-4">
                Start Shopping Today
              </h3>
              
              <p className="text-body text-white/80 mb-8 max-w-2xl mx-auto">
                Browse our selection of smartphones and accessories with fast, reliable shipping 
                and excellent customer service.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/accessories">
                  <Button size="lg" className="btn-primary group">
                    <Package className="h-5 w-5 mr-2" />
                    Shop Accessories
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="lg" className="btn-ghost border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-md">
                    <Shield className="h-5 w-5 mr-2" />
                    Contact Support
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

export default Shipping;
