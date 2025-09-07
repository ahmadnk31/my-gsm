import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Award, 
  Shield, 
  Clock, 
  Star, 
  Phone, 
  Mail, 
  MapPin,
  CheckCircle,
  Heart,
  Zap,
  Wrench,
  Smartphone,
  Headphones,
  Battery,
  Cable
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

export default function About() {
  const { t } = useLanguage();

  const stats = [
    { label: "Happy Customers", value: "10,000+", icon: Users },
    { label: "Repairs Completed", value: "25,000+", icon: Wrench },
    { label: "Years of Experience", value: "8+", icon: Award },
    { label: "Average Rating", value: "4.9/5", icon: Star }
  ];

  const services = [
    {
      icon: Smartphone,
      title: "Phone Repairs",
      description: "Expert repair services for all major smartphone brands with genuine parts and warranty."
    },
    {
      icon: Headphones,
      title: "Accessories",
      description: "Premium phone accessories including cases, chargers, headphones, and more."
    },
    {
      icon: Battery,
      title: "Battery Replacement",
      description: "Professional battery replacement services to restore your device's performance."
    },
    {
      icon: Cable,
      title: "Screen Repair",
      description: "High-quality screen repairs with original or premium aftermarket displays."
    }
  ];

  const values = [
    {
      icon: Shield,
      title: "Quality Assurance",
      description: "We use only genuine parts and provide comprehensive warranties on all repairs."
    },
    {
      icon: Clock,
      title: "Fast Service",
      description: "Most repairs completed within 24-48 hours with same-day service available."
    },
    {
      icon: Heart,
      title: "Customer Care",
      description: "Dedicated customer support and transparent pricing with no hidden fees."
    },
    {
      icon: Zap,
      title: "Expert Technicians",
      description: "Certified technicians with years of experience in mobile device repair."
    }
  ];

  const team = [
    {
      name: "Alex Johnson",
      role: "Founder & CEO",
      image: "/api/placeholder/150/150",
      description: "8+ years in mobile technology and repair services."
    },
    {
      name: "Sarah Chen",
      role: "Lead Technician",
      image: "/api/placeholder/150/150",
      description: "Certified repair specialist with expertise in all major brands."
    },
    {
      name: "Mike Rodriguez",
      role: "Customer Success Manager",
      image: "/api/placeholder/150/150",
      description: "Ensuring every customer has an exceptional experience."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              About Blueprint Phone Zen
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 leading-relaxed">
              Your trusted partner for professional phone repairs and premium accessories. 
              We've been serving the community with excellence for over 8 years.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Award className="h-4 w-4 mr-2" />
                Certified Technicians
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Shield className="h-4 w-4 mr-2" />
                Warranty Included
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Clock className="h-4 w-4 mr-2" />
                Fast Turnaround
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <IconComponent className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Founded in 2016, Blueprint Phone Zen started as a small repair shop with a big vision: 
                to provide exceptional mobile device repair services with unmatched customer care. 
                What began as a passion for technology and helping people has grown into a trusted 
                business serving thousands of satisfied customers.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-600 mb-6">
                  To provide fast, reliable, and affordable phone repair services while maintaining 
                  the highest standards of quality and customer satisfaction. We believe that 
                  everyone deserves access to professional repair services at fair prices.
                </p>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-600">
                  To be the leading mobile device repair and accessories provider in our community, 
                  known for our expertise, integrity, and commitment to customer success.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Choose Us?</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-600">Genuine parts and premium accessories</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-600">Certified and experienced technicians</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-600">Comprehensive warranty on all repairs</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-600">Transparent pricing with no hidden fees</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-600">Fast turnaround times</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-600">Excellent customer service</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Our Services</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We offer comprehensive mobile device services to keep your devices running smoothly.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {service.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do and shape our commitment to excellence.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-green-600" />
                    </div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our experienced team of professionals is dedicated to providing you with the best service.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-12 w-12 text-gray-400" />
                  </div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <CardDescription className="text-blue-600 font-medium">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Contact us today for professional phone repair services or browse our selection of premium accessories.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="hover:scale-105">
                <Link to="/repairs">
                  <Wrench className="h-5 w-5 mr-2" />
                  Get Repair Quote
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:scale-105 hover:text-blue-600">
                <Link to="/accessories">
                  <Smartphone className="h-5 w-5 mr-2" />
                  Shop Accessories
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              <p className="text-lg text-gray-600">
                Have questions? We're here to help! Reach out to us through any of these channels.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <Phone className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Phone</h3>
                  <p className="text-gray-600 mb-4">Call us for immediate assistance</p>
                  <p className="text-lg font-medium text-blue-600">
                    +32 467 86 1205
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <Mail className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Email</h3>
                  <p className="text-gray-600 mb-4">Send us a message anytime</p>
                  <p className="text-lg font-medium text-green-600">info@blueprintphonezen.com</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                    <MapPin className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Visit Us</h3>
                  <p className="text-gray-600 mb-4">Come see us in person</p>
                  <p className="text-lg font-medium text-purple-600">123 Tech Street<br />City, State 12345</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
