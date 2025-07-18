
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, AlertTriangle, Play, Square, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CameraModuleProps {
  isActive: boolean;
  onEmotionDetected: (emotion: string, confidence: number) => void;
}

const CameraModule: React.FC<CameraModuleProps> = ({ isActive, onEmotionDetected }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<string | null>(null);
  const [stressLevel, setStressLevel] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && cameraStarted) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive, cameraStarted]);

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
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please check permissions.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const captureAndAnalyzeImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      setIsAnalyzing(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      context.drawImage(video, 0, 0);

      console.log('Starting fake facial analysis...');
      
      // Simulate 15 second processing time
      await new Promise(resolve => setTimeout(resolve, 15000));
      
      // Generate fake results - always neutral with high confidence
      const fakeEmotion = 'neutral';
      const fakeConfidence = 0.9 + Math.random() * 0.1; // Random between 0.9-1.0
      const fakeStressLevel = 'Not Stressed';

      // Update state with fake results
      setCurrentEmotion(fakeEmotion);
      setStressLevel(fakeStressLevel);
      setConfidence(fakeConfidence);

      // Call parent callback for analytics
      onEmotionDetected(fakeEmotion, fakeConfidence);

      toast({
        title: "Emotion Analysis Complete",
        description: `Detected: ${fakeEmotion} (${(fakeConfidence * 100).toFixed(1)}% confidence) - ${fakeStressLevel}`,
      });

      console.log('Fake facial analysis completed:', { fakeEmotion, fakeConfidence, fakeStressLevel });

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "An error occurred during analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleToggleCamera = () => {
    setCameraStarted(!cameraStarted);
    setCurrentEmotion(null);
    setStressLevel(null);
    setConfidence(0);
  };

  const getEmotionColor = (emotion: string | null) => {
    const colors = {
      happy: 'bg-green-100 text-green-800 border-green-200',
      sad: 'bg-blue-100 text-blue-800 border-blue-200',
      angry: 'bg-red-100 text-red-800 border-red-200',
      surprised: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      neutral: 'bg-gray-100 text-gray-800 border-gray-200',
      calm: 'bg-teal-100 text-teal-800 border-teal-200'
    };
    return emotion ? (colors[emotion.toLowerCase() as keyof typeof colors] || colors.neutral) : colors.neutral;
  };

  return (
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
            <span>Facial Expression Analysis</span>
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
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" />
                    <p className="text-lg font-medium">Analyzing Facial Expression...</p>
                    <p className="text-sm opacity-80">Processing emotion and stress detection</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {cameraStarted && (
          <div className="flex items-center justify-between">
            <Button 
              onClick={captureAndAnalyzeImage}
              variant="outline" 
              className="w-full"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing... (15s)
                </>
              ) : (
                'Capture & Analyze Stress'
              )}
            </Button>
          </div>
        )}

        {currentEmotion && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Detected Emotion</p>
              <Badge className={getEmotionColor(currentEmotion)}>
                {currentEmotion.charAt(0).toUpperCase() + currentEmotion.slice(1)}
              </Badge>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Stress Level</p>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                {stressLevel || 'Not Detected'}
              </Badge>
            </div>
            <div className="col-span-2 text-center">
              <p className="text-sm text-gray-600 mb-1">Confidence</p>
              <Badge variant="outline">
                {(confidence * 100).toFixed(1)}%
              </Badge>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          Powered by Mock Emotion Detection API
        </div>
      </CardContent>
    </Card>
  );
};

export default CameraModule;
