import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileNavbar } from "@/components/MobileNavbar";
import {
  Heart,
  Thermometer,
  Zap,
  Activity,
  AlertTriangle,
  Calendar,
  Brain,
  Wifi,
  WifiOff,
  CheckCircle,
  TrendingUp,
  Smile,
  Frown,
  Meh,
  Camera,
} from "lucide-react";
import CameraModule from "@/components/CameraModule";

interface BiometricData {
  id: string;
  heart_rate: number;
  temperature: number;
  gsr_value: number;
  raw_ecg_signal: number;
  stress_level: string;
  stress_score: number;
  timestamp: string;
  created_at: string;
}

const StressDashboard: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const [currentData, setCurrentData] = useState<BiometricData | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [overallStress, setOverallStress] = useState<number>(0);
  const [facialEmotion, setFacialEmotion] = useState<string>("neutral");
  const [facialConfidence, setFacialConfidence] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [dailyStats, setDailyStats] = useState({
    averageStress: 0,
    readings: 0
  });

  useEffect(() => {
    if (user) {
      const displayName = user.full_name || user.email?.split('@')[0] || 'User';
      setUserName(displayName);
      fetchLatestData();
      fetchDailyStats();
      const interval = setInterval(fetchLatestData, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchDailyStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await (supabase as any)
        .from("biometric_data_enhanced")
        .select("stress_score")
        .gte("timestamp", `${today}T00:00:00`)
        .lt("timestamp", `${today}T23:59:59`);

      if (data && data.length > 0) {
        const scores = data.map((d: any) => d.stress_score || 0).filter((s: number) => s > 0);
        if (scores.length > 0) {
          setDailyStats({
            averageStress: Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length),
            readings: scores.length
          });
        }
      }
    } catch (error) {
      console.error("Error fetching daily stats:", error);
    }
  };

  const fetchLatestData = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("biometric_data_enhanced")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        setIsConnected(false);
        return;
      }

      if (data) {
        const dataAge = Date.now() - new Date(data.created_at).getTime();
        const isRecent = dataAge < 30000;
        setIsConnected(isRecent);
        setCurrentData(data as BiometricData);
        setLastUpdate(new Date(data.created_at));
        if (data.stress_score) setOverallStress(data.stress_score);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsConnected(false);
    }
  };

  const handleEmotionDetected = async (emotion: string, confidence: number) => {
    setFacialEmotion(emotion);
    setFacialConfidence(confidence);
    
    if (user) {
      try {
        const stressScore = getEmotionStressScore(emotion);
        await (supabase as any).from('facial_analysis').insert({
          user_id: user.id,
          emotion: emotion,
          confidence: confidence,
          stress_level: stressScore,
        });
      } catch (error) {
        console.error("Error saving facial analysis:", error);
      }
    }
  };

  const getEmotionStressScore = (emotion: string): number => {
    const map: { [key: string]: number } = {
      happy: 10, calm: 5, neutral: 25, surprised: 45, sad: 70, angry: 90, anxious: 85, focused: 20
    };
    return map[emotion] || 30;
  };

  const getStressColor = (score: number) => {
    if (score < 30) return "text-green-500";
    if (score < 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getStressLabel = (score: number) => {
    if (score < 30) return "Low";
    if (score < 60) return "Moderate";
    return "High";
  };

  const getEmotionIcon = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'happy':
      case 'calm':
        return <Smile className="w-8 h-8 text-green-500" />;
      case 'sad':
      case 'angry':
      case 'anxious':
        return <Frown className="w-8 h-8 text-red-500" />;
      default:
        return <Meh className="w-8 h-8 text-yellow-500" />;
    }
  };

  return (
    <>
      {isMobile && <MobileNavbar />}
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 ${isMobile ? 'pt-16' : ''}`}>
        <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                Welcome, {userName}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isConnected ? "default" : "secondary"} className={`${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}>
                {isConnected ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                {isConnected ? 'Live' : 'Offline'}
              </Badge>
              {lastUpdate && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Updated {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          {/* Main Stress Score Card */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="relative w-40 h-40 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200 dark:text-gray-700" />
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" strokeDasharray={`${overallStress * 2.51} 251`} strokeLinecap="round" className={getStressColor(overallStress)} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-bold ${getStressColor(overallStress)}`}>{overallStress}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Stress</span>
                  </div>
                </div>
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    {getStressLabel(overallStress)} Stress
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {overallStress < 30 && "You're doing great! Keep up the good work."}
                    {overallStress >= 30 && overallStress < 60 && "Some stress detected. Consider a short break."}
                    {overallStress >= 60 && "High stress. Try some relaxation techniques."}
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                    <Badge variant="outline"><TrendingUp className="w-3 h-3 mr-1" />Avg: {dailyStats.averageStress}%</Badge>
                    <Badge variant="outline"><Activity className="w-3 h-3 mr-1" />{dailyStats.readings} readings</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vital Signs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                    <Heart className="w-5 h-5 text-red-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Heart Rate</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentData?.heart_rate || '--'}<span className="text-sm font-normal text-gray-500 ml-1">BPM</span>
                </div>
                <Progress value={currentData?.heart_rate ? Math.min((currentData.heart_rate / 200) * 100, 100) : 0} className="h-1 mt-2" />
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                    <Thermometer className="w-5 h-5 text-orange-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Temp</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentData?.temperature?.toFixed(1) || '--'}<span className="text-sm font-normal text-gray-500 ml-1">°C</span>
                </div>
                <Progress value={currentData?.temperature ? ((currentData.temperature - 35) / 5) * 100 : 0} className="h-1 mt-2" />
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <Zap className="w-5 h-5 text-purple-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">EDA</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentData?.gsr_value?.toFixed(0) || '--'}<span className="text-sm font-normal text-gray-500 ml-1">Ω</span>
                </div>
                <Progress value={currentData?.gsr_value ? Math.min((currentData.gsr_value / 1000) * 100, 100) : 0} className="h-1 mt-2" />
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Activity className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">ECG</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentData?.raw_ecg_signal?.toFixed(2) || '--'}<span className="text-sm font-normal text-gray-500 ml-1">mV</span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-gray-500">Normal</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Camera & Emotion */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur border-0 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Camera className="w-5 h-5 text-blue-500" />
                  Facial Analysis
                </CardTitle>
                <CardDescription>Real-time emotion detection</CardDescription>
              </CardHeader>
              <CardContent>
                <CameraModule isActive={true} onEmotionDetected={handleEmotionDetected} />
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur border-0 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Brain className="w-5 h-5 text-purple-500" />
                  Current Emotion
                </CardTitle>
                <CardDescription>AI-detected expression</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                    {getEmotionIcon(facialEmotion)}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white capitalize mb-2">{facialEmotion}</h3>
                  <Badge variant="outline" className="mb-4">{(facialConfidence * 100).toFixed(0)}% confidence</Badge>
                  <div className="w-full max-w-xs">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Relaxed</span>
                      <span>Stressed</span>
                    </div>
                    <Progress value={getEmotionStressScore(facialEmotion)} className="h-2" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
                    Facial stress: {getEmotionStressScore(facialEmotion)}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alert */}
          {overallStress >= 70 && (
            <Card className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/50">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-200">High Stress Detected</h3>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Consider taking a break. Try deep breathing or use the AI chat for advice.
                  </p>
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
