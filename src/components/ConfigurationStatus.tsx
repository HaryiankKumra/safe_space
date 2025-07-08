import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Key,
  Database,
  MessageCircle,
  ExternalLink,
  Info,
} from "lucide-react";

const ConfigurationStatus: React.FC = () => {
  const [googleOAuthStatus, setGoogleOAuthStatus] = useState<
    "checking" | "enabled" | "disabled"
  >("checking");
  const [openAIStatus, setOpenAIStatus] = useState<
    "checking" | "enabled" | "disabled"
  >("checking");
  const [supabaseStatus, setSupabaseStatus] = useState<
    "checking" | "connected" | "disconnected"
  >("checking");

  useEffect(() => {
    checkConfigurations();
  }, []);

  const checkConfigurations = async () => {
    // Check Supabase connection
    try {
      const response = await fetch("/api/health", { method: "HEAD" });
      setSupabaseStatus(response.ok ? "connected" : "disconnected");
    } catch {
      setSupabaseStatus("disconnected");
    }

    // These would be checked if we had API endpoints for them
    setGoogleOAuthStatus("disabled"); // Default assumption
    setOpenAIStatus("disabled"); // Default assumption
  };

  const configurations = [
    {
      name: "Supabase Database",
      status: supabaseStatus,
      icon: <Database className="w-5 h-5" />,
      description: "User data, profiles, and authentication",
      required: false,
      setup: "Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local",
    },
    {
      name: "Google OAuth",
      status: googleOAuthStatus,
      icon: <Key className="w-5 h-5" />,
      description: "Google sign-in functionality",
      required: false,
      setup: "Configure Google OAuth in Supabase Authentication settings",
    },
    {
      name: "OpenAI Chatbot",
      status: openAIStatus,
      icon: <MessageCircle className="w-5 h-5" />,
      description: "AI-powered stress management chat",
      required: false,
      setup: "Add GPT_KEY to Supabase Edge Functions environment",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "enabled":
      case "connected":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "disabled":
      case "disconnected":
        return (
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            Offline
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Checking...
          </Badge>
        );
    }
  };

  const allConfigured = configurations.every(
    (config) => config.status === "enabled" || config.status === "connected",
  );

  return (
    <Card className="bg-gradient-to-br from-slate-900/90 via-blue-900/30 to-purple-900/20 border-slate-700/50 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <Settings className="w-5 h-5 text-blue-400" />
            </div>
            <span>System Configuration</span>
          </div>
          {allConfigured ? (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              <CheckCircle className="w-3 h-3 mr-1" />
              All Systems Active
            </Badge>
          ) : (
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Optional Features Available
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {configurations.map((config, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-700/50 rounded-lg">
                {config.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium">{config.name}</span>
                  {getStatusBadge(config.status)}
                </div>
                <p className="text-slate-400 text-sm">{config.description}</p>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-blue-400 font-medium mb-2">
                Configuration Status
              </h4>
              <p className="text-blue-300 text-sm leading-relaxed mb-3">
                {allConfigured
                  ? "All features are properly configured and active!"
                  : "The app works fully with offline mode. Configure optional features for enhanced functionality:"}
              </p>

              {!allConfigured && (
                <ul className="text-blue-300 text-sm space-y-1">
                  <li>• Google OAuth: Enable social login</li>
                  <li>• OpenAI API: Unlock AI chatbot responses</li>
                  <li>• All features work offline with sample data</li>
                </ul>
              )}

              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-blue-400/50 text-blue-400 hover:bg-blue-500/10"
                  onClick={() =>
                    window.open("/CONFIGURATION_GUIDE.md", "_blank")
                  }
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Setup Guide
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-blue-400/50 text-blue-400 hover:bg-blue-500/10"
                  onClick={checkConfigurations}
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Refresh Status
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfigurationStatus;
