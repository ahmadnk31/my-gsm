import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Video, FileText, MessageSquare, Phone, Mail, ArrowRight, Search, HelpCircle, Shield, Wrench, ShoppingCart, Truck, CreditCard, Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Support = () => {
  const supportCategories = [
    {
      icon: ShoppingCart,
      title: "Orders & Shipping",
      description: "Track orders, shipping info, and delivery updates",
      articles: 12,
      color: "text-primary"
    },
    {
      icon: Wrench,
      title: "Repairs & Service",
      description: "Repair guides, service status, and troubleshooting",
      articles: 8,
      color: "text-success"
    },
    {
      icon: Shield,
      title: "Warranty & Returns",
      description: "Warranty claims, return policies, and refunds",
      articles: 6,
      color: "text-warning"
    },
    {
      icon: CreditCard,
      title: "Payment & Billing",
      description: "Payment methods, billing issues, and financing",
      articles: 5,
      color: "text-info"
    },
    {
      icon: Truck,
      title: "Shipping & Returns",
      description: "Shipping options, return process, and tracking",
      articles: 7,
      color: "text-primary"
    },
    {
      icon: MessageSquare,
      title: "Account & Settings",
      description: "Account management, preferences, and security",
      articles: 4,
      color: "text-success"
    }
  ];

  const helpArticles = [
    {
      category: "Orders & Shipping",
      title: "How to Track Your Order",
      description: "Learn how to track your order status and get delivery updates",
      readTime: "3 min read",
      popular: true
    },
    {
      category: "Repairs & Service",
      title: "Common Phone Issues & Solutions",
      description: "Troubleshooting guide for common smartphone problems",
      readTime: "5 min read",
      popular: true
    },
    {
      category: "Warranty & Returns",
      title: "Understanding Your Warranty Coverage",
      description: "Complete guide to warranty terms and coverage details",
      readTime: "4 min read",
      popular: false
    },
    {
      category: "Payment & Billing",
      title: "Accepted Payment Methods",
      description: "Overview of all accepted payment options and security",
      readTime: "2 min read",
      popular: false
    },
    {
      category: "Shipping & Returns",
      title: "Return Policy & Process",
      description: "Step-by-step guide to returning items and getting refunds",
      readTime: "4 min read",
      popular: true
    },
    {
      category: "Account & Settings",
      title: "Managing Your Account",
      description: "How to update account information and preferences",
      readTime: "3 min read",
      popular: false
    }
  ];

  const videoTutorials = [
    {
      title: "Setting Up Your New Device",
      duration: "5:23",
      thumbnail: "📱",
      description: "Complete setup guide for new smartphones"
    },
    {
      title: "Troubleshooting Common Issues",
      duration: "8:45",
      thumbnail: "🔧",
      description: "Step-by-step troubleshooting for common problems"
    },
    {
      title: "Understanding Warranty Coverage",
      duration: "4:12",
      thumbnail: "🛡️",
      description: "Explaining warranty terms and coverage"
    },
    {
      title: "Return Process Guide",
      duration: "3:56",
      thumbnail: "📦",
      description: "How to return items and get refunds"
    }
  ];

  const contactOptions = [
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak with our expert team",
      contact: "+1 (555) 123-4567",
      availability: "Mon-Fri: 9AM-7PM",
      response: "Immediate",
      color: "text-primary"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Get detailed responses via email",
      contact: "support@phonehub.com",
      availability: "24/7",
      response: "Within 24 hours",
      color: "text-success"
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Instant help from our team",
      contact: "Available on website",
      availability: "Mon-Sun: 8AM-10PM",
      response: "Instant",
      color: "text-warning"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-primary-glow/5 to-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-info to-info/80 text-info-foreground px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-elegant">
              <HelpCircle className="h-4 w-4" />
              <span>Support Center</span>
            </div>
            
            <h1 className="text-display text-foreground mb-6">
              How Can We
              <span className="block text-gradient-primary"> 
                Help You?
              </span>
            </h1>
            
            <p className="text-body text-muted-foreground max-w-3xl mx-auto">
              Find answers to your questions, troubleshoot issues, and get expert guidance. 
              Our comprehensive support center has everything you need to get the most out of your devices.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for help articles, guides, and solutions..."
                className="w-full pl-12 pr-4 py-4 text-lg bg-card border-0 shadow-elegant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Support Categories */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading text-foreground mb-6">
              Browse Support
              <span className="block text-gradient-primary"> 
                Categories
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {supportCategories.map((category, index) => (
              <Card key={index} className="bg-card border-0 shadow-elegant hover:shadow-glow transition-all duration-300 hover:-translate-y-2 cursor-pointer">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <category.icon className={`h-6 w-6 ${category.color}`} />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-subheading text-foreground mb-2">
                        {category.title}
                      </h3>
                      
                      <p className="text-body text-muted-foreground mb-4">
                        {category.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {category.articles} articles
                        </Badge>
                        
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Help Articles */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading text-foreground mb-6">
              Popular Help
              <span className="block text-gradient-primary"> 
                Articles
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {helpArticles.map((article, index) => (
              <Card key={index} className="bg-card border-0 shadow-elegant hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <BookOpen className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <Badge variant="secondary" className="text-xs mb-2">
                        {article.category}
                      </Badge>
                      {article.popular && (
                        <Badge className="bg-warning text-warning-foreground text-xs ml-2">
                          Popular
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-subheading text-foreground mb-3">
                    {article.title}
                  </h3>
                  
                  <p className="text-body text-muted-foreground mb-4">
                    {article.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {article.readTime}
                    </span>
                    
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                      Read More
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Video Tutorials */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading text-foreground mb-6">
              Video
              <span className="block text-gradient-primary"> 
                Tutorials
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {videoTutorials.map((video, index) => (
              <Card key={index} className="bg-card border-0 shadow-elegant hover:shadow-glow transition-all duration-300 hover:-translate-y-2 cursor-pointer">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">{video.thumbnail}</div>
                    <Badge variant="secondary" className="text-xs">
                      {video.duration}
                    </Badge>
                  </div>
                  
                  <h3 className="text-subheading text-foreground mb-3 text-center">
                    {video.title}
                  </h3>
                  
                  <p className="text-body text-muted-foreground text-center">
                    {video.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading text-foreground mb-6">
              Get in
              <span className="block text-gradient-primary"> 
                Touch
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactOptions.map((option, index) => (
              <Card key={index} className="text-center bg-card border-0 shadow-elegant hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <option.icon className={`h-8 w-8 ${option.color}`} />
                  </div>
                  
                  <h3 className="text-subheading text-foreground mb-3">
                    {option.title}
                  </h3>
                  
                  <p className="text-body text-muted-foreground mb-4">
                    {option.description}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="font-semibold text-foreground">
                      {option.contact}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {option.availability}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Response: {option.response}
                    </div>
                  </div>
                  
                  <Button className="w-full btn-primary">
                    Contact {option.title}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
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
                <span className="text-sm font-medium">Need More Help?</span>
              </div>
              
              <h3 className="text-subheading text-white mb-4">
                Can't Find What You're Looking For?
              </h3>
              
              <p className="text-body text-white/80 mb-8 max-w-2xl mx-auto">
                Our expert support team is here to help with personalized assistance. 
                Contact us directly for immediate help with your specific questions.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button size="lg" className="btn-primary group">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Contact Support
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/faq">
                  <Button variant="outline" size="lg" className="btn-ghost border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-md">
                    <HelpCircle className="h-5 w-5 mr-2" />
                    Browse FAQ
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

export default Support;
