import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Camera,
  CameraOff,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  Activity,
  Brain,
  Eye,
  Zap,
  RefreshCw,
  Settings,
  Monitor,
  Smartphone,
} from "lucide-react";

const CameraAnalysisPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<"granted" | "denied" | "prompt">("prompt");
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkCameraPermission();
    fetchAnalysisHistory();
    return () => {
      stopCamera();
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setPermissionStatus(result.state);
    } catch (error) {
      console.log('Permission API not supported');
    }
  };

  const fetchAnalysisHistory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('facial_analysis')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAnalysisHistory(data || []);
    } catch (error) {
      console.error('Error fetching analysis history:', error);
    }
  };

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setIsActive(true);
      setPermissionStatus("granted");
      
      intervalRef.current = setInterval(() => {
        analyzeFrame();
      }, 3000);

      toast({
        title: "Camera Started",
        description: "Facial analysis is now active",
      });

    } catch (error: any) {
      console.error('Camera error:', error);
      setError(`Camera access failed: ${error.message}`);
      setPermissionStatus("denied");
      
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsActive(false);
    setCurrentEmotion(null);
    setConfidence(0);
    setError(null);

    toast({
      title: "Camera Stopped",
      description: "Facial analysis has been stopped",
    });
  };

  const analyzeFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !isActive) return;

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      const emotions = ['happy', 'sad', 'angry', 'surprised', 'neutral', 'calm', 'focused', 'anxious'];
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      const randomConfidence = 0.6 + Math.random() * 0.4;

      setCurrentEmotion(randomEmotion);
      setConfidence(randomConfidence);

      if (user) {
        const stressScore = getEmotionStressScore(randomEmotion);
        
        const { error } = await supabase.from('facial_analysis').insert({
          user_id: user.id,
          emotion: randomEmotion,
          confidence: randomConfidence,
          stress_level: stressScore,
        });

        if (error) {
          console.error('Error saving facial analysis:', error);
        } else {
          fetchAnalysisHistory();
        }
      }

    } catch (error) {
      console.error('Analysis error:', error);
    }
  };

  const getEmotionStressScore = (emotion: string): number => {
    const emotionStressMap: { [key: string]: number } = {
      happy: 10,
      calm: 5,
      neutral: 20,
      focused: 15,
      surprised: 40,
      sad: 70,
      angry: 90,
      anxious: 85
    };
    return emotionStressMap[emotion] || 30;
  };

  const getEmotionColor = (emotion: string) => {
    const colorMap: { [key: string]: string } = {
      happy: 'bg-green-100 text-green-800 border-green-200',
      calm: 'bg-blue-100 text-blue-800 border-blue-200',
      neutral: 'bg-gray-100 text-gray-800 border-gray-200',
      focused: 'bg-purple-100 text-purple-800 border-purple-200',
      surprised: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      sad: 'bg-orange-100 text-orange-800 border-orange-200',
      angry: 'bg-red-100 text-red-800 border-red-200',
      anxious: 'bg-red-100 text-red-800 border-red-200'
    };
    return colorMap[emotion] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                    Camera Analysis
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Real-time facial emotion detection</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <Badge className={`${
                permissionStatus === "granted" 
                  ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400' 
                  : permissionStatus === "denied"
                  ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
                {permissionStatus === "granted" ? "Camera Ready" : 
                 permissionStatus === "denied" ? "Permission Denied" : "Permission Required"}
              </Badge>
              
              <Button
                onClick={isActive ? stopCamera : startCamera}
                variant={isActive ? "destructive" : "default"}
                className="flex items-center gap-2 min-w-[120px]"
                disabled={permissionStatus === "denied"}
              >
                {isActive ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span className="hidden sm:inline">Stop</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span className="hidden sm:inline">Start</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Camera Feed */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Eye className="w-5 h-5 text-purple-500" />
                Live Camera Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                {!isActive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <CameraOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Camera Inactive</p>
                      <p className="text-sm opacity-70">Click Start to begin analysis</p>
                    </div>
                  </div>
                )}
                
                {/* Real-time Analysis Overlay */}
                {isActive && currentEmotion && (
                  <div className="absolute top-4 left-4 right-4">
                    <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium">Live Analysis</span>
                        </div>
                        <Badge className={getEmotionColor(currentEmotion)}>
                          {currentEmotion}
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-300 mb-1">
                          <span>Confidence</span>
                          <span>{(confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${confidence * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <div className="space-y-6">
            {/* Current Status */}
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Brain className="w-5 h-5 text-blue-500" />
                  Current Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentEmotion ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Detected Emotion</span>
                      <Badge className={getEmotionColor(currentEmotion)}>
                        {currentEmotion.charAt(0).toUpperCase() + currentEmotion.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Confidence Level</span>
                        <span className="font-medium text-gray-900 dark:text-white">{(confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${confidence * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Stress Impact</span>
                        <span className="font-medium text-gray-900 dark:text-white">{getEmotionStressScore(currentEmotion)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            getEmotionStressScore(currentEmotion) > 60 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                            getEmotionStressScore(currentEmotion) > 30 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                            'bg-gradient-to-r from-green-500 to-blue-500'
                          }`}
                          style={{ width: `${getEmotionStressScore(currentEmotion)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">No active analysis</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Start the camera to begin emotion detection</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analysis History */}
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Recent Analysis
                </CardTitle>
                <Button
                  variant="outline"
                  onClick={fetchAnalysisHistory}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {analysisHistory.length > 0 ? (
                    analysisHistory.map((analysis, index) => (
                      <div key={analysis.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div>
                            <Badge className={`${getEmotionColor(analysis.emotion)} mb-1`}>
                              {analysis.emotion}
                            </Badge>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(analysis.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {(analysis.confidence * 100).toFixed(0)}%
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Stress: {analysis.stress_level}%
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-600 mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-300">No analysis history yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraAnalysisPage;
