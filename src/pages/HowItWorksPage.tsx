
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Thermometer,
  Zap,
  Camera,
  Activity,
  Cpu,
  Wifi,
  Settings,
  Code,
  Brain,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";

const HowItWorksPage: React.FC = () => {
  const navigate = useNavigate();

  const components = [
    {
      title: "ESP32 Biometric Sensors",
      icon: <Cpu className="w-6 h-6" />,
      description: "Hardware sensors for real-time physiological monitoring",
      features: [
        "Heart Rate Monitoring (PPG sensor)",
        "Skin Temperature (DS18B20)",
        "Galvanic Skin Response (GSR)",
        "Real-time data transmission",
      ],
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Camera-based Emotion Detection",
      icon: <Camera className="w-6 h-6" />,
      description: "AI-powered facial emotion analysis using Hugging Face",
      features: [
        "Real-time facial expression analysis",
        "7 emotion categories detection",
        "Confidence scoring",
        "Browser-based processing",
      ],
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "AI Stress Prediction",
      icon: <Brain className="w-6 h-6" />,
      description: "Machine learning models for comprehensive stress analysis",
      features: [
        "Multi-modal data fusion",
        "Physiological pattern recognition",
        "Personalized stress thresholds",
        "Predictive analytics",
      ],
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Intelligent Chatbot",
      icon: <Activity className="w-6 h-6" />,
      description: "OpenAI-powered conversational assistant for stress management",
      features: [
        "Personalized recommendations",
        "Stress management techniques",
        "Historical data analysis",
        "24/7 support availability",
      ],
      color: "from-orange-500 to-red-500",
    },
  ];

  const setupSteps = [
    {
      step: 1,
      title: "Hardware Setup",
      description: "Connect ESP32 with biometric sensors",
      details: [
        "Wire PPG sensor to analog pin A0",
        "Connect DS18B20 to digital pin D2",
        "Setup GSR electrodes on fingers",
        "Configure WiFi credentials",
      ],
    },
    {
      step: 2,
      title: "Software Configuration",
      description: "Setup API keys and configure the system",
      details: [
        "Add OpenAI API key in Supabase secrets",
        "Configure Hugging Face models",
        "Setup database connections",
        "Enable camera permissions",
      ],
    },
    {
      step: 3,
      title: "Calibration",
      description: "Personalize the system for accurate readings",
      details: [
        "Record baseline physiological data",
        "Set personal stress thresholds",
        "Configure notification preferences",
        "Test all sensor connections",
      ],
    },
    {
      step: 4,
      title: "Monitoring",
      description: "Start real-time stress monitoring",
      details: [
        "Enable live monitoring mode",
        "View real-time dashboards",
        "Receive stress alerts",
        "Chat with AI assistant",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">How It Works</h1>
            <p className="text-slate-300">
              Complete guide to StressGuard AI system architecture and setup
            </p>
          </div>
        </div>

        {/* System Overview */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-2xl">System Architecture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {components.map((component, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${component.color} p-0.5 rounded-xl`}
                >
                  <div className="bg-slate-900 p-6 rounded-xl h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-white/10 rounded-lg">
                        {component.icon}
                      </div>
                      <h3 className="font-semibold text-white text-lg">
                        {component.title}
                      </h3>
                    </div>
                    <p className="text-slate-300 text-sm mb-4">
                      {component.description}
                    </p>
                    <ul className="space-y-2">
                      {component.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-slate-400">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Setup Guide */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Setup Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {setupSteps.map((step, index) => (
                <div key={index} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{step.step}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                      <p className="text-slate-400">{step.description}</p>
                    </div>
                  </div>
                  <div className="ml-16 space-y-2">
                    {step.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-slate-300">
                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                        {detail}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ESP32 Connection Guide */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-2xl flex items-center gap-2">
              <Cpu className="w-6 h-6 text-blue-400" />
              ESP32 Connection Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Hardware Connections</h3>
                <div className="bg-slate-900/50 p-4 rounded-lg font-mono text-sm">
                  <div className="space-y-2 text-slate-300">
                    <div><span className="text-blue-400">PPG Sensor:</span> A0 (Analog)</div>
                    <div><span className="text-green-400">DS18B20:</span> D2 (Digital)</div>
                    <div><span className="text-yellow-400">GSR Sensor:</span> A1 (Analog)</div>
                    <div><span className="text-purple-400">LED Status:</span> D13 (Built-in)</div>
                    <div><span className="text-red-400">Power:</span> 3.3V/5V</div>
                    <div><span className="text-cyan-400">Ground:</span> GND</div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Arduino Code Setup</h3>
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <pre className="text-xs text-slate-300 overflow-x-auto">
{`#include <WiFi.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>

const char* ssid = "YOUR_WIFI";
const char* password = "YOUR_PASSWORD";
const char* serverURL = "YOUR_SUPABASE_URL";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  // Initialize sensors
}

void loop() {
  // Read sensors and send data
  sendSensorData();
  delay(1000);
}`}
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-2xl flex items-center gap-2">
              <Settings className="w-6 h-6 text-green-400" />
              API Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Required API Keys</h3>
                <div className="space-y-4">
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Code className="w-4 h-4 text-blue-400" />
                      <span className="font-semibold text-white">OpenAI API Key</span>
                    </div>
                    <p className="text-slate-400 text-sm mb-2">
                      Required for the AI chatbot functionality
                    </p>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      Add in Supabase Edge Function Secrets
                    </Badge>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-purple-400" />
                      <span className="font-semibold text-white">Hugging Face (Optional)</span>
                    </div>
                    <p className="text-slate-400 text-sm mb-2">
                      For enhanced emotion detection models
                    </p>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      Browser-based processing available
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Configuration Steps</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                    <div>
                      <p className="text-white font-medium">Go to Supabase Dashboard</p>
                      <p className="text-slate-400 text-sm">Navigate to Edge Functions → Secrets</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                    <div>
                      <p className="text-white font-medium">Add OPENAI_API_KEY</p>
                      <p className="text-slate-400 text-sm">Get your API key from platform.openai.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                    <div>
                      <p className="text-white font-medium">Test Connection</p>
                      <p className="text-slate-400 text-sm">Use the chatbot to verify setup</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Flow */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-2xl flex items-center gap-2">
              <Wifi className="w-6 h-6 text-cyan-400" />
              Data Flow Architecture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900/50 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                <div className="bg-blue-500/20 p-4 rounded-lg text-center">
                  <Cpu className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-white font-medium">ESP32 Sensors</div>
                  <div className="text-slate-400 text-xs">Real-time Data</div>
                </div>
                <div className="text-slate-400 text-center">→</div>
                <div className="bg-purple-500/20 p-4 rounded-lg text-center">
                  <Wifi className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-white font-medium">Supabase API</div>
                  <div className="text-slate-400 text-xs">Data Storage</div>
                </div>
                <div className="text-slate-400 text-center">→</div>
                <div className="bg-green-500/20 p-4 rounded-lg text-center">
                  <Brain className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-white font-medium">AI Processing</div>
                  <div className="text-slate-400 text-xs">Stress Analysis</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-slate-400 py-6">
          <p className="text-lg font-medium">StressGuard AI</p>
          <p className="text-sm">Developed by Haryiank Kumra</p>
          <p className="text-xs mt-2">Comprehensive stress monitoring solution using AI and IoT</p>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
