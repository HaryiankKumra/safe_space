
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Activity, Zap, Thermometer, Heart } from "lucide-react";

interface ESP32Status {
  connected: boolean;
  deviceId: string;
  lastSeen: Date | null;
  sensorsActive: number;
  i2cEnabled: boolean;
}

interface ESP32StatusCardProps {
  status: ESP32Status;
}

const ESP32StatusCard: React.FC<ESP32StatusCardProps> = ({ status }) => {
  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          {status.connected ? <Wifi className="w-5 h-5 text-green-400" /> : <WifiOff className="w-5 h-5 text-red-400" />}
          ESP32 Device Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Connection Status */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-white">Connection</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Status:</span>
                <Badge className={status.connected ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}>
                  {status.connected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Device ID:</span>
                <code className="bg-slate-700/50 px-2 py-1 rounded text-sm text-blue-400">{status.deviceId}</code>
              </div>
              {status.lastSeen && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Last Seen:</span>
                  <span className="text-sm text-slate-400">{status.lastSeen.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Sensors Status */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-white">Sensors</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Active Sensors:</span>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {status.sensorsActive}/3
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center p-2 bg-slate-700/30 rounded-lg border border-slate-600">
                  <Heart className="w-4 h-4 text-red-400 mb-1" />
                  <span className="text-xs text-slate-300">Heart Rate</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div className="flex flex-col items-center p-2 bg-slate-700/30 rounded-lg border border-slate-600">
                  <Thermometer className="w-4 h-4 text-orange-400 mb-1" />
                  <span className="text-xs text-slate-300">Temp</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div className="flex flex-col items-center p-2 bg-slate-700/30 rounded-lg border border-slate-600">
                  <Zap className="w-4 h-4 text-yellow-400 mb-1" />
                  <span className="text-xs text-slate-300">GSR</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* I2C Status */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-white">Communication</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">I2C Protocol:</span>
                <Badge className={status.i2cEnabled ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}>
                  {status.i2cEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Data Rate:</span>
                <span className="text-sm text-slate-400">
                  {status.connected ? '~3 samples/sec' : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Protocol:</span>
                <span className="text-sm text-slate-400">HTTP POST</span>
              </div>
            </div>
          </div>
        </div>

        {/* ESP32 Configuration Info */}
        <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
          <h4 className="font-semibold text-blue-400 mb-2">📟 ESP32 Configuration</h4>
          <div className="text-sm text-slate-300 space-y-1">
            <p><strong className="text-blue-400">Endpoint:</strong> <code className="text-purple-400">https://unwxteyecpgcvrhqqbgz.supabase.co/functions/v1/receive-sensor-data</code></p>
            <p><strong className="text-blue-400">Method:</strong> POST | <strong className="text-blue-400">Content-Type:</strong> application/json</p>
            <p><strong className="text-blue-400">Sensors:</strong> Heart Rate (A0) | Temperature (D2) | GSR (A1)</p>
            <p><strong className="text-blue-400">Sampling Rate:</strong> Every 3 seconds</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ESP32StatusCard;
