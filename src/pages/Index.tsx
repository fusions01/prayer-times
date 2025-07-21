import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Compass, Calendar, Moon, Download, Wifi, WifiOff } from 'lucide-react';
import PrayerTimes from '@/components/PrayerTimes';
import QiblaCompass from '@/components/QiblaCompass';
import HijriCalendar from '@/components/HijriCalendar';
import adhanIcon from '@/assets/adhan-icon.png';
import { 
  handleInstallPrompt, 
  showInstallPrompt, 
  isInstalled, 
  registerForNotifications,
  setupConnectivityListener,
  isOnline
} from '@/utils/pwa';

const Index = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [isConnected, setIsConnected] = useState(isOnline());
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    // Setup PWA install prompt
    handleInstallPrompt();
    setIsAppInstalled(isInstalled());
    
    // Setup connectivity listener
    const cleanupConnectivity = setupConnectivityListener(
      () => setIsConnected(true),
      () => setIsConnected(false)
    );

    // Check if install prompt is available
    const checkInstallPrompt = () => {
      setCanInstall(!isInstalled());
    };
    
    window.addEventListener('beforeinstallprompt', checkInstallPrompt);
    
    return () => {
      cleanupConnectivity();
      window.removeEventListener('beforeinstallprompt', checkInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    const installed = await showInstallPrompt();
    if (installed) {
      setCanInstall(false);
      setIsAppInstalled(true);
    }
  };

  const handleEnableNotifications = async () => {
    const enabled = await registerForNotifications();
    setNotificationsEnabled(enabled);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={adhanIcon} alt="Adhan" className="h-10 w-10 rounded-lg shadow-md" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Adhan
                </h1>
                <p className="text-sm text-muted-foreground">Prayer Times & Qibla Finder</p>
              </div>
            </div>
            
            {/* Status indicators and actions */}
            <div className="flex items-center gap-2">
              {/* Connection status */}
              <Badge variant={isConnected ? "default" : "secondary"} className="gap-1">
                {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {isConnected ? 'Online' : 'Offline'}
              </Badge>
              
              {/* Install button */}
              {canInstall && !isAppInstalled && (
                <Button onClick={handleInstall} size="sm" variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Install
                </Button>
              )}
              
              {/* Notifications toggle */}
              {isAppInstalled && !notificationsEnabled && (
                <Button onClick={handleEnableNotifications} size="sm" variant="outline">
                  Enable Alerts
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="prayers" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-card">
            <TabsTrigger value="prayers" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Prayer Times</span>
              <span className="sm:hidden">Prayers</span>
            </TabsTrigger>
            <TabsTrigger value="qibla" className="flex items-center gap-2">
              <Compass className="h-4 w-4" />
              <span className="hidden sm:inline">Qibla</span>
              <span className="sm:hidden">Qibla</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
              <span className="sm:hidden">Date</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prayers" className="space-y-6">
            <PrayerTimes />
          </TabsContent>

          <TabsContent value="qibla" className="space-y-6">
            <QiblaCompass 
              userLatitude={location?.latitude} 
              userLongitude={location?.longitude} 
            />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <HijriCalendar />
          </TabsContent>
        </Tabs>

        {/* Islamic Quote Card */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <div className="text-center space-y-2">
            <Moon className="h-6 w-6 mx-auto text-primary" />
            <p className="text-lg font-semibold text-primary">
              "And establish prayer and give zakah and bow with those who bow."
            </p>
            <p className="text-sm text-muted-foreground">Quran 2:43</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
