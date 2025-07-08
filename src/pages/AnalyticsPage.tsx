
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import {
  Activity,
  Heart,
  Thermometer,
  Zap,
  TrendingUp,
  Brain,
  Gauge,
  Signal
} from "lucide-react";

interface BiometricReading {
  id: string;
  heart_rate: number;
  temperature: number;
  ambient_temperature: number;
  gsr_value: number;
  gsr_baseline: number;
  gsr_change: number;
  raw_ecg_signal: number;
  heart_rate_variability: number;
  stress_score: number;
  timestamp: string;
  created_at: string;
}

interface AnalyticsMetric {
  title: string;
  value: string;
  percentage: number;
  icon: React.ReactNode;
  color: string;
  description: string;
  status: 'excellent' | 'good' | 'fair' | 'poor';
}

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [readings, setReadings] = useState<BiometricReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);

  useEffect(() => {
    if (user) {
      fetchLastReadings();
      const interval = setInterval(fetchLastReadings, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchLastReadings = async () => {
    try {
      const { data, error } = await supabase
        .from('biometric_data_enhanced')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (data && !error) {
        setReadings(data);
        calculateMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching readings:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (data: BiometricReading[]) => {
    if (data.length === 0) return;

    const latest = data[0];
    const avgHR = data.reduce((sum, r) => sum + (r.heart_rate || 0), 0) / data.length;
    const avgTemp = data.reduce((sum, r) => sum + (r.temperature || 0), 0) / data.length;
    const avgGSR = data.reduce((sum, r) => sum + (r.gsr_value || 0), 0) / data.length;
    const avgHRV = data.reduce((sum, r) => sum + (r.heart_rate_variability || 0), 0) / data.length;

    // Calculate autonomic balance (simplified HRV-based metric)
    const autonomicBalance = Math.min(100, Math.max(0, (avgHRV / 50) * 100));
    
    // Calculate HRV stress index
    const hrvStressIndex = Math.min(100, Math.max(0, 100 - (avgHRV / 60 * 100)));
    
    // Calculate EDA reactivity (GSR responsiveness)
    const gsrVariability = data.length > 1 ? 
      Math.sqrt(data.reduce((sum, r, i) => {
        if (i === 0) return 0;
        return sum + Math.pow((r.gsr_value || 0) - (data[i-1].gsr_value || 0), 2);
      }, 0) / (data.length - 1)) : 0;
    const edaReactivity = Math.min(100, (gsrVariability / 100) * 100);
    
    // Calculate thermal comfort (temperature regulation)
    const tempStability = 100 - Math.abs((avgTemp - 36.5) * 10);
    const thermalComfort = Math.min(100, Math.max(0, tempStability));

    const newMetrics: AnalyticsMetric[] = [
      {
        title: 'Autonomic Balance',
        value: `${autonomicBalance.toFixed(1)}%`,
        percentage: autonomicBalance,
        icon: <Activity className="w-5 h-5 text-blue-500" />,
        color: 'from-blue-500 to-blue-600',
        description: 'Sympathetic vs Parasympathetic activity',
        status: autonomicBalance > 70 ? 'excellent' : autonomicBalance > 50 ? 'good' : autonomicBalance > 30 ? 'fair' : 'poor'
      },
      {
        title: 'HRV Stress Index',
        value: `${hrvStressIndex.toFixed(1)}%`,
        percentage: hrvStressIndex,
        icon: <Heart className="w-5 h-5 text-red-500" />,
        color: 'from-red-500 to-red-600',
        description: 'Heart rate variability based stress indicator',
        status: hrvStressIndex < 30 ? 'excellent' : hrvStressIndex < 50 ? 'good' : hrvStressIndex < 70 ? 'fair' : 'poor'
      },
      {
        title: 'EDA Reactivity',
        value: `${edaReactivity.toFixed(1)}%`,
        percentage: edaReactivity,
        icon: <Zap className="w-5 h-5 text-yellow-500" />,
        color: 'from-yellow-500 to-yellow-600',
        description: 'Electrodermal activity responsiveness',
        status: edaReactivity > 40 && edaReactivity < 70 ? 'excellent' : edaReactivity > 20 ? 'good' : 'fair'
      },
      {
        title: 'Thermal Comfort',
        value: `${thermalComfort.toFixed(1)}%`,
        percentage: thermalComfort,
        icon: <Thermometer className="w-5 h-5 text-green-500" />,
        color: 'from-green-500 to-green-600',
        description: 'Skin temperature regulation efficiency',
        status: thermalComfort > 80 ? 'excellent' : thermalComfort > 60 ? 'good' : thermalComfort > 40 ? 'fair' : 'poor'
      }
    ];

    setMetrics(newMetrics);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'fair': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatChartData = (key: keyof BiometricReading) => {
    return readings.slice().reverse().map((reading, index) => ({
      time: new Date(reading.created_at).toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      value: reading[key] as number || 0,
      index: index + 1
    }));
  };

  const signalQuality = {
    bvp: readings.length > 0 ? Math.min(100, (readings[0]?.heart_rate || 0) > 40 ? 92 : 60) : 0,
    eda: readings.length > 0 ? Math.min(100, (readings[0]?.gsr_value || 0) > 100 ? 88 : 50) : 0,
    temp: readings.length > 0 ? Math.min(100, (readings[0]?.temperature || 0) > 30 ? 95 : 70) : 0,
    hr: readings.length > 0 ? Math.min(100, (readings[0]?.heart_rate || 0) > 40 ? 91 : 60) : 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Biometric Analytics
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Advanced physiological monitoring and stress analysis
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <Card key={index} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {metric.icon}
                    <div>
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {metric.title}
                      </CardTitle>
                      <Badge className={getStatusColor(metric.status)} variant="outline">
                        {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {metric.value}
                </div>
                <div className="space-y-2">
                  <Progress value={metric.percentage} className="h-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {metric.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Heart Rate Chart */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Heart className="w-5 h-5 text-red-500" />
                Heart Rate Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={formatChartData('heart_rate')}>
                    <defs>
                      <linearGradient id="heartRateGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#ef4444"
                      fillOpacity={1}
                      fill="url(#heartRateGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Temperature Chart */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Thermometer className="w-5 h-5 text-orange-500" />
                Temperature Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formatChartData('temperature')}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#f97316"
                      strokeWidth={3}
                      dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#f97316' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* GSR Chart */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Zap className="w-5 h-5 text-yellow-500" />
                GSR Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formatChartData('gsr_value')}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    />
                    <Bar dataKey="value" fill="#eab308" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* HRV Chart */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Activity className="w-5 h-5 text-purple-500" />
                Heart Rate Variability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={formatChartData('heart_rate_variability')}>
                    <defs>
                      <linearGradient id="hrvGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#8b5cf6"
                      fillOpacity={1}
                      fill="url(#hrvGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Signal Quality Monitoring */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Signal className="w-5 h-5 text-blue-500" />
              Signal Quality Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'BVP', value: signalQuality.bvp, color: 'text-red-500' },
                { label: 'EDA', value: signalQuality.eda, color: 'text-yellow-500' },
                { label: 'TEMP', value: signalQuality.temp, color: 'text-green-500' },
                { label: 'HR', value: signalQuality.hr, color: 'text-blue-500' }
              ].map((signal, index) => (
                <div key={index} className="text-center space-y-2">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {signal.label}
                  </div>
                  <div className={`text-3xl font-bold ${signal.color}`}>
                    {signal.value}%
                  </div>
                  <Badge 
                    className={signal.value > 90 ? 'bg-green-100 text-green-800' : 
                              signal.value > 70 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}
                  >
                    {signal.value > 90 ? 'Excellent' : signal.value > 70 ? 'Good' : 'Poor'}
                  </Badge>
                  <Progress value={signal.value} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
