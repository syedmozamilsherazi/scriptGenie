import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Sparkles, Zap, Clock, Shield } from "lucide-react";
import { Logo } from "@/components/Logo";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Logo />
        <Button variant="ghost" onClick={() => navigate("/generate")}>
          Get Started
        </Button>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-12 pb-32 text-center">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-primary/10 rounded-full animate-fade-in">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Smart Content Transformation</span>
        </div>
        
        <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-slide-up">
          AI YouTube Script Generator
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 animate-fade-in">
          Paste any article or transcript and get a full, polished YouTube script in seconds. 
          Perfect for content creators, marketers, and video producers.
        </p>

        <Button
          onClick={() => navigate("/generate")}
          size="lg"
          className="h-14 px-8 text-lg font-semibold animate-slide-up"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Start Generating Scripts
        </Button>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg animate-fade-in">
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">
                Advanced AI analyzes your content and generates engaging, professional scripts instantly.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">
                Generate complete video scripts in under 60 seconds. No more hours of writing.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Save History</h3>
              <p className="text-sm text-muted-foreground">
                All your generated scripts are automatically saved. Access them anytime, anywhere.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Privacy First</h3>
              <p className="text-sm text-muted-foreground">
                Your data stays private. All scripts are stored locally on your device.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 pb-20">
        <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20 animate-fade-in">
          <CardContent className="pt-12 pb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Content?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of creators who are already using AI to streamline their video production workflow.
            </p>
            <Button
              onClick={() => navigate("/generate")}
              size="lg"
              className="h-12 px-8 text-base font-semibold"
            >
              Get Started for Free
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <p className="text-center text-sm text-muted-foreground">
          © 2025 AI YouTube Script Generator. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
