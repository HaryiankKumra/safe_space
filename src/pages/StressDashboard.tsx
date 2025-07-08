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
} from "lucide-react";
import StressMetrics from "@/components/StressMetrics";
import CameraModule from "@/components/CameraModule";
import StressChatbot from "@/components/StressChatbot";
import ESP32StatusCard from "@/components/ESP32StatusCard";
import ConfigurationStatus from "@/components/ConfigurationStatus";

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
  const [stressLevel, setStressLevel] = useState(0.3);
  const [stressStatus, setStressStatus] = useState<"low" | "moderate" | "high">(
    "low",
  );
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [esp32Status, setEsp32Status] = useState({
    connected: true,
    deviceId: "ESP32_001",
    lastSeen: new Date(),
    sensorsActive: 3,
    i2cEnabled: true,
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
      }
    } catch (error) {
      console.error("Error fetching data:", error);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Last updated:{" "}
              {currentData
                ? new Date(currentData.timestamp).toLocaleTimeString()
                : "Never"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              className={`px-3 py-1 ${isMonitoring ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}
            >
              {isMonitoring ? "🟢 Live Monitoring" : "🔴 Monitoring Stopped"}
            </Badge>
            <Button
              onClick={() => setIsMonitoring(!isMonitoring)}
              variant={isMonitoring ? "destructive" : "default"}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {isMonitoring ? "Stop" : "Start"} Monitoring
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Current Vitals */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400" />
                Heart Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {currentData?.heart_rate || 72} BPM
                  </div>
                  <div className="text-xs text-slate-400">Normal Range</div>
                </div>
                {/* ECG Animation */}
                <div className="w-16 h-8 relative overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 64 32">
                    <path
                      d="M0,16 L10,16 L12,8 L14,24 L16,16 L20,16 L22,12 L24,20 L26,16 L64,16"
                      stroke="#ef4444"
                      strokeWidth="2"
                      fill="none"
                      className="animate-pulse"
                    />
                    <path
                      d="M0,16 L10,16 L12,8 L14,24 L16,16 L20,16 L22,12 L24,20 L26,16 L64,16"
                      stroke="#ef4444"
                      strokeWidth="2"
                      fill="none"
                      className="animate-pulse"
                      style={{
                        strokeDasharray: "100",
                        strokeDashoffset: "100",
                        animation: "dash 2s linear infinite",
                      }}
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-orange-400" />
                Temperature
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {currentData?.temperature || 36.5}°C
              </div>
              <div className="text-xs text-slate-400">Normal</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                GSR Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {currentData?.gsr_value || 450} Ω
              </div>
              <div className="text-xs text-slate-400">Skin Conductance</div>
            </CardContent>
          </Card>

          {/* BMI Card */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-400" />
                BMI
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bmi ? (
                <div>
                  <div className="text-2xl font-bold text-white">{bmi}</div>
                  <div className={`text-xs ${bmiData?.color}`}>
                    {bmiData?.category}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-lg text-slate-400">--</div>
                  <div className="text-xs text-slate-500">
                    Set height & weight
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Health Targets */}
        {userProfile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                  <Moon className="w-4 h-4 text-purple-400" />
                  Sleep Target
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-white">
                  {userProfile.sleep_target_hours || 8} hours
                </div>
                <Progress value={75} className="mt-2" />
                <div className="text-xs text-slate-400 mt-1">
                  6/8 hours today
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  Water Intake
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-white">
                  {userProfile.water_intake_target || 2000} ml
                </div>
                <Progress value={60} className="mt-2" />
                <div className="text-xs text-slate-400 mt-1">
                  1200/2000 ml today
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-400" />
                  Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-white">45 min</div>
                <Progress value={90} className="mt-2" />
                <div className="text-xs text-slate-400 mt-1">
                  45/50 min today
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stress Metrics */}
          <div className="space-y-6">
            <StressMetrics
              stressLevel={stressLevel}
              stressStatus={stressStatus}
              signalQuality={signalQuality}
              isMonitoring={isMonitoring}
            />
          </div>

          {/* Camera and Status */}
          <div className="space-y-6">
            <CameraModule
              isActive={isMonitoring}
              onEmotionDetected={handleEmotionDetected}
            />
            <ESP32StatusCard status={esp32Status} />
          </div>
        </div>

        {/* Configuration Status & Chatbot */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1">
            <ConfigurationStatus />
          </div>
          <div className="xl:col-span-2">
            <StressChatbot />
          </div>
        </div>

        {/* Stress Notifications */}
        {stressStatus === "high" && (
          <Card className="bg-red-500/10 border-red-500/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <div>
                  <h3 className="font-semibold text-red-400">
                    High Stress Detected
                  </h3>
                  <p className="text-red-300 text-sm">
                    Your stress levels are elevated. Consider taking a break and
                    trying some relaxation techniques.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* CSS for ECG Animation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes dash {
            0% {
              stroke-dashoffset: 100;
            }
            100% {
              stroke-dashoffset: -100;
            }
          }
        `,
        }}
      />
    </div>
  );
};

export default StressDashboard;
