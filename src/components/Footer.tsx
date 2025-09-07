import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <Phone className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">PhoneHub</span>
            </Link>
            <p className="text-background/80 mb-6 leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-background/80 hover:text-primary hover:bg-primary/10">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-background/80 hover:text-primary hover:bg-primary/10">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-background/80 hover:text-primary hover:bg-primary/10">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-background/80 hover:text-primary hover:bg-primary/10">
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">{t('footer.services')}</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-background/80 hover:text-primary transition-colors">{t('nav.phones')}</Link></li>
              <li><Link to="/accessories" className="text-background/80 hover:text-primary transition-colors">{t('nav.accessories')}</Link></li>
              <li><Link to="/repairs" className="text-background/80 hover:text-primary transition-colors">{t('nav.repairs')}</Link></li>
              <li><Link to="/trade-in" className="text-background/80 hover:text-primary transition-colors">{t('tradeIn.title')}</Link></li>
              <li><Link to="/about" className="text-background/80 hover:text-primary transition-colors">About</Link></li>
              <li><Link to="/warranty" className="text-background/80 hover:text-primary transition-colors">{t('footer.warranty')}</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-6">{t('footer.support')}</h3>
            <ul className="space-y-3">
              <li><Link to="/contact" className="text-background/80 hover:text-primary transition-colors">{t('footer.contact')}</Link></li>
              <li><Link to="/shipping" className="text-background/80 hover:text-primary transition-colors">{t('footer.shipping')}</Link></li>
              <li><Link to="/returns" className="text-background/80 hover:text-primary transition-colors">{t('footer.returns')}</Link></li>
              <li><Link to="/faq" className="text-background/80 hover:text-primary transition-colors">{t('footer.faq')}</Link></li>
              <li><Link to="/support" className="text-background/80 hover:text-primary transition-colors">{t('footer.support')}</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">{t('footer.contact')}</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-background/80">123 Tech Street</p>
                  <p className="text-background/80">Mobile City, MC 12345</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <p className="text-background/80">+32 467 86 1205</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <p className="text-background/80">info@phonehub.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-background/60 text-sm">
            © 2024 PhoneHub. {t('footer.allRightsReserved')}.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-background/60 hover:text-primary text-sm transition-colors">{t('footer.privacy')}</Link>
            <Link to="/terms" className="text-background/60 hover:text-primary text-sm transition-colors">{t('footer.terms')}</Link>
            <Link to="/cookies" className="text-background/60 hover:text-primary text-sm transition-colors">{t('footer.cookies')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;