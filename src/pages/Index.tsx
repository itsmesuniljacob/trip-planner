import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuthModal from "@/components/auth/AuthModal";
import { 
  Users, 
  Brain, 
  Vote, 
  MessageSquare, 
  Clock, 
  Trophy,
  ArrowRight,
  CheckCircle,
  MapPin,
  Calendar,
  DollarSign,
  Star
} from "lucide-react";
import heroImage from "@/assets/hero-travel-planning.jpg";

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-sky"></div>
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  ✨ AI-Powered Trip Planning
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  Plan Amazing{" "}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Group Trips
                  </span>{" "}
                  in Minutes
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Eliminate the chaos of group travel planning. TripSync uses AI recommendations 
                  and smart voting to help your group reach consensus on destinations quickly.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="text-lg px-8"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  Start Planning Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8">
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-warning fill-warning" />
                  <span className="text-sm font-medium">4.9/5 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">10,000+ Groups</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 gradient-ocean rounded-3xl blur-3xl opacity-20"></div>
              <img 
                src={heroImage} 
                alt="Group of friends planning a trip together"
                className="relative rounded-3xl shadow-elevation-high w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              How TripSync Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our three-step process transforms chaotic group planning into a streamlined, 
              democratic experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-elevation-medium hover:shadow-elevation-high transition-smooth">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto gradient-ocean rounded-2xl flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">1. Collect Preferences</h3>
                <p className="text-muted-foreground">
                  Send smart surveys to your group via SMS or WhatsApp. Gather preferences 
                  on dates, budget, destinations, and travel style.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elevation-medium hover:shadow-elevation-high transition-smooth">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto gradient-sunset rounded-2xl flex items-center justify-center">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">2. AI Recommendations</h3>
                <p className="text-muted-foreground">
                  Our AI analyzes group preferences and generates personalized destination 
                  recommendations with detailed profiles and costs.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elevation-medium hover:shadow-elevation-high transition-smooth">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-accent rounded-2xl flex items-center justify-center">
                  <Vote className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">3. Smart Voting</h3>
                <p className="text-muted-foreground">
                  Group members rank destinations using our ranked-choice voting system. 
                  Reach consensus democratically with real-time results.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Say Goodbye to Endless Group Chats
                </h2>
                <p className="text-xl text-muted-foreground">
                  No more frustrated planning sessions or decision paralysis. TripSync 
                  streamlines the entire process from start to finish.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    icon: Clock,
                    title: "Save Hours of Planning",
                    description: "Reduce planning time from weeks to days with automated workflows."
                  },
                  {
                    icon: Users,
                    title: "Perfect for Any Group Size",
                    description: "Whether it's 4 friends or 20 colleagues, TripSync scales with your group."
                  },
                  {
                    icon: Trophy,
                    title: "Higher Success Rate",
                    description: "95% of groups using TripSync successfully book their planned trip."
                  }
                ].map((benefit, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: MapPin, label: "Destinations", value: "500+" },
                { icon: Calendar, label: "Trips Planned", value: "10,000+" },
                { icon: DollarSign, label: "Avg. Savings", value: "$200" },
                { icon: Users, label: "Group Success", value: "95%" }
              ].map((stat, index) => (
                <Card key={index} className="p-6 text-center shadow-elevation-low">
                  <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <Card className="gradient-hero text-white text-center p-12 shadow-elevation-high">
            <div className="space-y-6 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Plan Your Next Adventure?
              </h2>
              <p className="text-xl opacity-90">
                Join thousands of groups who've eliminated the stress of trip planning. 
                Start your first trip for free today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="text-lg px-8"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  Start Planning Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Contact Sales
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default Index;
