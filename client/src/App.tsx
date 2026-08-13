import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import GameBoard from "./pages/GameBoard";
import Leaderboard from "./pages/Leaderboard";
import HowToPlay from "./pages/HowToPlay";

function AppRouter() {
  return (
    <WouterRouter base="/trinum-pro">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/game" component={GameBoard} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/how-to-play" component={HowToPlay} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <AppRouter />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
