import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, Smartphone, Wrench, Star, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const blogPosts = [
  {
    id: 1,
    title: "iPhone 15 Pro: Complete Repair Guide & Tips",
    excerpt: "Everything you need to know about repairing the latest iPhone, common issues, and preventive care tips from our expert technicians.",
    category: "Repair Guides",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=250&fit=crop",
    date: "Sep 20, 2025",
    featured: true
  },
  {
    id: 2,
    title: "Signs Your Phone Battery Needs Replacement",
    excerpt: "Learn the warning signs of a failing battery and when it's time to get a replacement. Plus tips to extend battery life.",
    category: "Maintenance",
    readTime: "3 min read",
    image: "https://images.unsplash.com/photo-1609592062458-6c5d1f6b5b75?w=400&h=250&fit=crop",
    date: "Sep 18, 2025"
  },
  {
    id: 3,
    title: "Water Damage: What to Do in the First 24 Hours",
    excerpt: "Emergency steps to take when your phone gets wet, what NOT to do, and how professional water damage repair works.",
    category: "Emergency Tips",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=250&fit=crop",
    date: "Sep 15, 2025"
  },
  {
    id: 4,
    title: "Android vs iPhone: Repair Cost Comparison 2025",
    excerpt: "Detailed breakdown of repair costs across different brands and models. Make informed decisions about your device repairs.",
    category: "Cost Analysis",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=250&fit=crop",
    date: "Sep 12, 2025"
  }
];

const quickStats = [
  {
    icon: Smartphone,
    value: "15K+",
    label: "Devices Repaired",
    color: "text-primary"
  },
  {
    icon: Users,
    value: "12K+",
    label: "Happy Customers",
    color: "text-success"
  },
  {
    icon: Star,
    value: "4.9",
    label: "Average Rating",
    color: "text-warning"
  },
  {
    icon: Clock,
    value: "<1hr",
    label: "Average Repair Time",
    color: "text-info"
  }
];

const BlogAndUpdates: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-info/3 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {quickStats.map((stat, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-border hover:shadow-lg transition-all duration-300 text-center">
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-warning to-warning/80 text-warning-foreground px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-elegant">
            <TrendingUp className="h-4 w-4" />
            <span>Latest Updates</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Expert Tips & Insights
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Stay updated with the latest repair techniques, device care tips, and industry insights from our expert technicians
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          {/* Featured Post - Large */}
          <div className="lg:col-span-8">
            <Card className="group bg-card/50 backdrop-blur-sm border-border/50 hover:border-border hover:shadow-xl transition-all duration-500 overflow-hidden h-full">
              <div className="relative h-64 lg:h-80 overflow-hidden">
                <img 
                  src={blogPosts[0].image} 
                  alt={blogPosts[0].title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-warning text-warning-foreground">Featured</Badge>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <Badge variant="outline" className="mb-3 bg-background/20 backdrop-blur-sm text-background border-background/20">
                    {blogPosts[0].category}
                  </Badge>
                  <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3 leading-tight">
                    {blogPosts[0].title}
                  </h3>
                  <p className="text-white/90 text-base mb-4 line-clamp-2">
                    {blogPosts[0].excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-white/80 text-sm">
                    <span>{blogPosts[0].date}</span>
                    <span>•</span>
                    <span>{blogPosts[0].readTime}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Side Posts */}
          <div className="lg:col-span-4 space-y-6">
            {blogPosts.slice(1, 4).map((post, index) => (
              <Card key={post.id} className="group bg-card/50 backdrop-blur-sm border-border/50 hover:border-border hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <div className="flex gap-4">
                    <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-l-xl">
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-4 flex-grow">
                      <Badge variant="outline" className="mb-2 text-xs">
                        {post.category}
                      </Badge>
                      <h4 className="font-semibold text-foreground mb-2 line-clamp-2 text-sm leading-tight group-hover:text-primary transition-colors">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{post.date}</span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <Card className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5" />
          <CardContent className="p-12 text-center relative">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-3xl font-bold mb-4">Stay in the Loop</h3>
              <p className="text-lg mb-8 opacity-90">
                Get expert repair tips, exclusive offers, and the latest tech news delivered to your inbox weekly
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 rounded-lg text-foreground bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <Button 
                  size="lg" 
                  className="bg-background text-foreground hover:bg-background/90 px-8 py-3 font-semibold whitespace-nowrap"
                >
                  Subscribe
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
              
              <p className="text-sm opacity-80 mt-4">
                Join 5,000+ subscribers. Unsubscribe anytime.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Button asChild size="lg" className="px-8 py-3 font-semibold">
            <Link to="/blog" className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              View All Articles
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogAndUpdates;
