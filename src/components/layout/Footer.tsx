import { Plane, Mail, MapPin, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t bg-card">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-hero">
                <Plane className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                TripSync
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Eliminate the chaos of group trip planning with AI-powered recommendations and smart voting.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/features" className="hover:text-foreground transition-smooth">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-foreground transition-smooth">Pricing</Link></li>
              <li><Link to="/demo" className="hover:text-foreground transition-smooth">Demo</Link></li>
              <li><Link to="/updates" className="hover:text-foreground transition-smooth">Updates</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground transition-smooth">About</Link></li>
              <li><Link to="/blog" className="hover:text-foreground transition-smooth">Blog</Link></li>
              <li><Link to="/careers" className="hover:text-foreground transition-smooth">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-smooth">Contact</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/help" className="hover:text-foreground transition-smooth">Help Center</Link></li>
              <li><Link to="/privacy" className="hover:text-foreground transition-smooth">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-foreground transition-smooth">Terms</Link></li>
              <li><Link to="/security" className="hover:text-foreground transition-smooth">Security</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2025 TripSync. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>Worldwide</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;