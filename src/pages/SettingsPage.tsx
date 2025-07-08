import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  getErrorMessage,
  logError,
  createUserErrorMessage,
} from "@/utils/errorHandling";
import {
  User,
  Mail,
  MapPin,
  Heart,
  Ruler,
  Weight,
  Droplets,
  Moon,
  Sun,
  Bell,
  BellOff,
  Save,
  Calculator,
  Activity,
} from "lucide-react";

interface UserProfile {
  full_name: string;
  email: string;
  age: number | null;
  weight: number | null;
  height: number | null;
  blood_type: string | null;
  medical_conditions: string[];
  medications: string[];
  allergies: string[];
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  activity_level: string | null;
  sleep_target_hours: number | null;
  water_intake_target: number | null;
  stress_threshold_low: number | null;
  stress_threshold_medium: number | null;
  stress_threshold_high: number | null;
}

const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [notifications, setNotifications] = useState(true);
  const [stressNotifications, setStressNotifications] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({
    full_name: "",
    email: "",
    age: null,
    weight: null,
    height: null,
    blood_type: null,
    medical_conditions: [],
    medications: [],
    allergies: [],
    emergency_contact_name: null,
    emergency_contact_phone: null,
    activity_level: null,
    sleep_target_hours: 8,
    water_intake_target: 2000,
    stress_threshold_low: 30,
    stress_threshold_medium: 60,
    stress_threshold_high: 80,
  });

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const activityLevels = [
    { value: "sedentary", label: "Sedentary" },
    { value: "lightly_active", label: "Lightly Active" },
    { value: "moderately_active", label: "Moderately Active" },
    { value: "very_active", label: "Very Active" },
    { value: "extremely_active", label: "Extremely Active" },
  ];

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
        return;
      }

      if (data) {
        setProfile({
          full_name: user.email || "", // Use email as fallback since full_name doesn't exist in user_profiles
          email: user.email || "",
          age: data.age,
          weight: data.weight,
          height: data.height,
          blood_type: data.blood_type,
          medical_conditions: data.medical_conditions || [],
          medications: data.medications || [],
          allergies: data.allergies || [],
          emergency_contact_name: data.emergency_contact_name,
          emergency_contact_phone: data.emergency_contact_phone,
          activity_level: data.activity_level,
          sleep_target_hours: data.sleep_target_hours,
          water_intake_target: data.water_intake_target,
          stress_threshold_low: data.stress_threshold_low,
          stress_threshold_medium: data.stress_threshold_medium,
          stress_threshold_high: data.stress_threshold_high,
        });
      } else {
        setProfile((prev) => ({
          ...prev,
          full_name: user.email || "",
          email: user.email || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const calculateBMI = () => {
    if (profile.weight && profile.height) {
      const heightInM = profile.height / 100;
      return (profile.weight / (heightInM * heightInM)).toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Underweight", color: "text-blue-400" };
    if (bmi < 25) return { category: "Normal", color: "text-green-400" };
    if (bmi < 30) return { category: "Overweight", color: "text-yellow-400" };
    return { category: "Obese", color: "text-red-400" };
  };

  const saveProfile = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Not authenticated. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("🔄 Saving profile...");

      // Use the AuthContext updateProfile function for better consistency
      const result = await updateProfile({
        age: profile.age,
        weight: profile.weight,
        height: profile.height,
        blood_type: profile.blood_type,
        medical_conditions: profile.medical_conditions,
        medications: profile.medications,
        allergies: profile.allergies,
        emergency_contact_name: profile.emergency_contact_name,
        emergency_contact_phone: profile.emergency_contact_phone,
        activity_level: profile.activity_level,
        sleep_target_hours: profile.sleep_target_hours,
        water_intake_target: profile.water_intake_target,
        stress_threshold_low: profile.stress_threshold_low,
        stress_threshold_medium: profile.stress_threshold_medium,
        stress_threshold_high: profile.stress_threshold_high,
      });

      if (result.success) {
        console.log("✅ Profile saved successfully");
        toast({
          title: "Settings Saved",
          description: "Your profile has been updated successfully.",
        });
      } else {
        logError("Profile save failed", result.error);
        toast({
          title: "Error",
          description: createUserErrorMessage(
            result.error,
            "Failed to save settings",
          ),
          variant: "destructive",
        });
      }
    } catch (error) {
      logError("Error saving profile", error);

      toast({
        title: "Error",
        description: createUserErrorMessage(error, "Failed to save settings"),
        variant: "destructive",
      });
    }
  };

  const bmi = calculateBMI();
  const bmiData = bmi ? getBMICategory(parseFloat(bmi)) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-300">Manage your profile and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-slate-800/50 border-slate-700">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-blue-600"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="health"
              className="data-[state=active]:bg-blue-600"
            >
              Health
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="data-[state=active]:bg-blue-600"
            >
              Preferences
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-blue-600"
            >
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-300">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={profile.full_name}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          full_name: e.target.value,
                        }))
                      }
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-slate-700/30 border-slate-600 text-slate-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-slate-300">
                      Age
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      value={profile.age || ""}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          age: parseInt(e.target.value) || null,
                        }))
                      }
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="blood_type" className="text-slate-300">
                      Blood Type
                    </Label>
                    <Select
                      value={profile.blood_type || ""}
                      onValueChange={(value) =>
                        setProfile((prev) => ({ ...prev, blood_type: value }))
                      }
                    >
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        {bloodTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergency_name" className="text-slate-300">
                      Emergency Contact Name
                    </Label>
                    <Input
                      id="emergency_name"
                      value={profile.emergency_contact_name || ""}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          emergency_contact_name: e.target.value,
                        }))
                      }
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergency_phone" className="text-slate-300">
                      Emergency Contact Phone
                    </Label>
                    <Input
                      id="emergency_phone"
                      value={profile.emergency_contact_phone || ""}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          emergency_contact_phone: e.target.value,
                        }))
                      }
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health">
            <div className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Physical Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="height"
                        className="text-slate-300 flex items-center gap-2"
                      >
                        <Ruler className="w-4 h-4" />
                        Height (cm)
                      </Label>
                      <Input
                        id="height"
                        type="number"
                        value={profile.height || ""}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            height: parseFloat(e.target.value) || null,
                          }))
                        }
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="weight"
                        className="text-slate-300 flex items-center gap-2"
                      >
                        <Weight className="w-4 h-4" />
                        Weight (kg)
                      </Label>
                      <Input
                        id="weight"
                        type="number"
                        value={profile.weight || ""}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            weight: parseFloat(e.target.value) || null,
                          }))
                        }
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300 flex items-center gap-2">
                        <Calculator className="w-4 h-4" />
                        BMI
                      </Label>
                      <div className="p-3 bg-slate-700/50 border border-slate-600 rounded-md">
                        {bmi ? (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">
                              {bmi}
                            </div>
                            <Badge
                              className={`${bmiData?.color} bg-transparent border-current`}
                            >
                              {bmiData?.category}
                            </Badge>
                          </div>
                        ) : (
                          <div className="text-slate-400 text-center">
                            Enter height & weight
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Activity Level</Label>
                    <Select
                      value={profile.activity_level || ""}
                      onValueChange={(value) =>
                        setProfile((prev) => ({
                          ...prev,
                          activity_level: value,
                        }))
                      }
                    >
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                      <SelectContent>
                        {activityLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Health Targets
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="sleep"
                        className="text-slate-300 flex items-center gap-2"
                      >
                        <Moon className="w-4 h-4" />
                        Sleep Target (hours)
                      </Label>
                      <Input
                        id="sleep"
                        type="number"
                        value={profile.sleep_target_hours || ""}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            sleep_target_hours:
                              parseInt(e.target.value) || null,
                          }))
                        }
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="water"
                        className="text-slate-300 flex items-center gap-2"
                      >
                        <Droplets className="w-4 h-4" />
                        Water Intake Target (ml)
                      </Label>
                      <Input
                        id="water"
                        type="number"
                        value={profile.water_intake_target || ""}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            water_intake_target:
                              parseInt(e.target.value) || null,
                          }))
                        }
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preferences">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">
                  Appearance & Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {theme === "dark" ? (
                      <Moon className="w-5 h-5 text-slate-300" />
                    ) : (
                      <Sun className="w-5 h-5 text-slate-300" />
                    )}
                    <div>
                      <Label className="text-slate-300">Theme</Label>
                      <p className="text-sm text-slate-400">
                        Choose your preferred theme
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={(checked) =>
                      setTheme(checked ? "dark" : "light")
                    }
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-slate-300">
                    Stress Detection Thresholds
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-green-400">Low Threshold</Label>
                      <Input
                        type="number"
                        value={profile.stress_threshold_low || ""}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            stress_threshold_low:
                              parseInt(e.target.value) || null,
                          }))
                        }
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-yellow-400">
                        Medium Threshold
                      </Label>
                      <Input
                        type="number"
                        value={profile.stress_threshold_medium || ""}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            stress_threshold_medium:
                              parseInt(e.target.value) || null,
                          }))
                        }
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-red-400">High Threshold</Label>
                      <Input
                        type="number"
                        value={profile.stress_threshold_high || ""}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            stress_threshold_high:
                              parseInt(e.target.value) || null,
                          }))
                        }
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {notifications ? (
                      <Bell className="w-5 h-5 text-slate-300" />
                    ) : (
                      <BellOff className="w-5 h-5 text-slate-300" />
                    )}
                    <div>
                      <Label className="text-slate-300">
                        General Notifications
                      </Label>
                      <p className="text-sm text-slate-400">
                        Receive general app notifications
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-red-400" />
                    <div>
                      <Label className="text-slate-300">Stress Alerts</Label>
                      <p className="text-sm text-slate-400">
                        Get notified when high stress is detected
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={stressNotifications}
                    onCheckedChange={setStressNotifications}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button
            onClick={saveProfile}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-2"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
