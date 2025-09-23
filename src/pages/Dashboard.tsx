import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { 
  Plus, 
  Users, 
  Calendar, 
  MapPin, 
  MoreHorizontal,
  Clock,
  Vote,
  CheckCircle2
} from "lucide-react";

const Dashboard = () => {
  const [trips] = useState([
    {
      id: 1,
      name: "Summer Beach Getaway",
      status: "voting",
      participants: 6,
      created: "2 days ago",
      destination: "TBD",
      budget: "$500-800"
    },
    {
      id: 2,
      name: "Weekend Mountain Retreat",
      status: "planning",
      participants: 4,
      created: "1 week ago",
      destination: "Colorado",
      budget: "$300-500"
    },
    {
      id: 3,
      name: "European Adventure",
      status: "completed",
      participants: 8,
      created: "2 months ago",
      destination: "Barcelona",
      budget: "$1200-1500"
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "voting":
        return <Vote className="h-4 w-4" />;
      case "planning":
        return <Clock className="h-4 w-4" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "voting":
        return "warning";
      case "planning":
        return "secondary";
      case "completed":
        return "success";
      default:
        return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Trip Dashboard</h1>
            <p className="text-muted-foreground">Manage your group trips and see their progress</p>
          </div>
          <Button variant="hero" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Trip
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-elevation-low">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Trips</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elevation-low">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Participants</p>
                  <p className="text-2xl font-bold">18</p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elevation-low">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Votes</p>
                  <p className="text-2xl font-bold">2</p>
                </div>
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Vote className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elevation-low">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trips List */}
        <Card className="shadow-elevation-medium">
          <CardHeader>
            <CardTitle>Your Trips</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {trips.map((trip) => (
                <div key={trip.id} className="p-6 hover:bg-muted/30 transition-smooth">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{trip.name}</h3>
                        <Badge variant={getStatusColor(trip.status) as any} className="flex items-center gap-1">
                          {getStatusIcon(trip.status)}
                          {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {trip.participants} participants
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {trip.destination}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {trip.created}
                        </div>
                        <div>
                          Budget: {trip.budget}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Empty State (shown when no trips) */}
        {trips.length === 0 && (
          <Card className="shadow-elevation-medium">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-2xl flex items-center justify-center">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No trips yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first group trip and start planning your next adventure.
              </p>
              <Button variant="hero">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Trip
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;