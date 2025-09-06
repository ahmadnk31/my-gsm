import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, ArrowRight, Users, Shield, Zap, Star } from "lucide-react";
import { Link } from "react-router-dom";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak with our expert team",
      contact: "+1 (555) 123-4567",
      availability: "Mon-Fri: 9AM-7PM",
      color: "text-primary"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Get detailed responses via email",
      contact: "support@phonehub.com",
      availability: "24/7 Response",
      color: "text-success"
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Instant help from our team",
      contact: "Available on website",
      availability: "Mon-Sun: 8AM-10PM",
      color: "text-warning"
    }
  ];

  const departments = [
    {
      name: "General Inquiries",
      email: "info@phonehub.com",
      phone: "+1 (555) 123-4567",
      description: "General questions about our products and services"
    },
    {
      name: "Technical Support",
      email: "tech@phonehub.com",
      phone: "+1 (555) 123-4568",
      description: "Technical issues and device troubleshooting"
    },
    {
      name: "Sales & Orders",
      email: "sales@phonehub.com",
      phone: "+1 (555) 123-4569",
      description: "Product inquiries and order assistance"
    },
    {
      name: "Warranty & Repairs",
      email: "warranty@phonehub.com",
      phone: "+1 (555) 123-4570",
      description: "Warranty claims and repair services"
    }
  ];

  const faqs = [
    {
      question: "What are your business hours?",
      answer: "Our store is open Monday through Friday from 9AM to 7PM, and Saturday through Sunday from 10AM to 6PM. Online support is available 24/7."
    },
    {
      question: "How can I track my order?",
      answer: "You can track your order by logging into your account or using the tracking number provided in your order confirmation email."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for most items. Products must be in original condition with all packaging and accessories included."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Currently, we only ship within the United States. We're working on expanding our international shipping options."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-primary-glow/5 to-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-elegant">
              <MessageSquare className="h-4 w-4" />
              <span>Get in Touch</span>
            </div>
            
            <h1 className="text-display text-foreground mb-6">
              Contact
              <span className="block text-gradient-primary"> 
                Our Team
              </span>
            </h1>
            
            <p className="text-body text-muted-foreground max-w-3xl mx-auto">
              Have questions or need assistance? Our expert team is here to help you with any inquiries 
              about our products, services, or support. We're committed to providing exceptional customer service.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method, index) => (
              <Card key={index} className="text-center bg-card border-0 shadow-elegant hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <method.icon className={`h-8 w-8 ${method.color}`} />
                  </div>
                  
                  <h3 className="text-subheading text-foreground mb-3">
                    {method.title}
                  </h3>
                  
                  <p className="text-body text-muted-foreground mb-4">
                    {method.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="font-semibold text-foreground">
                      {method.contact}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {method.availability}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="text-heading text-foreground mb-8">
                Send Us a
                <span className="block text-gradient-primary"> 
                  Message
                </span>
              </h2>
              
              <Card className="bg-card border-0 shadow-elegant">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          required
                          placeholder="Enter your full name"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          required
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleChange("phone", e.target.value)}
                          placeholder="Enter your phone number"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="subject">Subject *</Label>
                        <Select value={formData.subject} onValueChange={(value) => handleChange("subject", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Inquiry</SelectItem>
                            <SelectItem value="technical">Technical Support</SelectItem>
                            <SelectItem value="sales">Sales & Orders</SelectItem>
                            <SelectItem value="warranty">Warranty & Repairs</SelectItem>
                            <SelectItem value="feedback">Feedback</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        required
                        placeholder="Tell us how we can help you..."
                        rows={6}
                      />
                    </div>
                    
                    <Button type="submit" className="w-full btn-primary">
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-heading text-foreground mb-8">
                Get in
                <span className="block text-gradient-primary"> 
                  Touch
                </span>
              </h2>
              
              <div className="space-y-8">
                {/* Office Location */}
                <Card className="bg-card border-0 shadow-elegant">
                  <CardHeader>
                    <CardTitle className="text-subheading text-foreground flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Office Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-body text-muted-foreground">
                        123 Tech Street<br />
                        Mobile City, MC 12345<br />
                        United States
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Mon-Fri: 9AM-7PM | Sat-Sun: 10AM-6PM</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Departments */}
                <Card className="bg-card border-0 shadow-elegant">
                  <CardHeader>
                    <CardTitle className="text-subheading text-foreground flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Departments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {departments.map((dept, index) => (
                        <div key={index} className="border-b border-border pb-4 last:border-b-0 last:pb-0">
                          <h4 className="font-semibold text-foreground mb-2">{dept.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{dept.description}</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3 text-primary" />
                              <span className="text-muted-foreground">{dept.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-primary" />
                              <span className="text-muted-foreground">{dept.phone}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
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
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Need Immediate Help?</span>
              </div>
              
              <h3 className="text-subheading text-white mb-4">
                Visit Our Support Center
              </h3>
              
              <p className="text-body text-white/80 mb-8 max-w-2xl mx-auto">
                Find answers to common questions, troubleshooting guides, and helpful resources 
                in our comprehensive support center.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/support">
                  <Button size="lg" className="btn-primary group">
                    <Zap className="h-5 w-5 mr-2" />
                    Support Center
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/faq">
                  <Button variant="outline" size="lg" className="btn-ghost border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-md">
                    <MessageSquare className="h-5 w-5 mr-2" />
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

export default Contact;
