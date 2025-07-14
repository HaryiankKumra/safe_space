
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Brain, Shield, Smartphone, Activity, AlertTriangle } from 'lucide-react';

const IntroductionPage = () => {
  const features = [
    {
      icon: <Heart className="h-6 w-6 md:h-8 md:w-8" />,
      title: "Real-time Monitoring",
      description: "Continuous tracking of heart rate, GSR, and temperature"
    },
    {
      icon: <Brain className="h-6 w-6 md:h-8 md:w-8" />,
      title: "AI-Powered Analysis",
      description: "Machine learning algorithms for accurate stress detection"
    },
    {
      icon: <Shield className="h-6 w-6 md:h-8 md:w-8" />,
      title: "Preventive Care",
      description: "Early warning system to prevent stress-related health issues"
    },
    {
      icon: <Smartphone className="h-6 w-6 md:h-8 md:w-8" />,
      title: "Mobile Ready",
      description: "Access your health data anywhere, anytime"
    }
  ];

  const metrics = [
    { label: "Heart Rate Variability", value: "Real-time HRV analysis" },
    { label: "Galvanic Skin Response", value: "Stress level detection" },
    { label: "Temperature Monitoring", value: "Body temperature tracking" },
    { label: "Facial Analysis", value: "Emotion recognition" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <span className="text-lg sm:text-xl font-bold text-primary">StressMon</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-sm sm:text-base">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="text-sm sm:text-base">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4 sm:mb-6 text-xs sm:text-sm">
              Advanced Health Monitoring
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
              Monitor Your Stress
              <span className="text-primary block sm:inline sm:ml-3">In Real-Time</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
              Advanced biometric monitoring system that tracks your physiological signals 
              to detect stress levels and provide personalized health insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 sm:px-0">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3">
                  Start Monitoring
                </Button>
              </Link>
              <Link to="/how-it-works" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Why Choose StressMon?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4 sm:px-0">
              Comprehensive stress monitoring with cutting-edge technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader className="space-y-3 sm:space-y-4 pb-4">
                  <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm sm:text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              What We Monitor
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4 sm:px-0">
              Comprehensive biometric data collection for accurate stress assessment
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {metrics.map((metric, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center space-y-0 space-x-4 pb-3">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg font-semibold truncate">{metric.label}</CardTitle>
                    <CardDescription className="text-sm sm:text-base mt-1">{metric.value}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-primary/5 dark:bg-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-4xl mx-auto text-center border-2 border-primary/20">
            <CardHeader className="space-y-4 sm:space-y-6 pb-6">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                  Ready to Take Control of Your Health?
                </CardTitle>
                <CardDescription className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
                  Join thousands of users who are already monitoring their stress levels 
                  and improving their well-being with StressMon.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3">
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/how-it-works" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3">
                    Learn More
                  </Button>
                </Link>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-4">
                No credit card required • Start monitoring in 2 minutes
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default IntroductionPage;
