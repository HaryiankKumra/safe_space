
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, AlertTriangle, Play, Square } from "lucide-react";
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
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      context.drawImage(video, 0, 0);

      // Convert canvas to Blob (slightly compressed JPEG)
      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast({
            title: "Capture Failed",
            description: "Could not capture image from camera.",
            variant: "destructive"
          });
          return;
        }

        // Create FormData and append image file
        const formData = new FormData();
        formData.append('file', blob, 'captured_image.jpg');

        try {
          // Send image to FastAPI endpoint
          const response = await fetch('http://facialhari.duckdns.org:8000/predict', {
            method: 'POST',
            body: formData
          });

          if (!response.ok) {
            throw new Error('Prediction request failed');
          }

          const result = await response.json();

          // Update state with API results
          setCurrentEmotion(result.emotion);
          setStressLevel(result.stress_classification);
          setConfidence(result.confidence);

          // Call parent callback for analytics
          onEmotionDetected(result.emotion, result.confidence);

          toast({
            title: "Emotion Analysis",
            description: `Detected: ${result.emotion} (${(result.confidence * 100).toFixed(1)}% confidence)`,
          });

        } catch (apiError) {
          console.error('API Error:', apiError);
          toast({
            title: "Analysis Error",
            description: "Could not process the image. Please try again.",
            variant: "destructive"
          });
        }
      }, 'image/jpeg', 0.8);  // Slightly compressed JPEG

    } catch (error) {
      console.error('Capture error:', error);
      toast({
        title: "Capture Failed",
        description: "An error occurred while capturing the image.",
        variant: "destructive"
      });
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
            </>
          )}
        </div>

        {cameraStarted && (
          <div className="flex items-center justify-between">
            <Button 
              onClick={captureAndAnalyzeImage}
              variant="outline" 
              className="w-full"
            >
              Capture & Analyze Stress
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
              <Badge variant="outline">
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
          Powered by FastAPI Emotion Detection
        </div>
      </CardContent>
    </Card>
  );
};

export default CameraModule;
