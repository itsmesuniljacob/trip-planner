import Header from "@/components/layout/Header";
import { useState } from "react";
import AuthModal from "@/components/auth/AuthModal";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  MessageSquare, 
  Vote, 
  Users, 
  Shield, 
  Zap,
  Globe,
  Clock,
  BarChart3,
  CheckCircle2
} from "lucide-react";

const Features = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Recommendations",
      description: "Our advanced AI analyzes group preferences, budget constraints, and travel dates to suggest the perfect destinations for your group.",
      benefits: ["Personalized suggestions", "Budget optimization", "Weather considerations", "Group size matching"]
    },
    {
      icon: MessageSquare,
      title: "Smart Survey System",
      description: "Automated SMS and WhatsApp surveys collect preferences from all group members efficiently without endless back-and-forth messages.",
      benefits: ["Automated distribution", "High response rates", "Preference tracking", "Real-time updates"]
    },
    {
      icon: Vote,
      title: "Ranked-Choice Voting",
      description: "Democratic decision-making through our sophisticated voting system that ensures every voice is heard and consensus is reached fairly.",
      benefits: ["Fair representation", "Tie-breaking logic", "Real-time results", "Transparent process"]
    },
    {
      icon: Users,
      title: "Group Management",
      description: "Easily add participants, track responses, and manage group dynamics with our intuitive participant management system.",
      benefits: ["Easy invitations", "Status tracking", "Role management", "Communication tools"]
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "Your group's data is protected with enterprise-grade security. We never share your information with third parties.",
      benefits: ["End-to-end encryption", "GDPR compliant", "Secure data storage", "Privacy controls"]
    },
    {
      icon: Zap,
      title: "Instant Sync",
      description: "Real-time updates ensure everyone stays informed about voting progress, new recommendations, and group decisions.",
      benefits: ["Live updates", "Push notifications", "Multi-device sync", "Offline support"]
    }
  ];

  const additionalFeatures = [
    {
      icon: Globe,
      title: "Global Destinations",
      description: "Access to 500+ destinations worldwide with detailed profiles, cost estimates, and travel requirements."
    },
    {
      icon: Clock,
      title: "Timeline Management",
      description: "Automated scheduling ensures surveys are sent at optimal times for maximum response rates."
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track group engagement, response rates, and consensus progress with detailed analytics."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header onOpenAuth={() => setIsAuthModalOpen(true)} />
      
      {/* Hero Section */}
      <section className="py-20 gradient-sky">
        <div className="container text-center">
          <Badge variant="secondary" className="mb-6">
            ✨ Comprehensive Feature Set
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Everything You Need for
            <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Perfect Group Trips
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            TripSync combines cutting-edge AI technology with intuitive design to make group travel 
            planning effortless, democratic, and fun for everyone involved.
          </p>
          <Button variant="hero" size="lg" className="text-lg px-8">
            Start Free Trial
          </Button>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the powerful features that make TripSync the ultimate group travel planning solution.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-elevation-medium hover:shadow-elevation-high transition-smooth">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 gradient-ocean rounded-xl flex items-center justify-center flex-shrink-0">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground mb-4">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">More Great Features</h2>
            <p className="text-xl text-muted-foreground">
              Additional capabilities that enhance your trip planning experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => (
              <Card key={index} className="shadow-elevation-low hover:shadow-elevation-medium transition-smooth">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20">
        <div className="container">
          <Card className="gradient-hero text-white p-12 text-center shadow-elevation-high">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Seamlessly Integrated Workflow
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              From initial survey to final booking, TripSync handles every step of the group 
              travel planning process with intelligent automation and human oversight.
            </p>
            
            <div className="grid md:grid-cols-4 gap-8 mt-12">
              {[
                { step: "1", title: "Survey", desc: "Collect preferences" },
                { step: "2", title: "AI Analysis", desc: "Generate recommendations" },
                { step: "3", title: "Vote", desc: "Democratic selection" },
                { step: "4", title: "Book", desc: "Finalize your trip" }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold">
                    {item.step}
                  </div>
                  <h4 className="font-semibold mb-1">{item.title}</h4>
                  <p className="text-sm opacity-80">{item.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default Features;