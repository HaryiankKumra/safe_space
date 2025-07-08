import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import IntroductionPage from "@/pages/IntroductionPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import StressDashboard from "@/pages/StressDashboard";
import SettingsPage from "@/pages/SettingsPage";
import HealthRecordsPage from "@/pages/HealthRecordsPage";
import StressMetrics from "@/components/StressMetrics";
import CameraModule from "@/components/CameraModule";
import StressChatbot from "@/components/StressChatbot";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading StressGuard...</p>
          <p className="text-slate-300 text-sm mt-2">
            Initializing your dashboard
          </p>
        </div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        <DashboardSidebar />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </SidebarProvider>
  );
};

const MonitoringPage: React.FC = () => {
  const [stressLevel, setStressLevel] = React.useState(0.4);
  const [stressStatus, setStressStatus] = React.useState<
    "low" | "moderate" | "high"
  >("moderate");
  const [isMonitoring, setIsMonitoring] = React.useState(true);

  const signalQuality = {
    bvp: 92,
    eda: 88,
    temp: 95,
    hr: 91,
  };

  const handleEmotionDetected = (emotion: string, confidence: number) => {
    console.log("Emotion detected:", emotion, confidence);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StressMetrics
          stressLevel={stressLevel}
          stressStatus={stressStatus}
          signalQuality={signalQuality}
          isMonitoring={isMonitoring}
        />
        <CameraModule
          isActive={isMonitoring}
          onEmotionDetected={handleEmotionDetected}
        />
      </div>
    </div>
  );
};

const ChatPage: React.FC = () => {
  return (
    <div className="p-6 h-full">
      <StressChatbot />
    </div>
  );
};

const CameraPage: React.FC = () => {
  const handleEmotionDetected = (emotion: string, confidence: number) => {
    console.log("Emotion detected:", emotion, confidence);
  };

  return (
    <div className="p-6">
      <CameraModule isActive={true} onEmotionDetected={handleEmotionDetected} />
    </div>
  );
};

function App() {
  console.log("🚀 App component rendered");

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<IntroductionPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected dashboard routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <StressDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/monitoring"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <MonitoringPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/chat"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ChatPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/camera"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CameraPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/health"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <HealthRecordsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <SettingsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/profile"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <SettingsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/analytics"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <MonitoringPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
