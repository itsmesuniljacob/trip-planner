import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, User, Chrome, Apple, Facebook } from "lucide-react";
import { getFirebaseAuth, getGoogleProvider, getFacebookProvider, getAppleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { toast } from "@/components/ui/sonner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For MVP, we'll just close the modal
    // In production, this would handle authentication
    console.log("Auth attempt:", { email, password, name, isSignUp });
    onClose();
  };

  const handleGoogleSignIn = async () => {
    try {
      const auth = getFirebaseAuth();
      const provider = getGoogleProvider();
      await signInWithPopup(auth, provider);
      toast.success("Signed in with Google");
      onClose();
    } catch (error) {
      console.error("Google sign-in failed", error);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      const auth = getFirebaseAuth();
      const provider = getFacebookProvider();
      await signInWithPopup(auth, provider);
      toast.success("Signed in with Facebook");
      onClose();
    } catch (error) {
      console.error("Facebook sign-in failed", error);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const auth = getFirebaseAuth();
      const provider = getAppleProvider();
      await signInWithPopup(auth, provider);
      toast.success("Signed in with Apple");
      onClose();
    } catch (error) {
      console.error("Apple sign-in failed", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {isSignUp ? "Create your account" : "Welcome back"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
              <Chrome className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>
            <Button variant="outline" className="w-full" onClick={handleAppleSignIn}>
              <Apple className="mr-2 h-4 w-4" />
              Continue with Apple
            </Button>
            <Button variant="outline" className="w-full" onClick={handleFacebookSignIn}>
              <Facebook className="mr-2 h-4 w-4" />
              Continue with Facebook
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" variant="hero" className="w-full">
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </span>{" "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary font-medium hover:underline"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </div>

          {!isSignUp && (
            <div className="text-center">
              <button className="text-sm text-primary hover:underline">
                Forgot your password?
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;