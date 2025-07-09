
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, BellRing, AlertTriangle, Clock, Settings, Trash2, Plus, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface StressAlert {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  read: boolean;
  created_at: string;
  action_url?: string;
}

interface AlertSettings {
  enabled: boolean;
  threshold_low: number;
  threshold_medium: number;
  threshold_high: number;
  notification_time: string;
  email_enabled: boolean;
  push_enabled: boolean;
}

const StressAlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<StressAlert[]>([]);
  const [settings, setSettings] = useState<AlertSettings>({
    enabled: true,
    threshold_low: 30,
    threshold_medium: 60,
    threshold_high: 80,
    notification_time: '09:00',
    email_enabled: true,
    push_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [showNewAlert, setShowNewAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    title: '',
    message: '',
    type: 'stress',
    priority: 'normal',
  });

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadAlerts();
      loadSettings();
    }
  }, [user]);

  const loadAlerts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setAlerts(data);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast({
        title: "Error",
        description: "Failed to load alerts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('stress_threshold_low, stress_threshold_medium, stress_threshold_high, preferred_notification_time')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setSettings(prev => ({
          ...prev,
          threshold_low: data.stress_threshold_low || 30,
          threshold_medium: data.stress_threshold_medium || 60,
          threshold_high: data.stress_threshold_high || 80,
          notification_time: data.preferred_notification_time || '09:00',
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          stress_threshold_low: settings.threshold_low,
          stress_threshold_medium: settings.threshold_medium,
          stress_threshold_high: settings.threshold_high,
          preferred_notification_time: settings.notification_time,
        });

      if (error) throw error;
      
      toast({
        title: "Settings Saved",
        description: "Your alert settings have been updated",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    }
  };

  const createAlert = async () => {
    if (!user || !newAlert.title || !newAlert.message) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: newAlert.title,
          message: newAlert.message,
          type: newAlert.type,
          priority: newAlert.priority,
        });

      if (error) throw error;
      
      setNewAlert({ title: '', message: '', type: 'stress', priority: 'normal' });
      setShowNewAlert(false);
      loadAlerts();
      
      toast({
        title: "Alert Created",
        description: "Your stress alert has been created",
      });
    } catch (error) {
      console.error('Error creating alert:', error);
      toast({
        title: "Error",
        description: "Failed to create alert",
        variant: "destructive",
      });
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', alertId);

      if (error) throw error;
      
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, read: true } : alert
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', alertId);

      if (error) throw error;
      
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      
      toast({
        title: "Alert Deleted",
        description: "The alert has been removed",
      });
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast({
        title: "Error",
        description: "Failed to delete alert",
        variant: "destructive",
      });
    }
  };

  const triggerTestAlert = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Test Stress Alert',
          message: 'This is a test alert to verify your notification settings are working properly.',
          type: 'test',
          priority: 'normal',
        });

      if (error) throw error;
      
      loadAlerts();
      toast({
        title: "Test Alert Sent",
        description: "Check your notifications to verify settings",
      });
    } catch (error) {
      console.error('Error sending test alert:', error);
      toast({
        title: "Error",
        description: "Failed to send test alert",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'stress': return <AlertTriangle className="w-4 h-4" />;
      case 'heart': return <Heart className="w-4 h-4" />;
      case 'reminder': return <Clock className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Stress Alerts</h1>
                <p className="text-gray-600 dark:text-gray-300">Manage your stress notifications and thresholds</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={triggerTestAlert} variant="outline">
                <BellRing className="w-4 h-4 mr-2" />
                Test Alert
              </Button>
              <Button onClick={() => setShowNewAlert(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Alert
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alert Settings */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Settings className="w-5 h-5" />
                  Alert Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">Enable Alerts</label>
                  <Switch
                    checked={settings.enabled}
                    onCheckedChange={(enabled) => setSettings(prev => ({ ...prev, enabled }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">Low Stress Threshold</label>
                  <div className="mt-2">
                    <Slider
                      value={[settings.threshold_low]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, threshold_low: value }))}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">{settings.threshold_low}% - Relaxed state</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">Medium Stress Threshold</label>
                  <div className="mt-2">
                    <Slider
                      value={[settings.threshold_medium]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, threshold_medium: value }))}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">{settings.threshold_medium}% - Alert state</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">High Stress Threshold</label>
                  <div className="mt-2">
                    <Slider
                      value={[settings.threshold_high]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, threshold_high: value }))}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">{settings.threshold_high}% - High stress</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">Daily Reminder Time</label>
                  <Input
                    type="time"
                    value={settings.notification_time}
                    onChange={(e) => setSettings(prev => ({ ...prev, notification_time: e.target.value }))}
                    className="mt-2"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</label>
                    <Switch
                      checked={settings.email_enabled}
                      onCheckedChange={(email_enabled) => setSettings(prev => ({ ...prev, email_enabled }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</label>
                    <Switch
                      checked={settings.push_enabled}
                      onCheckedChange={(push_enabled) => setSettings(prev => ({ ...prev, push_enabled }))}
                    />
                  </div>
                </div>

                <Button onClick={saveSettings} className="w-full">
                  Save Settings
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-sm text-gray-900 dark:text-white">Alert Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Total Alerts</span>
                  <Badge variant="outline">{alerts.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Unread</span>
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    {alerts.filter(a => !a.read).length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">High Priority</span>
                  <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                    {alerts.filter(a => a.priority === 'high').length}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alert List */}
          <div className="lg:col-span-2">
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-xl">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {alerts.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-300">No alerts yet</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Alerts will appear here when stress thresholds are exceeded</p>
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-lg border ${
                          alert.read 
                            ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700' 
                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="p-2 rounded-lg bg-white dark:bg-slate-700">
                              {getTypeIcon(alert.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-gray-900 dark:text-white">{alert.title}</h3>
                                <Badge className={getPriorityColor(alert.priority)} variant="outline">
                                  {alert.priority}
                                </Badge>
                                {!alert.read && (
                                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                    New
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{alert.message}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(alert.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!alert.read && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => markAsRead(alert.id)}
                              >
                                Mark Read
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteAlert(alert.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* New Alert Modal */}
        {showNewAlert && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Create New Alert</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={newAlert.title}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Alert title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    value={newAlert.message}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Alert message"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select value={newAlert.type} onValueChange={(type) => setNewAlert(prev => ({ ...prev, type }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stress">Stress</SelectItem>
                      <SelectItem value="heart">Heart Rate</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={newAlert.priority} onValueChange={(priority) => setNewAlert(prev => ({ ...prev, priority }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={createAlert} className="flex-1">
                    Create Alert
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowNewAlert(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default StressAlertsPage;
