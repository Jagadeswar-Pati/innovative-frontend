import { Link } from 'react-router-dom';
import { Facebook, Youtube, Instagram } from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/eshop' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'FAQ', path: '/faq' },
  ];

  const customerService = [
    { name: 'My Account', path: '/account' },
    { name: 'Order Tracking', path: '/order-tracking' },
    { name: 'Wishlist', path: '/wishlist' },
  ];

  const socialLinks = [
    { icon: Facebook, url: 'https://www.facebook.com/people/Innovative-hub/61566aborrar848671/', label: 'Facebook' },
    { icon: Youtube, url: 'https://www.youtube.com/@inovative_hub', label: 'YouTube' },
    { icon: Instagram, url: 'https://www.instagram.com/innovative_hubofficial/', label: 'Instagram' },
  ];

  return (
    <footer className="bg-footer border-t border-border">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-footer-text">
              Innovative Hub
            </h3>
            <p className="text-sm text-footer-muted leading-relaxed">
              Your gateway to top-quality electronics, robotics courses, and DIY learning at unbeatable prices.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-4 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-footer-muted hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-semibold text-footer-text mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-footer-muted hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-base font-semibold text-footer-text mb-4">Customer Service</h4>
            <ul className="space-y-3">
              {customerService.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-footer-muted hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Column */}
          <div>
            <h4 className="text-base font-semibold text-footer-text mb-4">About Innovative Hub:</h4>
            <p className="text-sm text-footer-muted leading-relaxed">
              Innovative Hub is your one-stop destination for electronics, robotics, and DIY innovation. We provide high-quality components, kits, and expert tutorials to guide you from idea to execution. Our mission is to empower makers, students, and professionals to Learn, Build, Share, and Innovate.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-center text-sm text-footer-muted">
            © 2025 Innovative Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
