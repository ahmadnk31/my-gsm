import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Search, HelpCircle, ShoppingCart, Wrench, Shield, CreditCard, Truck, MessageSquare, ArrowRight, Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Questions", icon: HelpCircle, count: 24 },
    { id: "orders", name: "Orders & Shipping", icon: ShoppingCart, count: 6 },
    { id: "repairs", name: "Repairs & Service", icon: Wrench, count: 5 },
    { id: "warranty", name: "Warranty", icon: Shield, count: 4 },
    { id: "payment", name: "Payment & Billing", icon: CreditCard, count: 3 },
    { id: "shipping", name: "Shipping & Returns", icon: Truck, count: 3 },
    { id: "support", name: "Customer Support", icon: MessageSquare, count: 3 }
  ];

  const allFaqs = [
    // Orders & Shipping
    {
      category: "orders",
      question: "How can I track my order?",
      answer: "You can track your order by logging into your account and visiting the 'My Orders' section, or by using the tracking number provided in your order confirmation email. We also send shipping updates via email and SMS."
    },
    {
      category: "orders",
      question: "How long does shipping take?",
      answer: "Standard shipping takes 3-5 business days, while express shipping takes 1-2 business days. Free shipping is available on orders over $50. International shipping is not currently available."
    },
    {
      category: "orders",
      question: "Can I cancel or modify my order?",
      answer: "Orders can be cancelled or modified within 1 hour of placement. After that, please contact our customer service team. Once shipped, orders cannot be cancelled but can be returned."
    },
    {
      category: "orders",
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, Apple Pay, Google Pay, and bank transfers. All payments are processed securely."
    },
    {
      category: "orders",
      question: "Do you offer financing options?",
      answer: "Yes, we offer financing through our partner providers. You can apply for financing during checkout. Approval is subject to credit check and terms apply."
    },
    {
      category: "orders",
      question: "Is my payment information secure?",
      answer: "Absolutely. We use industry-standard SSL encryption and never store your payment information on our servers. All transactions are processed through secure payment gateways."
    },

    // Repairs & Service
    {
      category: "repairs",
      question: "How long does a repair take?",
      answer: "Most repairs are completed within 24-48 hours. Screen replacements and battery changes typically take 30-60 minutes. Complex repairs may take 3-5 business days."
    },
    {
      category: "repairs",
      question: "Do you offer warranty on repairs?",
      answer: "Yes, all our repairs come with a 90-day warranty on parts and labor. Extended warranty options are available for additional protection."
    },
    {
      category: "repairs",
      question: "Can I get a repair quote online?",
      answer: "Yes, you can get an instant quote using our online repair calculator. Simply select your device model and describe the issue to receive an accurate estimate."
    },
    {
      category: "repairs",
      question: "Do you use genuine parts?",
      answer: "Yes, we use only genuine OEM parts for all repairs. This ensures the best quality and compatibility with your device."
    },
    {
      category: "repairs",
      question: "What if my device can't be repaired?",
      answer: "If your device cannot be repaired, we'll provide a replacement with a comparable model or offer a refund based on the original purchase price."
    },

    // Warranty
    {
      category: "warranty",
      question: "What does the standard warranty cover?",
      answer: "Our standard warranty covers manufacturing defects, component failures, and hardware issues that occur under normal use for 1 year from purchase date."
    },
    {
      category: "warranty",
      question: "How do I file a warranty claim?",
      answer: "Contact our warranty team via phone, email, or through our online portal. Provide your purchase details and describe the issue. We'll guide you through the process."
    },
    {
      category: "warranty",
      question: "Can I transfer my warranty?",
      answer: "Yes, warranties are transferable to new owners. Contact our customer service team with the new owner's information to update the warranty registration."
    },
    {
      category: "warranty",
      question: "What's not covered by warranty?",
      answer: "Physical damage from drops, water damage, unauthorized modifications, software issues caused by user error, cosmetic damage, and loss or theft are not covered."
    },

    // Payment & Billing
    {
      category: "payment",
      question: "Are there any hidden fees?",
      answer: "No hidden fees. All prices shown include applicable taxes. Shipping costs are clearly displayed during checkout, and we offer free shipping on orders over $50."
    },
    {
      category: "payment",
      question: "Can I get a refund?",
      answer: "Yes, we offer a 30-day return policy for most items. Products must be in original condition with all packaging and accessories included."
    },
    {
      category: "payment",
      question: "Do you offer price matching?",
      answer: "Yes, we offer price matching on identical products from authorized retailers. Contact our customer service team with the competitor's price and we'll match it."
    },

    // Shipping & Returns
    {
      category: "shipping",
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for most items. Products must be in original condition with all packaging and accessories. Return shipping is free for defective items."
    },
    {
      category: "shipping",
      question: "How do I return an item?",
      answer: "Initiate a return through your account or contact customer service. We'll provide a return shipping label and instructions. Returns are processed within 5-7 business days."
    },
    {
      category: "shipping",
      question: "Do you ship internationally?",
      answer: "Currently, we only ship within the United States. We're working on expanding our international shipping options in the future."
    },

    // Customer Support
    {
      category: "support",
      question: "What are your business hours?",
      answer: "Our store is open Monday through Friday from 9AM to 7PM, and Saturday through Sunday from 10AM to 6PM. Online support is available 24/7."
    },
    {
      category: "support",
      question: "How can I contact customer service?",
      answer: "You can reach us by phone at +1 (555) 123-4567, email at support@phonehub.com, or through our live chat feature on the website."
    },
    {
      category: "support",
      question: "Do you offer technical support?",
      answer: "Yes, our technical support team can help with device setup, troubleshooting, software issues, and general technical questions. Support is available via phone, email, and chat."
    }
  ];

  const filteredFaqs = allFaqs.filter(faq => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const popularFaqs = [
    "How can I track my order?",
    "What is your return policy?",
    "How long does a repair take?",
    "What does the standard warranty cover?",
    "Do you use genuine parts?"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-primary-glow/5 to-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-info to-info/80 text-info-foreground px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-elegant">
              <HelpCircle className="h-4 w-4" />
              <span>Frequently Asked Questions</span>
            </div>
            
            <h1 className="text-display text-foreground mb-6">
              Find Answers to
              <span className="block text-gradient-primary"> 
                Common Questions
              </span>
            </h1>
            
            <p className="text-body text-muted-foreground max-w-3xl mx-auto">
              Can't find what you're looking for? Search our comprehensive FAQ database or contact our 
              support team for personalized assistance.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg bg-card border-0 shadow-elegant"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-16">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                className={`flex flex-col items-center gap-2 p-4 h-auto ${
                  activeCategory === category.id ? "btn-primary" : "btn-ghost"
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                <category.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{category.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Questions */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading text-foreground mb-6">
              Popular
              <span className="block text-gradient-primary"> 
                Questions
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {popularFaqs.map((question, index) => {
              const faq = allFaqs.find(f => f.question === question);
              return faq ? (
                <Card key={index} className="bg-card border-0 shadow-elegant hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Star className="h-5 w-5 text-warning mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="text-subheading text-foreground mb-3">
                          {faq.question}
                        </h3>
                        <p className="text-body text-muted-foreground">
                          {faq.answer.substring(0, 120)}...
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : null;
            })}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading text-foreground mb-6">
              All
              <span className="block text-gradient-primary"> 
                Questions
              </span>
            </h2>
            {searchQuery && (
              <p className="text-body text-muted-foreground">
                Showing {filteredFaqs.length} results for "{searchQuery}"
              </p>
            )}
          </div>

          <div className="max-w-4xl mx-auto">
            {filteredFaqs.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-4">
                {filteredFaqs.map((faq, index) => (
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
            ) : (
              <Card className="bg-card border-0 shadow-elegant text-center py-12">
                <CardContent>
                  <HelpCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-subheading text-foreground mb-2">No results found</h3>
                  <p className="text-body text-muted-foreground mb-6">
                    Try adjusting your search terms or browse our categories above.
                  </p>
                  <Button 
                    onClick={() => {
                      setSearchQuery("");
                      setActiveCategory("all");
                    }}
                    className="btn-primary"
                  >
                    Clear Search
                  </Button>
                </CardContent>
              </Card>
            )}
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
                <span className="text-sm font-medium">Still Need Help?</span>
              </div>
              
              <h3 className="text-subheading text-white mb-4">
                Contact Our Support Team
              </h3>
              
              <p className="text-body text-white/80 mb-8 max-w-2xl mx-auto">
                Can't find the answer you're looking for? Our expert support team is here to help 
                with personalized assistance and technical guidance.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button size="lg" className="btn-primary group">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Contact Support
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/support">
                  <Button variant="outline" size="lg" className="btn-ghost border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-md">
                    <HelpCircle className="h-5 w-5 mr-2" />
                    Support Center
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

export default FAQ;
