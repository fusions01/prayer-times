import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin } from 'lucide-react';

interface PrayerTime {
  name: string;
  time: string;
  arabic: string;
}

interface Location {
  latitude: number;
  longitude: number;
  city: string;
}

const PrayerTimes = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [currentPrayer, setCurrentPrayer] = useState<string>('');
  const [nextPrayer, setNextPrayer] = useState<string>('');
  const [timeToNext, setTimeToNext] = useState<string>('');
  const [location, setLocation] = useState<Location | null>(null);

  const calculatePrayerTimes = (lat: number, lng: number) => {
    const date = new Date();
    
    // Simplified prayer time calculation (in real app, use precise Islamic calculation)
    const prayers: PrayerTime[] = [
      { name: 'Fajr', time: '05:30', arabic: 'الفجر' },
      { name: 'Dhuhr', time: '12:30', arabic: 'الظهر' },
      { name: 'Asr', time: '15:45', arabic: 'العصر' },
      { name: 'Maghrib', time: '18:20', arabic: 'المغرب' },
      { name: 'Isha', time: '19:45', arabic: 'العشاء' }
    ];

    setPrayerTimes(prayers);
    
    // Find current and next prayer
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    let current = 'Isha';
    let next = 'Fajr';
    
    for (let i = 0; i < prayers.length; i++) {
      const [hours, minutes] = prayers[i].time.split(':').map(Number);
      const prayerTime = hours * 60 + minutes;
      
      if (currentTime < prayerTime) {
        next = prayers[i].name;
        current = i > 0 ? prayers[i - 1].name : 'Isha';
        break;
      }
    }
    
    setCurrentPrayer(current);
    setNextPrayer(next);
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({
            latitude,
            longitude,
            city: 'Your Location'
          });
          calculatePrayerTimes(latitude, longitude);
        },
        () => {
          // Default to Mecca coordinates if location denied
          setLocation({
            latitude: 21.4225,
            longitude: 39.8262,
            city: 'Mecca'
          });
          calculatePrayerTimes(21.4225, 39.8262);
        }
      );
    }
  };

  const updateTimeToNext = () => {
    if (prayerTimes.length === 0) return;
    
    const now = new Date();
    const nextPrayerTime = prayerTimes.find(p => p.name === nextPrayer);
    
    if (nextPrayerTime) {
      const [hours, minutes] = nextPrayerTime.time.split(':').map(Number);
      const next = new Date();
      next.setHours(hours, minutes, 0, 0);
      
      if (next < now) {
        next.setDate(next.getDate() + 1);
      }
      
      const diff = next.getTime() - now.getTime();
      const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
      const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeToNext(`${hoursLeft}h ${minutesLeft}m`);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    const timer = setInterval(updateTimeToNext, 1000);
    return () => clearInterval(timer);
  }, [prayerTimes, nextPrayer]);

  return (
    <div className="space-y-6">
      {/* Location */}
      {location && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{location.city}</span>
        </div>
      )}

      {/* Current Prayer Status */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary-glow/10 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current Prayer</p>
            <p className="text-2xl font-bold text-primary">{currentPrayer}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Next Prayer</p>
            <p className="text-lg font-semibold">{nextPrayer}</p>
            <p className="text-sm text-accent font-medium">in {timeToNext}</p>
          </div>
        </div>
      </Card>

      {/* Prayer Times List */}
      <div className="space-y-3">
        {prayerTimes.map((prayer) => (
          <Card 
            key={prayer.name}
            className={`p-4 transition-all ${
              prayer.name === currentPrayer 
                ? 'bg-primary text-primary-foreground shadow-elegant' 
                : prayer.name === nextPrayer
                ? 'bg-accent/10 border-accent/30'
                : 'hover:bg-muted/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5" />
                <div>
                  <p className="font-semibold">{prayer.name}</p>
                  <p className="text-sm opacity-70">{prayer.arabic}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-mono">{prayer.time}</p>
                {prayer.name === nextPrayer && (
                  <Badge variant="secondary" className="bg-accent text-accent-foreground">
                    Next
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PrayerTimes;