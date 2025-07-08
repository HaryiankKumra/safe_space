
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Heart,
  Thermometer,
  Zap,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  Clock,
  User,
  Calculator,
  Droplets,
  Moon,
  Play,
  Pause,
  Wifi,
  WifiOff,
  Signal,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  Brain,
} from "lucide-react";
import StressMetrics from "@/components/StressMetrics";
import CameraModule from "@/components/CameraModule";
import StressChatbot from "@/components/StressChatbot";
import ESP32StatusCard from "@/components/ESP32StatusCard";
import ConfigurationStatus from "@/components/ConfigurationStatus";
import SignalChart from "@/components/SignalChart";
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

interface UserProfile {
  weight: number | null;
  height: number | null;
  age: number | null;
  sleep_target_hours: number | null;
  water_intake_target: number | null;
}

const StressDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentData, setCurrentData] = useState<BiometricData | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
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
      fetchUserProfile();
      fetchLatestData();
      const displayName = user.email?.split('@')[0] || 'User';
      setUserName(displayName);
      const interval = setInterval(fetchLatestData, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("weight, height, age, sleep_target_hours, water_intake_target")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
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

  const calculateBMI = () => {
    if (userProfile?.weight && userProfile?.height) {
      const heightInM = userProfile.height / 100;
      return (userProfile.weight / (heightInM * heightInM)).toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Underweight", color: "text-blue-500" };
    if (bmi < 25) return { category: "Normal", color: "text-green-500" };
    if (bmi < 30) return { category: "Overweight", color: "text-yellow-500" };
    return { category: "Obese", color: "text-red-500" };
  };

  const handleEmotionDetected = (emotion: string, confidence: number) => {
    console.log("Emotion detected:", emotion, confidence);
  };

  const bmi = calculateBMI();
  const bmiData = bmi ? getBMICategory(parseFloat(bmi)) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
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

        {/* Enhanced Sensor Data Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* MLX90614 Temperature Sensor Cards */}
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
                <p className="text-xs text-gray-500 dark:text-gray-400">MLX90614 Non-contact</p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">±0.5°C accuracy</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-orange-500 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-orange-500" />
                Ambient Temperature
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentData?.ambient_temperature?.toFixed(1) || "0.0"}
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">°C</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Environmental</p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">Room temperature</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AD8232 ECG Sensor Cards */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-red-600 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-600" />
                Heart Rate (ECG)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentData?.heart_rate || 0}
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">BPM</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">AD8232 Sensor</p>
                <div className="flex items-center gap-2">
                  {currentData?.leads_off_detected ? (
                    <XCircle className="w-3 h-3 text-red-500" />
                  ) : (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  )}
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {currentData?.leads_off_detected ? "Leads disconnected" : "Leads connected"}
                  </span>
                </div>
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
                <p className="text-xs text-gray-500 dark:text-gray-400">Raw waveform</p>
                <div className="flex items-center gap-2">
                  {currentData?.arrhythmia_detected ? (
                    <AlertCircle className="w-3 h-3 text-yellow-500" />
                  ) : (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  )}
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {currentData?.arrhythmia_detected ? "Irregular rhythm" : "Normal rhythm"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-indigo-500 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                Heart Rate Variability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentData?.heart_rate_variability?.toFixed(1) || "0.0"}
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">ms</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Beat-to-beat variation</p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">Autonomic function</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GSR Sensor Cards */}
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
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">Emotional arousal</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <Eye className="w-4 h-4 text-green-500" />
                GSR Baseline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentData?.gsr_baseline || 0}
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">Ω</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Calibrated reference</p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">Resting state</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-yellow-500 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-yellow-500" />
                GSR Change
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentData?.gsr_change || 0}
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">Δ</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">From baseline</p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">Stress indicator</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Health Targets */}
        {userProfile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <Moon className="w-4 h-4 text-indigo-500" />
                  Sleep Target
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-xl font-semibold text-gray-900 dark:text-white">
                    {userProfile.sleep_target_hours || 8} hours
                  </div>
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">6/8 hours completed</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-500" />
                  Water Intake
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-xl font-semibold text-gray-900 dark:text-white">
                    {userProfile.water_intake_target || 2000} ml
                  </div>
                  <Progress value={60} className="h-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">1200/2000 ml today</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-500" />
                  BMI Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bmi ? (
                  <div className="space-y-1">
                    <div className="text-xl font-semibold text-gray-900 dark:text-white">{bmi}</div>
                    <p className={`text-sm font-medium ${bmiData?.color}`}>
                      {bmiData?.category}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="text-xl font-semibold text-gray-400">--</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Update profile</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ECG Real-time Chart */}
        {esp32Status.hasRecentData && (
          <div className="grid grid-cols-1 gap-6">
            <ECGChart
              isActive={isMonitoring}
              rawEcgSignal={currentData?.raw_ecg_signal}
              heartRate={currentData?.heart_rate}
              leadsOffDetected={currentData?.leads_off_detected}
              arrhythmiaDetected={currentData?.arrhythmia_detected}
            />
          </div>
        )}

        {/* Live Monitoring Charts */}
        {esp32Status.hasRecentData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SignalChart
              title="Heart Rate Monitor (AD8232)"
              icon={<Heart className="w-5 h-5 text-red-500" />}
              color="#ef4444"
              quality={signalQuality.hr}
              isActive={isMonitoring}
            />
            <SignalChart
              title="GSR Signal"
              icon={<Zap className="w-5 h-5 text-yellow-500" />}
              color="#eab308"
              quality={signalQuality.eda}
              isActive={isMonitoring}
            />
          </div>
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
            <ConfigurationStatus />
          </div>
        </div>

        {/* Chatbot */}
        <div className="grid grid-cols-1 gap-6">
          <StressChatbot />
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

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            StressGuard AI - Developed by Haryiank Kumra
          </p>
        </div>
      </div>
    </div>
  );
};

export default StressDashboard;
