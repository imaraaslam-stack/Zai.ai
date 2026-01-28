import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

// Pages
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import CreateTopic from "@/pages/CreateTopic";
import TopicDetails from "@/pages/TopicDetails";
import Quiz from "@/pages/Quiz";
import NotFound from "@/pages/not-found";
import { Navigation } from "@/components/Navigation";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  // Not logged in -> Landing Page
  if (!user) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        {/* Redirect any other route to Landing for guests */}
        <Route component={Landing} />
      </Switch>
    );
  }

  // Logged in -> App Routes
  return (
    <>
      <Navigation />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/topic/new" component={CreateTopic} />
        <Route path="/topic/:id" component={TopicDetails} />
        <Route path="/quiz/:id" component={Quiz} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
