
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
} from "lucide-react";
import StressMetrics from "@/components/StressMetrics";
import CameraModule from "@/components/CameraModule";
import ESP32StatusCard from "@/components/ESP32StatusCard";
import ECGChart from "@/components/ECGChart";

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
  const [currentData, setCurrentData] = useState<BiometricData | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [stressLevel, setStressLevel] = useState(0.3);
  const [stressStatus, setStressStatus] = useState<"low" | "moderate" | "high">("low");
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [esp32Status, setEsp32Status] = useState({
    connected: false,
    deviceId: "AD8232_ECG_001",
    lastSeen: null as Date | null,
    sensorsActive: 0,
    i2cEnabled: false,
    hasRecentData: false,
  });

  const signalQuality = {
    bvp: 92,
    eda: 88,
    temp: 95,
    hr: 91,
  };

  useEffect(() => {
    if (user) {
      fetchLatestData();
      const displayName = user.email?.split('@')[0] || 'User';
      setUserName(displayName);
      const interval = setInterval(fetchLatestData, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

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
      } else {
        setEsp32Status(prev => ({
          ...prev,
          connected: false,
          sensorsActive: 0,
          i2cEnabled: false,
          hasRecentData: false
        }));
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

  const handleEmotionDetected = (emotion: string, confidence: number) => {
    console.log("Emotion detected:", emotion, confidence);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Simplified Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Welcome back, {userName}! 👋
                </h1>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
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

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {esp32Status.connected ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <Badge variant={esp32Status.connected ? "default" : "destructive"} className="px-3 py-1">
                  {esp32Status.connected ? "Connected" : "Disconnected"}
                </Badge>
              </div>
              <Button
                onClick={() => setIsMonitoring(!isMonitoring)}
                variant={isMonitoring ? "destructive" : "default"}
                className="px-4 py-2"
              >
                {isMonitoring ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isMonitoring ? "Pause" : "Start"}
              </Button>
            </div>
          </div>
        </div>

        {/* Essential Sensor Data - Reduced Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-red-600 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-600" />
                Heart Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentData?.heart_rate || 0}
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">BPM</span>
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
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-red-500" />
                Body Temperature
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentData?.temperature?.toFixed(1) || "0.0"}
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">°C</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">MLX90614</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-500" />
                GSR Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentData?.gsr_value?.toFixed(0) || 0}
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">Ω</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Skin conductance</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                ECG Signal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentData?.raw_ecg_signal || 0}
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">mV</span>
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
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-6">
            <StressMetrics
              stressLevel={stressLevel}
              stressStatus={stressStatus}
              signalQuality={signalQuality}
              isMonitoring={isMonitoring}
            />
            <ESP32StatusCard status={esp32Status} />
          </div>

          <div className="space-y-6">
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
  );
};

export default StressDashboard;
