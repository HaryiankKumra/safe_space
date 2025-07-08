
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
} from "lucide-react";
import StressMetrics from "@/components/StressMetrics";
import CameraModule from "@/components/CameraModule";
import StressChatbot from "@/components/StressChatbot";
import ESP32StatusCard from "@/components/ESP32StatusCard";
import ConfigurationStatus from "@/components/ConfigurationStatus";
import SignalChart from "@/components/SignalChart";

interface BiometricData {
  heart_rate: number;
  temperature: number;
  gsr_value: number;
  stress_level: string;
  stress_score: number;
  timestamp: string;
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
      // Get username from email
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

        // Update ESP32 status based on data availability
        const now = new Date();
        const dataTime = new Date(data.timestamp || data.created_at);
        const timeDiff = now.getTime() - dataTime.getTime();
        const hasRecentData = timeDiff < 10000; // Data within last 10 seconds

        setEsp32Status(prev => ({
          ...prev,
          connected: hasRecentData,
          lastSeen: hasRecentData ? dataTime : prev.lastSeen,
          sensorsActive: hasRecentData ? 4 : 0,
          i2cEnabled: hasRecentData,
          hasRecentData
        }));
      } else {
        // No data available, device is disconnected
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
      // Error fetching data, consider device disconnected
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
    if (bmi < 18.5) return { category: "Underweight", color: "text-blue-400" };
    if (bmi < 25) return { category: "Normal", color: "text-green-400" };
    if (bmi < 30) return { category: "Overweight", color: "text-yellow-400" };
    return { category: "Obese", color: "text-red-400" };
  };

  const handleEmotionDetected = (emotion: string, confidence: number) => {
    console.log("Emotion detected:", emotion, confidence);
  };

  const bmi = calculateBMI();
  const bmiData = bmi ? getBMICategory(parseFloat(bmi)) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Good Morning, {userName}! 👋
              </h1>
              <p className="text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
                <Clock className="w-4 h-4" />
                Last updated: {currentData ? new Date(currentData.timestamp).toLocaleTimeString() : "Never"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Badge className={`px-4 py-2 text-sm ${isMonitoring ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-red-100 text-red-700 border-red-200"}`}>
                {isMonitoring ? "🟢 Live Monitoring" : "🔴 Monitoring Stopped"}
              </Badge>
              <Button
                onClick={() => setIsMonitoring(!isMonitoring)}
                variant={isMonitoring ? "destructive" : "default"}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-2"
              >
                {isMonitoring ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isMonitoring ? "Pause" : "Start"} Monitoring
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Vital Signs Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-100 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-red-600 flex items-center gap-2">
                <div className="p-2 bg-red-100 rounded-xl">
                  <Heart className="w-4 h-4 text-red-500" />
                </div>
                Heart Rate (ECG)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-red-600">
                    {currentData?.heart_rate || 72}
                  </div>
                  <div className="text-sm text-red-500">BPM</div>
                  <div className="text-xs text-red-400 mt-1">Normal Range</div>
                </div>
                <div className="w-16 h-12 relative overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 64 48">
                    <path
                      d="M0,24 L10,24 L12,12 L14,36 L16,24 L20,24 L22,18 L24,30 L26,24 L64,24"
                      stroke="#ef4444"
                      strokeWidth="2"
                      fill="none"
                      className="animate-pulse"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-600 flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Activity className="w-4 h-4 text-blue-500" />
                </div>
                Pulse Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {currentData?.heart_rate || 72}
              </div>
              <div className="text-sm text-blue-500">BPM</div>
              <div className="text-xs text-blue-400 mt-1">AD8232 Sensor</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-100 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-orange-600 flex items-center gap-2">
                <div className="p-2 bg-orange-100 rounded-xl">
                  <Thermometer className="w-4 h-4 text-orange-500" />
                </div>
                Body Temperature
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {currentData?.temperature || 36.5}
              </div>
              <div className="text-sm text-orange-500">°C</div>
              <div className="text-xs text-orange-400 mt-1">Normal</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-purple-600 flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Zap className="w-4 h-4 text-purple-500" />
                </div>
                GSR Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {currentData?.gsr_value || 450}
              </div>
              <div className="text-sm text-purple-500">Ω</div>
              <div className="text-xs text-purple-400 mt-1">Skin Conductance</div>
            </CardContent>
          </Card>
        </div>

        {/* Health Targets */}
        {userProfile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-purple-600 flex items-center gap-2">
                  <Moon className="w-4 h-4 text-purple-500" />
                  Sleep Target
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {userProfile.sleep_target_hours || 8} hours
                </div>
                <Progress value={75} className="mb-2" />
                <div className="text-xs text-purple-500">6/8 hours today</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-100 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-cyan-600 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-500" />
                  Water Intake
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyan-600 mb-2">
                  {userProfile.water_intake_target || 2000} ml
                </div>
                <Progress value={60} className="mb-2" />
                <div className="text-xs text-cyan-500">1200/2000 ml today</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-emerald-600 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-500" />
                  BMI Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bmi ? (
                  <div>
                    <div className="text-2xl font-bold text-emerald-600 mb-1">{bmi}</div>
                    <div className={`text-sm ${bmiData?.color}`}>
                      {bmiData?.category}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-lg text-slate-500">--</div>
                    <div className="text-xs text-slate-500">
                      Set height & weight in settings
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <StressMetrics
              stressLevel={stressLevel}
              stressStatus={stressStatus}
              signalQuality={signalQuality}
              isMonitoring={isMonitoring}
            />
          </div>

          <div className="space-y-6">
            <CameraModule
              isActive={isMonitoring}
              onEmotionDetected={handleEmotionDetected}
            />
            <ESP32StatusCard status={esp32Status} />
          </div>
        </div>

        {/* Chatbot */}
        <div className="grid grid-cols-1 gap-6">
          <StressChatbot />
        </div>

        {/* Stress Notifications */}
        {stressStatus === "high" && (
          <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-700 text-lg mb-1">
                    High Stress Level Detected
                  </h3>
                  <p className="text-red-600 text-sm">
                    Your stress levels are elevated. Consider taking a break and trying some relaxation techniques.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-slate-500 dark:text-slate-400 text-sm py-6">
          <p className="bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 inline-block">
            StressGuard AI - Developed by Haryiank Kumra
          </p>
        </div>
      </div>
    </div>
  );
};

export default StressDashboard;
