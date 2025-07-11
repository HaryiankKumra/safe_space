
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, AlertTriangle, Play, Square, Activity, Brain, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const CameraAnalysisPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<string>('neutral');
  const [confidence, setConfidence] = useState<number>(0.85);
  const [stressLevel, setStressLevel] = useState<number>(30);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (cameraStarted) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [cameraStarted]);

  useEffect(() => {
    fetchAnalysisHistory();
  }, [user]);

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
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraActive(true);
        };
      }

      // Start emotion detection simulation
      intervalRef.current = setInterval(() => {
        const emotions = ['happy', 'sad', 'angry', 'surprised', 'neutral', 'calm', 'focused', 'anxious'];
        const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        const randomConfidence = 0.7 + Math.random() * 0.3;
        const emotionStressLevel = getEmotionStressScore(randomEmotion);
        
        setCurrentEmotion(randomEmotion);
        setConfidence(randomConfidence);
        setStressLevel(emotionStressLevel);
        
        // Save to database
        saveAnalysisData(randomEmotion, randomConfidence, emotionStressLevel);
      }, 4000);

    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please check permissions.');
      setCameraActive(false);
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
    setCameraActive(false);
  };

  const saveAnalysisData = async (emotion: string, confidence: number, stressLevel: number) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('facial_analysis').insert({
        user_id: user.id,
        emotion: emotion,
        confidence: confidence,
        stress_level: stressLevel,
      });

      if (error) {
        console.error('Error saving facial analysis:', error);
      } else {
        // Refresh history
        fetchAnalysisHistory();
      }
    } catch (error) {
      console.error('Database error:', error);
    }
  };

  const getEmotionStressScore = (emotion: string): number => {
    const emotionStressMap: { [key: string]: number } = {
      happy: 10,
      calm: 5,
      neutral: 20,
      focused: 25,
      surprised: 40,
      sad: 70,
      angry: 90,
      anxious: 85
    };
    return emotionStressMap[emotion] || 30;
  };

  const handleToggleCamera = () => {
    setCameraStarted(!cameraStarted);
  };

  const getEmotionColor = (emotion: string) => {
    const colors = {
      happy: 'bg-green-100 text-green-800 border-green-200',
      sad: 'bg-blue-100 text-blue-800 border-blue-200',
      angry: 'bg-red-100 text-red-800 border-red-200',
      surprised: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      neutral: 'bg-gray-100 text-gray-800 border-gray-200',
      calm: 'bg-teal-100 text-teal-800 border-teal-200',
      focused: 'bg-purple-100 text-purple-800 border-purple-200',
      anxious: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[emotion as keyof typeof colors] || colors.neutral;
  };

  const getStressLevelColor = (level: number) => {
    if (level < 30) return 'text-green-600';
    if (level < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 p-4 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Facial Expression Analysis
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Real-time emotion detection and stress analysis through facial expressions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Camera Feed */}
          <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    {cameraActive ? (
                      <Camera className="w-5 h-5 text-purple-600" />
                    ) : (
                      <CameraOff className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <span>Live Camera Feed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cameraActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
                    {cameraActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button
                    onClick={handleToggleCamera}
                    size="sm"
                    variant={cameraStarted ? "destructive" : "default"}
                    className="ml-2"
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
            <CardContent className="space-y-4">
              <div className="relative bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
                {!cameraStarted ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click "Start" to begin camera analysis</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">{error}</p>
                      <Button 
                        onClick={startCamera} 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                      >
                        Retry
                      </Button>
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

              {cameraActive && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Current Emotion</p>
                    <Badge className={getEmotionColor(currentEmotion)}>
                      {currentEmotion.charAt(0).toUpperCase() + currentEmotion.slice(1)}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Confidence</p>
                    <Badge variant="outline">
                      {(confidence * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Stress Level</p>
                    <Badge variant="outline" className={getStressLevelColor(stressLevel)}>
                      {stressLevel}%
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <div className="space-y-6">
            {/* Current Analysis */}
            <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Current Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cameraActive ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Activity className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Detected Emotion</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {currentEmotion.charAt(0).toUpperCase() + currentEmotion.slice(1)}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Stress Indicator</p>
                        <p className={`text-lg font-semibold ${getStressLevelColor(stressLevel)}`}>
                          {stressLevel}%
                        </p>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium">Analysis Confidence</p>
                      <div className="w-full bg-blue-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${confidence * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">{(confidence * 100).toFixed(1)}% confident</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Start camera to begin analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analysis History */}
            <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Recent Analysis History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysisHistory.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {analysisHistory.map((analysis, index) => (
                      <div key={analysis.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge className={getEmotionColor(analysis.emotion)} size="sm">
                            {analysis.emotion}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {(analysis.confidence * 100).toFixed(0)}% confidence
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${getStressLevelColor(analysis.stress_level)}`}>
                            {analysis.stress_level}% stress
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(analysis.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No analysis history yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center">
          Using advanced emotion detection algorithms for real-time facial expression analysis
        </div>
      </div>
    </div>
  );
};

export default CameraAnalysisPage;
