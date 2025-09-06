import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cookie, Settings, Shield, Eye, ArrowRight, Star, Zap, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { Link } from "react-router-dom";

const Cookies = () => {
  const cookieTypes = [
    {
      icon: Shield,
      title: "Essential Cookies",
      description: "Required for basic website functionality",
      examples: ["Authentication", "Security", "Session management"],
      necessary: true,
      color: "text-success"
    },
    {
      icon: Settings,
      title: "Functional Cookies",
      description: "Enhance user experience and remember preferences",
      examples: ["Language settings", "Theme preferences", "Form data"],
      necessary: false,
      color: "text-primary"
    },
    {
      icon: Eye,
      title: "Analytics Cookies",
      description: "Help us understand how visitors use our website",
      examples: ["Page views", "User behavior", "Performance metrics"],
      necessary: false,
      color: "text-info"
    },
    {
      icon: Cookie,
      title: "Marketing Cookies",
      description: "Used for advertising and marketing purposes",
      examples: ["Targeted ads", "Social media integration", "Retargeting"],
      necessary: false,
      color: "text-warning"
    }
  ];

  const cookieDetails = [
    {
      name: "session_id",
      type: "Essential",
      purpose: "Maintains your session while browsing",
      duration: "Session",
      provider: "PhoneHub"
    },
    {
      name: "auth_token",
      type: "Essential",
      purpose: "Keeps you logged in securely",
      duration: "30 days",
      provider: "PhoneHub"
    },
    {
      name: "language_pref",
      type: "Functional",
      purpose: "Remembers your language preference",
      duration: "1 year",
      provider: "PhoneHub"
    },
    {
      name: "theme_pref",
      type: "Functional",
      purpose: "Remembers your theme preference",
      duration: "1 year",
      provider: "PhoneHub"
    },
    {
      name: "_ga",
      type: "Analytics",
      purpose: "Google Analytics tracking",
      duration: "2 years",
      provider: "Google"
    },
    {
      name: "_fbp",
      type: "Marketing",
      purpose: "Facebook pixel tracking",
      duration: "3 months",
      provider: "Facebook"
    }
  ];

  const cookieManagement = [
    {
      step: "01",
      title: "Access Settings",
      description: "Click the cookie settings button in the footer"
    },
    {
      step: "02",
      title: "Review Categories",
      description: "Review each cookie category and its purpose"
    },
    {
      step: "03",
      title: "Make Choices",
      description: "Enable or disable cookies based on your preferences"
    },
    {
      step: "04",
      title: "Save Settings",
      description: "Your preferences will be saved and applied immediately"
    }
  ];

  const browserSettings = [
    {
      browser: "Chrome",
      instructions: "Settings > Privacy and security > Cookies and other site data"
    },
    {
      browser: "Firefox",
      instructions: "Options > Privacy & Security > Cookies and Site Data"
    },
    {
      browser: "Safari",
      instructions: "Preferences > Privacy > Manage Website Data"
    },
    {
      browser: "Edge",
      instructions: "Settings > Cookies and site permissions > Cookies and site data"
    }
  ];

  const faqs = [
    {
      question: "What are cookies?",
      answer: "Cookies are small text files stored on your device that help websites remember information about your visit, such as your preferences and login status."
    },
    {
      question: "Why do you use cookies?",
      answer: "We use cookies to provide essential website functionality, improve user experience, analyze site usage, and deliver personalized content and advertisements."
    },
    {
      question: "Can I disable cookies?",
      answer: "Yes, you can disable cookies through your browser settings or our cookie preferences. However, some features may not work properly without essential cookies."
    },
    {
      question: "How long do cookies last?",
      answer: "Cookie duration varies by type. Session cookies last only during your visit, while persistent cookies can last from a few days to several years."
    },
    {
      question: "Do you share cookie data?",
      answer: "We may share cookie data with trusted third-party service providers who help us operate our website and provide services to you."
    },
    {
      question: "How do I manage my cookie preferences?",
      answer: "You can manage your cookie preferences through our cookie settings panel, accessible via the footer link, or through your browser settings."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-primary-glow/5 to-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-info to-info/80 text-info-foreground px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-elegant">
              <Cookie className="h-4 w-4" />
              <span>Cookie Policy</span>
            </div>
            
            <h1 className="text-display text-foreground mb-6">
              Cookie
              <span className="block text-gradient-primary"> 
                Policy
              </span>
            </h1>
            
            <p className="text-body text-muted-foreground max-w-3xl mx-auto">
              We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
              Learn more about how we use cookies and how to manage your preferences.
            </p>
          </div>

          {/* Cookie Types */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {cookieTypes.map((type, index) => (
              <Card key={index} className="bg-card border-0 shadow-elegant hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <type.icon className={`h-6 w-6 ${type.color}`} />
                    </div>
                    {type.necessary && (
                      <Badge className="bg-success text-success-foreground text-xs">
                        Necessary
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-subheading text-foreground mb-3">
                    {type.title}
                  </h3>
                  
                  <p className="text-body text-muted-foreground mb-4">
                    {type.description}
                  </p>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 text-sm">Examples:</h4>
                    <ul className="space-y-1">
                      {type.examples.map((example, idx) => (
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

      {/* Cookie Details */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading text-foreground mb-6">
              Detailed Cookie
              <span className="block text-gradient-primary"> 
                Information
              </span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="bg-card border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="text-subheading text-foreground flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Cookie Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Cookie Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Type</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Purpose</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Duration</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Provider</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cookieDetails.map((cookie, index) => (
                        <tr key={index} className="border-b border-border/50">
                          <td className="py-3 px-4 text-sm font-mono text-foreground">{cookie.name}</td>
                          <td className="py-3 px-4">
                            <Badge variant="secondary" className="text-xs">
                              {cookie.type}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{cookie.purpose}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{cookie.duration}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{cookie.provider}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Cookie Management */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading text-foreground mb-6">
              Manage Your
              <span className="block text-gradient-primary"> 
                Cookie Preferences
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {cookieManagement.map((step, index) => (
              <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto text-white font-bold text-lg relative z-10 shadow-glow">
                    {step.step}
                  </div>
                  {index < cookieManagement.length - 1 && (
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

      {/* Browser Settings */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading text-foreground mb-6">
              Browser Cookie
              <span className="block text-gradient-primary"> 
                Settings
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {browserSettings.map((browser, index) => (
              <Card key={index} className="bg-card border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="text-subheading text-foreground">
                    {browser.browser}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-body text-muted-foreground">
                    {browser.instructions}
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
              Cookie
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
                      <Cookie className="h-4 w-4 text-primary" />
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
                <span className="text-sm font-medium">Manage Your Privacy</span>
              </div>
              
              <h3 className="text-subheading text-white mb-4">
                Take Control of Your Cookie Preferences
              </h3>
              
              <p className="text-body text-white/80 mb-8 max-w-2xl mx-auto">
                Customize your cookie settings to control how we use cookies and similar technologies 
                to enhance your browsing experience.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="btn-primary group">
                  <Settings className="h-5 w-5 mr-2" />
                  Cookie Settings
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Link to="/privacy">
                  <Button variant="outline" size="lg" className="btn-ghost border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-md">
                    <Shield className="h-5 w-5 mr-2" />
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

export default Cookies;
