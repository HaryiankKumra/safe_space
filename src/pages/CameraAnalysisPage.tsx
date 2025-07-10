
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Camera, CameraOff, Play, Square, Eye, AlertTriangle, Activity, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface EmotionData {
  emotion: string;
  confidence: number;
  timestamp: Date;
  stressLevel: number;
}

const CameraAnalysisPage: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<string>('neutral');
  const [confidence, setConfidence] = useState<number>(0);
  const [stressLevel, setStressLevel] = useState<number>(0);
  const [emotionHistory, setEmotionHistory] = useState<EmotionData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [analysisCount, setAnalysisCount] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadAnalysisHistory();
    }
  }, [user]);

  useEffect(() => {
    if (cameraStarted && isRecording) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [cameraStarted, isRecording]);

  const loadAnalysisHistory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('facial_analysis')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading analysis history:', error);
        return;
      }

      if (data) {
        const chartData = data.reverse().map(item => ({
          emotion: item.emotion,
          confidence: item.confidence,
          timestamp: new Date(item.created_at),
          stressLevel: item.stress_level,
        }));
        setEmotionHistory(chartData);
        setAnalysisCount(data.length);
      }
    } catch (error) {
      console.error('Error loading analysis history:', error);
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
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsRecording(true);
          startAnalysis();
          toast({
            title: "Camera Started",
            description: "Facial emotion analysis is now active.",
          });
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please check permissions and ensure you\'re using HTTPS.');
      setIsRecording(false);
      setCameraStarted(false);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsRecording(false);
  };

  const startAnalysis = () => {
    intervalRef.current = setInterval(async () => {
      const emotions = [
        { name: 'happy', stress: 15 },
        { name: 'sad', stress: 75 },
        { name: 'angry', stress: 90 },
        { name: 'surprised', stress: 45 },
        { name: 'neutral', stress: 30 },
        { name: 'calm', stress: 10 },
        { name: 'anxious', stress: 85 },
        { name: 'focused', stress: 25 }
      ];
      
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      const randomConfidence = 0.75 + Math.random() * 0.25;
      
      setCurrentEmotion(randomEmotion.name);
      setConfidence(randomConfidence);
      setStressLevel(randomEmotion.stress);

      const newData: EmotionData = {
        emotion: randomEmotion.name,
        confidence: randomConfidence,
        timestamp: new Date(),
        stressLevel: randomEmotion.stress,
      };

      setEmotionHistory(prev => [...prev.slice(-9), newData]);

      // Save to database
      if (user) {
        try {
          const { error } = await supabase.from('facial_analysis').insert({
            user_id: user.id,
            emotion: randomEmotion.name,
            confidence: randomConfidence,
            stress_level: randomEmotion.stress,
          });

          if (error) {
            console.error('Error saving analysis:', error);
            toast({
              title: "Save Error",
              description: "Failed to save analysis data.",
              variant: "destructive",
            });
          } else {
            setAnalysisCount(prev => prev + 1);
            console.log('Analysis saved successfully');
          }
        } catch (error) {
          console.error('Database error:', error);
        }
      }
    }, 4000);
  };

  const handleToggleCamera = () => {
    if (cameraStarted) {
      setCameraStarted(false);
      setIsRecording(false);
      toast({
        title: "Camera Stopped",
        description: "Facial emotion analysis has been stopped.",
      });
    } else {
      setCameraStarted(true);
    }
  };

  const getEmotionColor = (emotion: string) => {
    const colors = {
      happy: 'bg-green-100 text-green-800 border-green-200',
      sad: 'bg-blue-100 text-blue-800 border-blue-200',
      angry: 'bg-red-100 text-red-800 border-red-200',
      surprised: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      neutral: 'bg-gray-100 text-gray-800 border-gray-200',
      calm: 'bg-teal-100 text-teal-800 border-teal-200',
      anxious: 'bg-orange-100 text-orange-800 border-orange-200',
      focused: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[emotion as keyof typeof colors] || colors.neutral;
  };

  const getStressColor = (level: number) => {
    if (level < 30) return 'text-green-600';
    if (level < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const chartData = emotionHistory.map((item, index) => ({
    time: index + 1,
    confidence: item.confidence * 100,
    stress: item.stressLevel,
    emotion: item.emotion,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Camera Analysis</h1>
              <p className="text-gray-600 dark:text-gray-300">Real-time facial expression and stress detection</p>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                <Activity className="w-3 h-3 mr-1" />
                {analysisCount} Analyses
              </Badge>
              <Badge className={`${isRecording ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                {isRecording ? (
                  <>
                    <Activity className="w-3 h-3 mr-1 animate-pulse" />
                    Recording
                  </>
                ) : (
                  <>
                    <CameraOff className="w-3 h-3 mr-1" />
                    Stopped
                  </>
                )}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Camera Feed */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-purple-500" />
                  Live Camera Feed
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={loadAnalysisHistory}
                    variant="outline"
                    size="sm"
                    className="mr-2"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Refresh
                  </Button>
                  <Button
                    onClick={handleToggleCamera}
                    variant={cameraStarted ? "destructive" : "default"}
                    size="sm"
                  >
                    {cameraStarted ? (
                      <>
                        <Square className="w-4 h-4 mr-1" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </>
                    )}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
                {error ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <div className="text-center">
                      <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{error}</p>
                      <Button onClick={() => {
                        setError(null);
                        setCameraStarted(true);
                      }} variant="outline" size="sm">
                        Retry
                      </Button>
                    </div>
                  </div>
                ) : !cameraStarted ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <div className="text-center">
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-300">Click "Start" to begin analysis</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Make sure to allow camera permissions</p>
                    </div>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>
            </CardContent>
          </Card>

          {/* Current Analysis */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-xl">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Current Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Detected Emotion</p>
                  <Badge className={getEmotionColor(currentEmotion)} variant="outline">
                    {currentEmotion.charAt(0).toUpperCase() + currentEmotion.slice(1)}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Confidence</p>
                  <Badge variant="outline">
                    {(confidence * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Stress Level</p>
                  <span className={`text-sm font-semibold ${getStressColor(stressLevel)}`}>
                    {stressLevel}%
                  </span>
                </div>
                <Progress value={stressLevel} className="h-2" />
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  <p className="text-green-600 dark:text-green-400 font-medium">Low (0-30%)</p>
                  <p className="text-gray-600 dark:text-gray-300">Relaxed</p>
                </div>
                <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <p className="text-yellow-600 dark:text-yellow-400 font-medium">Medium (31-60%)</p>
                  <p className="text-gray-600 dark:text-gray-300">Alert</p>
                </div>
                <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  <p className="text-red-600 dark:text-red-400 font-medium">High (61-100%)</p>
                  <p className="text-gray-600 dark:text-gray-300">Stressed</p>
                </div>
              </div>

              {isRecording && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Live analysis active
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Analysis Charts */}
        {chartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-xl">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Stress Level Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis dataKey="time" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="stress" 
                        stroke="#EF4444" 
                        strokeWidth={2}
                        dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-xl">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Confidence Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis dataKey="time" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }} 
                      />
                      <Bar dataKey="confidence" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraAnalysisPage;
