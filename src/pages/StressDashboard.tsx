import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useStressPrediction } from "@/hooks/useStressPrediction";
import { useBackendPrediction } from "@/hooks/useBackendPrediction";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileNavbar } from "@/components/MobileNavbar";
import {
  Heart,
  Thermometer,
  Zap,
  Activity,
  AlertTriangle,
  Calendar,
  Clock,
  Brain,
  Play,
  Pause,
  Wifi,
  WifiOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import StressMetrics from "@/components/StressMetrics";
import CameraModule from "@/components/CameraModule";
import ESP32StatusCard from "@/components/ESP32StatusCard";
import ECGChart from "@/components/ECGChart";
import BackendPrediction from "@/components/BackendPrediction";
import { useAIStressExplanation } from "@/hooks/useAIStressExplanation";
import AIStressExplanation from "@/components/AIStressExplanation";

interface BiometricData {
  id: string;
  heart_rate: number;
  temperature: number;
  ambient_temperature: number;
  gsr_value: number;
  gsr_baseline: number;
  gsr_change: number;
  raw_ecg_signal: number;
  leads_off_detected: boolean;
  heart_rate_variability: number;
  arrhythmia_detected: boolean;
  device_status: any;
  stress_level: string;
  stress_score: number;
  timestamp: string;
  created_at: string;
}

const StressDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { prediction, loading: predictionLoading, getPrediction } = useStressPrediction();
  const { prediction: backendPrediction, loading: backendLoading, error: backendError, lastUpdated, sendPredictionRequest, clearError } = useBackendPrediction();
  const { explanation, loading: aiLoading, error: aiError, lastUpdated: aiLastUpdated, generateExplanation, clearError: clearAIError } = useAIStressExplanation();
  const [currentData, setCurrentData] = useState<BiometricData | null>(null);
  const [recentDataForBackend, setRecentDataForBackend] = useState<BiometricData[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [stressLevel, setStressLevel] = useState(0.3);
  const [stressStatus, setStressStatus] = useState<"low" | "moderate" | "high">("low");
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [dailyStats, setDailyStats] = useState({
    averageStress: 0,
    peakStress: 0,
    calmMinutes: 0,
    sessionsToday: 0
  });
  const [esp32Status, setEsp32Status] = useState({
    connected: false,
    deviceId: "AD8232_ECG_001",
    lastSeen: null as Date | null,
    sensorsActive: 0,
    i2cEnabled: false,
    hasRecentData: false,
  });

  useEffect(() => {
    if (user) {
      fetchLatestData();
      fetchDailyStats();
      const displayName = user.email?.split('@')[0] || 'User';
      setUserName(displayName);
      const interval = setInterval(fetchLatestData, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchDailyStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from("biometric_data_enhanced")
        .select("stress_score, timestamp")
        .gte("timestamp", `${today}T00:00:00`)
        .lt("timestamp", `${today}T23:59:59`);

      if (data && data.length > 0) {
        const stressScores = data.map(d => d.stress_score || 0);
        const averageStress = stressScores.reduce((a, b) => a + b, 0) / stressScores.length;
        const peakStress = Math.max(...stressScores);
        const calmMinutes = data.filter(d => (d.stress_score || 0) < 40).length * 3; // 3 min intervals
        
        setDailyStats({
          averageStress: Math.round(averageStress),
          peakStress: Math.round(peakStress),
          calmMinutes,
          sessionsToday: data.length
        });
      }
    } catch (error) {
      console.error("Error fetching daily stats:", error);
    }
  };

  const fetchLatestData = async () => {
    try {
      const { data, error } = await supabase
        .from("biometric_data_enhanced")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setCurrentData(data);
        const stress = data.stress_score ? data.stress_score / 100 : 0.3;
        setStressLevel(stress);

        if (stress < 0.4) setStressStatus("low");
        else if (stress < 0.7) setStressStatus("moderate");
        else setStressStatus("high");

        const now = new Date();
        const dataTime = new Date(data.timestamp || data.created_at);
        const timeDiff = now.getTime() - dataTime.getTime();
        const hasRecentData = timeDiff < 10000;

        setEsp32Status(prev => ({
          ...prev,
          connected: hasRecentData,
          lastSeen: hasRecentData ? dataTime : prev.lastSeen,
          sensorsActive: hasRecentData ? 4 : 0,
          i2cEnabled: hasRecentData,
          hasRecentData
        }));

        if (hasRecentData && isMonitoring) {
          getPrediction(data);
          
          // Generate AI explanation when we have new data
          generateAIExplanation(data);
        }
      } else {
        setEsp32Status(prev => ({
          ...prev,
          connected: false,
          sensorsActive: 0,
          i2cEnabled: false,
          hasRecentData: false
        }));
      }

      const { data: recentData, error: recentError } = await supabase
        .from("biometric_data_enhanced")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(25);

      if (recentData && recentData.length >= 20) {
        setRecentDataForBackend(recentData);
        
        if (isMonitoring) {
          console.log('Sending data to backend prediction...');
          sendPredictionRequest(recentData);
        }
      } else {
        console.log('Not enough data for backend prediction:', recentData?.length || 0);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      setEsp32Status(prev => ({
        ...prev,
        connected: false,
        sensorsActive: 0,
        i2cEnabled: false,
        hasRecentData: false
      }));
    }
  };

  const generateAIExplanation = async (vitals: BiometricData) => {
    if (!user) return;

    try {
      // Fetch patient history
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.warn('Could not fetch user profile for AI explanation:', profileError);
      }

      // Determine stress level from current data
      const stressLevel = vitals.stress_score 
        ? vitals.stress_score < 40 ? 'Low' 
          : vitals.stress_score < 70 ? 'Moderate' 
          : 'High'
        : 'Unknown';

      // Generate explanation with patient history and current vitals
      await generateExplanation(
        profileData || {},
        {
          heart_rate: vitals.heart_rate,
          temperature: vitals.temperature,
          gsr_value: vitals.gsr_value,
          stress_score: vitals.stress_score,
        },
        stressLevel
      );
    } catch (error) {
      console.error('Error generating AI explanation:', error);
    }
  };

  const handleEmotionDetected = async (emotion: string, confidence: number) => {
    console.log("Emotion detected:", emotion, confidence);
    
    // Save facial analysis data
    if (user) {
      try {
        const stressScore = getEmotionStressScore(emotion);
        const { error } = await supabase.from('facial_analysis').insert({
          user_id: user.id,
          emotion: emotion,
          confidence: confidence,
          stress_level: stressScore,
        });

        if (error) {
          console.error('Error saving facial analysis:', error);
        } else {
          console.log('Facial analysis saved successfully');
        }
      } catch (error) {
        console.error('Database error:', error);
      }
    }

    if (currentData && isMonitoring) {
      getPrediction(currentData, { emotion, confidence });
    }
  };

  const handleRetryAIExplanation = () => {
    if (currentData) {
      generateAIExplanation(currentData);
    } else {
      toast({
        title: "No Current Data",
        description: "No physiological data available for analysis.",
        variant: "destructive",
      });
    }
  };

  const getEmotionStressScore = (emotion: string): number => {
    const emotionStressMap: { [key: string]: number } = {
      happy: 10,
      calm: 5,
      neutral: 20,
      surprised: 40,
      sad: 70,
      angry: 90,
      anxious: 85,
      focused: 25
    };
    return emotionStressMap[emotion] || 30;
  };

  const handleRetryBackendPrediction = () => {
    if (recentDataForBackend.length >= 20) {
      sendPredictionRequest(recentDataForBackend);
    } else {
      toast({
        title: "Insufficient Data",
        description: "Need at least 20 sensor readings for prediction.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {isMobile && <MobileNavbar />}
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 p-4 lg:p-6 ${isMobile ? 'pt-20' : ''}`}>
        <div className="max-w-7xl mx-auto space-y-4 lg:space-y-6">
          {/* Header */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {!isMobile && (
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    Welcome back, {userName}! 👋
                  </h1>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'short', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Last update: {currentData ? new Date(currentData.timestamp || currentData.created_at).toLocaleTimeString() : "Never"}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  {esp32Status.connected ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500" />
                  )}
                  <Badge variant={esp32Status.connected ? "default" : "destructive"} className="px-3 py-1 text-xs">
                    {esp32Status.connected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                <Button
                  onClick={() => setIsMonitoring(!isMonitoring)}
                  variant={isMonitoring ? "destructive" : "default"}
                  className="px-4 py-2 w-full sm:w-auto"
                  size={isMobile ? "sm" : "default"}
                >
                  {isMonitoring ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isMonitoring ? "Pause" : "Start"}
                </Button>
              </div>
            </div>
          </div>

          {/* AI Stress Explanation Display */}
          <AIStressExplanation
            explanation={explanation}
            loading={aiLoading}
            error={aiError}
            lastUpdated={aiLastUpdated}
            onRetry={handleRetryAIExplanation}
            onClearError={clearAIError}
          />

          {/* Backend AI Prediction Display */}
          <BackendPrediction
            prediction={backendPrediction}
            loading={backendLoading}
            error={backendError}
            lastUpdated={lastUpdated}
            onRetry={handleRetryBackendPrediction}
            onClearError={clearError}
          />

          {/* AI Prediction Display */}
          {prediction && (
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700">
              <CardHeader className="p-4 lg:p-6">
                <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200 text-lg">
                  <Sparkles className="w-5 h-5" />
                  AI Stress Analysis
                  {predictionLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4 lg:p-6 pt-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <Badge className={`${
                    prediction.stressLevel === 'low' ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400' :
                    prediction.stressLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {prediction.stressLevel.charAt(0).toUpperCase() + prediction.stressLevel.slice(1)} Stress
                  </Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Confidence: {(prediction.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                {prediction.recommendations.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recommendations:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {prediction.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Daily Insights Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2 p-3 lg:p-4">
                <CardTitle className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <Target className="w-3 lg:w-4 h-3 lg:h-4 text-blue-500" />
                  <span className="hidden sm:inline">Today's Average</span>
                  <span className="sm:hidden">Average</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 lg:p-4 pt-0">
                <div className="space-y-1">
                  <div className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">
                    {dailyStats.averageStress}%
                    <span className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 ml-1">Stress</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Daily average stress level</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-orange-500 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2 p-3 lg:p-4">
                <CardTitle className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <TrendingUp className="w-3 lg:w-4 h-3 lg:h-4 text-orange-500" />
                  <span className="hidden sm:inline">Peak Stress</span>
                  <span className="sm:hidden">Peak</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 lg:p-4 pt-0">
                <div className="space-y-1">
                  <div className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">
                    {dailyStats.peakStress}%
                    <span className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 ml-1">Max</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Highest stress today</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2 p-3 lg:p-4">
                <CardTitle className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <Heart className="w-3 lg:w-4 h-3 lg:h-4 text-green-500" />
                  <span className="hidden sm:inline">Calm Time</span>
                  <span className="sm:hidden">Calm</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 lg:p-4 pt-0">
                <div className="space-y-1">
                  <div className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">
                    {dailyStats.calmMinutes}
                    <span className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 ml-1">min</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Low stress periods</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2 p-3 lg:p-4">
                <CardTitle className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <Trophy className="w-3 lg:w-4 h-3 lg:h-4 text-purple-500" />
                  Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 lg:p-4 pt-0">
                <div className="space-y-1">
                  <div className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">
                    {dailyStats.sessionsToday}
                    <span className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 ml-1">today</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Monitoring sessions</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Essential Sensor Data */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-red-500 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2 p-3 lg:p-4">
                <CardTitle className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <Heart className="w-3 lg:w-4 h-3 lg:h-4 text-red-500" />
                  <span className="hidden sm:inline">Heart Rate</span>
                  <span className="sm:hidden">HR</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 lg:p-4 pt-0">
                <div className="space-y-1">
                  <div className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">
                    {currentData?.heart_rate || 0}
                    <span className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 ml-1">BPM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentData?.leads_off_detected ? (
                      <XCircle className="w-3 h-3 text-red-500" />
                    ) : (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    )}
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      {currentData?.leads_off_detected ? "Disconnected" : "Connected"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-red-500 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2 p-3 lg:p-4">
                <CardTitle className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <Thermometer className="w-3 lg:w-4 h-3 lg:h-4 text-red-500" />
                  <span className="hidden sm:inline">Temperature</span>
                  <span className="sm:hidden">Temp</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 lg:p-4 pt-0">
                <div className="space-y-1">
                  <div className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">
                    {currentData?.temperature?.toFixed(1) || "0.0"}
                    <span className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 ml-1">°C</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">MLX90614</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2 p-3 lg:p-4">
                <CardTitle className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <Zap className="w-3 lg:w-4 h-3 lg:h-4 text-purple-500" />
                  <span className="hidden sm:inline">EDA Level</span>
                  <span className="sm:hidden">EDA</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 lg:p-4 pt-0">
                <div className="space-y-1">
                  <div className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">
                    {currentData?.gsr_value?.toFixed(0) || 0}
                    <span className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 ml-1">Ω</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Skin conductance</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2 p-3 lg:p-4">
                <CardTitle className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <Activity className="w-3 lg:w-4 h-3 lg:h-4 text-blue-500" />
                  <span className="hidden sm:inline">ECG Signal</span>
                  <span className="sm:hidden">ECG</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 lg:p-4 pt-0">
                <div className="space-y-1">
                  <div className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">
                    {currentData?.raw_ecg_signal || 0}
                    <span className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 ml-1">mV</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentData?.arrhythmia_detected ? (
                      <AlertCircle className="w-3 h-3 text-yellow-500" />
                    ) : (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    )}
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      {currentData?.arrhythmia_detected ? "Irregular" : "Normal"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ECG Real-time Chart */}
          {esp32Status.hasRecentData && (
            <ECGChart
              isActive={isMonitoring}
              rawEcgSignal={currentData?.raw_ecg_signal}
              heartRate={currentData?.heart_rate}
              leadsOffDetected={currentData?.leads_off_detected}
              arrhythmiaDetected={currentData?.arrhythmia_detected}
            />
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
            <div className="space-y-4 lg:space-y-6">
              <StressMetrics
                stressLevel={stressLevel}
                stressStatus={stressStatus}
                signalQuality={{
                  bvp: 92,
                  eda: 88,
                  temp: 95,
                  hr: 91,
                }}
                isMonitoring={isMonitoring}
              />
              <ESP32StatusCard status={esp32Status} />
            </div>

            <div className="space-y-4 lg:space-y-6">
              <CameraModule
                isActive={isMonitoring}
                onEmotionDetected={handleEmotionDetected}
              />
            </div>
          </div>

          {/* High Stress Alert */}
          {stressStatus === "high" && (
            <Card className="bg-red-50/90 dark:bg-red-950/30 backdrop-blur-sm border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-800 dark:text-red-200">
                      High Stress Level Detected
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Consider taking a break and trying some relaxation techniques.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default StressDashboard;
