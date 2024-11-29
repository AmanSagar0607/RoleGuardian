import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bell, Mail, MessageSquare, Shield } from "lucide-react";

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  icon: React.ReactNode;
}

export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: "security",
      title: "Security Alerts",
      description: "Get notified about security events like login attempts and password changes",
      enabled: true,
      icon: <Shield className="h-4 w-4" />,
    },
    {
      id: "updates",
      title: "System Updates",
      description: "Receive notifications about system updates and maintenance",
      enabled: true,
      icon: <Bell className="h-4 w-4" />,
    },
    {
      id: "messages",
      title: "Direct Messages",
      description: "Get notified when someone sends you a direct message",
      enabled: true,
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      id: "email",
      title: "Email Notifications",
      description: "Receive email notifications for important updates",
      enabled: true,
      icon: <Mail className="h-4 w-4" />,
    },
  ]);

  const handleToggle = (id: string) => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === id
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    );
  };

  const handleSave = () => {
    // Here you would typically save to your backend
    toast.success("Notification preferences saved");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose what notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {settings.map((setting) => (
            <div
              key={setting.id}
              className="flex items-center justify-between space-x-4"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center space-x-2">
                  {setting.icon}
                  <span className="font-medium">{setting.title}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {setting.description}
                </p>
              </div>
              <Switch
                checked={setting.enabled}
                onCheckedChange={() => handleToggle(setting.id)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Preferences</Button>
      </div>
    </div>
  );
}