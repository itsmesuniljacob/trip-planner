import { Button } from "@/components/ui/button";
import { Plane, Menu, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";

interface HeaderProps {
  onOpenAuth?: () => void;
}

const Header = ({ onOpenAuth }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-hero">
            <Plane className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            TripSync
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth">
            Dashboard
          </Link>
          <Link to="/features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth">
            Features
          </Link>
          <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth">
            About
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                {user.displayName || user.email}
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>Sign out</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={onOpenAuth}>
                Sign In
              </Button>
              <Button variant="hero" size="sm" onClick={onOpenAuth}>
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4 space-y-3">
            <Link to="/dashboard" className="block text-sm font-medium text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <Link to="/features" className="block text-sm font-medium text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link to="/about" className="block text-sm font-medium text-muted-foreground hover:text-foreground">
              About
            </Link>
            <div className="flex flex-col space-y-2 pt-2">
              {user ? (
                <Button variant="outline" size="sm" className="w-full" onClick={handleSignOut}>
                  Sign out
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={onOpenAuth}>
                    Sign In
                  </Button>
                  <Button variant="hero" size="sm" className="w-full" onClick={onOpenAuth}>
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;