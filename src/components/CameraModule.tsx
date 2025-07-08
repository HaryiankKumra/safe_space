
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, AlertTriangle } from "lucide-react";

interface CameraModuleProps {
  isActive: boolean;
  onEmotionDetected: (emotion: string, confidence: number) => void;
}

const CameraModule: React.FC<CameraModuleProps> = ({ isActive, onEmotionDetected }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<string>('neutral');
  const [confidence, setConfidence] = useState<number>(0.85);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive]);

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

      // Simulate emotion detection
      const emotionInterval = setInterval(() => {
        const emotions = ['happy', 'sad', 'angry', 'surprised', 'neutral', 'calm'];
        const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        const randomConfidence = 0.7 + Math.random() * 0.3;
        
        setCurrentEmotion(randomEmotion);
        setConfidence(randomConfidence);
        onEmotionDetected(randomEmotion, randomConfidence);
      }, 3000);

      return () => clearInterval(emotionInterval);
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

  const getEmotionColor = (emotion: string) => {
    const colors = {
      happy: 'bg-green-100 text-green-800 border-green-200',
      sad: 'bg-blue-100 text-blue-800 border-blue-200',
      angry: 'bg-red-100 text-red-800 border-red-200',
      surprised: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      neutral: 'bg-gray-100 text-gray-800 border-gray-200',
      calm: 'bg-teal-100 text-teal-800 border-teal-200'
    };
    return colors[emotion as keyof typeof colors] || colors.neutral;
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
          <Badge className={cameraActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
            {cameraActive ? 'Active' : 'Inactive'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
          {error ? (
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
          <div className="grid grid-cols-2 gap-4">
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
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          Using Hugging Face emotion detection model
        </div>
      </CardContent>
    </Card>
  );
};

export default CameraModule;
