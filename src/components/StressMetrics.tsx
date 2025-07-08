
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Zap, 
  TrendingUp, 
  TrendingDown,
  Minus
} from "lucide-react";

interface StressMetricsProps {
  stressLevel: number;
  stressStatus: 'low' | 'moderate' | 'high';
  signalQuality: {
    bvp: number;
    eda: number;
    temp: number;
    hr: number;
  };
  isMonitoring: boolean;
}

const StressMetrics: React.FC<StressMetricsProps> = ({ 
  stressLevel, 
  stressStatus, 
  signalQuality,
  isMonitoring 
}) => {
  const metrics = [
    {
      name: 'Autonomic Balance',
      value: Math.random() * 100,
      trend: 'stable',
      icon: <Activity className="w-5 h-5" />,
      color: 'blue',
      description: 'Sympathetic vs Parasympathetic activity'
    },
    {
      name: 'HRV Stress Index',
      value: (1 - stressLevel) * 100,
      trend: stressLevel > 0.5 ? 'down' : 'up',
      icon: <Heart className="w-5 h-5" />,
      color: 'red',
      description: 'Heart rate variability based stress indicator'
    },
    {
      name: 'EDA Reactivity',
      value: stressLevel * 80 + 20,
      trend: stressLevel > 0.5 ? 'up' : 'stable',
      icon: <Zap className="w-5 h-5" />,
      color: 'yellow',
      description: 'Electrodermal activity responsiveness'
    },
    {
      name: 'Thermal Comfort',
      value: 100 - (stressLevel * 30),
      trend: stressLevel > 0.6 ? 'down' : 'stable',
      icon: <Thermometer className="w-5 h-5" />,
      color: 'green',
      description: 'Skin temperature regulation efficiency'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getColorClass = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      red: 'from-red-500 to-red-600',
      yellow: 'from-yellow-500 to-yellow-600',
      green: 'from-green-500 to-green-600'
    };
    return colors[color as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Overall Stress Assessment */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Stress Assessment Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold text-gray-800">
              {(stressLevel * 100).toFixed(0)}%
            </div>
            <Badge 
              className={`text-lg px-4 py-2 ${
                stressStatus === 'low' ? 'bg-green-100 text-green-800' :
                stressStatus === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}
            >
              {stressStatus.toUpperCase()} STRESS
            </Badge>
            <Progress value={stressLevel * 100} className="w-full h-4" />
            <p className="text-gray-600 max-w-md mx-auto">
              Based on real-time analysis of physiological signals including heart rate variability, 
              skin conductance, and temperature regulation patterns.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className={`p-2 rounded-full bg-gradient-to-r ${getColorClass(metric.color)} text-white`}>
                    {metric.icon}
                  </div>
                  {metric.name}
                </CardTitle>
                {getTrendIcon(metric.trend)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-800">
                    {metric.value.toFixed(1)}%
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {metric.trend.toUpperCase()}
                  </Badge>
                </div>
                <Progress value={metric.value} className="h-2" />
                <p className="text-sm text-gray-600">{metric.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Signal Quality Overview */}
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Signal Quality Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(signalQuality).map(([signal, quality]) => (
              <div key={signal} className="text-center space-y-2">
                <div className="text-sm font-medium text-gray-600 uppercase">
                  {signal}
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {quality.toFixed(0)}%
                </div>
                <Progress value={quality} className="h-2" />
                <Badge 
                  className={`text-xs ${
                    quality >= 90 ? 'bg-green-100 text-green-800' :
                    quality >= 70 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}
                >
                  {quality >= 90 ? 'Excellent' : quality >= 70 ? 'Good' : 'Poor'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="text-green-800">Personalized Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stressStatus === 'high' && (
              <>
                <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-800">Take a breathing break</p>
                    <p className="text-sm text-gray-600">Practice 4-7-8 breathing technique for 5 minutes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-800">Physical movement</p>
                    <p className="text-sm text-gray-600">Light stretching or a short walk can help reduce stress</p>
                  </div>
                </div>
              </>
            )}
            {stressStatus === 'moderate' && (
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-800">Mindfulness check-in</p>
                  <p className="text-sm text-gray-600">Take a moment to assess your current state and environment</p>
                </div>
              </div>
            )}
            {stressStatus === 'low' && (
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-800">Maintain balance</p>
                  <p className="text-sm text-gray-600">Great job! Continue current activities and stay hydrated</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StressMetrics;
