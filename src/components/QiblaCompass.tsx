import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navigation, Compass } from 'lucide-react';

interface QiblaCompassProps {
  userLatitude?: number;
  userLongitude?: number;
}

const QiblaCompass = ({ userLatitude, userLongitude }: QiblaCompassProps) => {
  const [qiblaDirection, setQiblaDirection] = useState<number>(0);
  const [currentHeading, setCurrentHeading] = useState<number>(0);
  const [isCalibrating, setIsCalibrating] = useState(false);

  // Kaaba coordinates
  const KAABA_LAT = 21.4225;
  const KAABA_LNG = 39.8262;

  const calculateQiblaDirection = (lat: number, lng: number) => {
    const φ1 = lat * Math.PI / 180;
    const φ2 = KAABA_LAT * Math.PI / 180;
    const Δλ = (KAABA_LNG - lng) * Math.PI / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    let θ = Math.atan2(y, x);
    θ = (θ * 180 / Math.PI + 360) % 360;

    setQiblaDirection(θ);
  };

  const handleCalibrate = () => {
    setIsCalibrating(true);
    
    if ('DeviceOrientationEvent' in window) {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        if (event.alpha !== null) {
          setCurrentHeading(360 - event.alpha);
          setIsCalibrating(false);
        }
      };

      window.addEventListener('deviceorientation', handleOrientation);
      
      setTimeout(() => {
        window.removeEventListener('deviceorientation', handleOrientation);
        setIsCalibrating(false);
      }, 3000);
    } else {
      setIsCalibrating(false);
    }
  };

  useEffect(() => {
    if (userLatitude && userLongitude) {
      calculateQiblaDirection(userLatitude, userLongitude);
    }
  }, [userLatitude, userLongitude]);

  const compassRotation = qiblaDirection - currentHeading;
  const distance = userLatitude && userLongitude ? 
    Math.round(Math.sqrt(Math.pow(userLatitude - KAABA_LAT, 2) + Math.pow(userLongitude - KAABA_LNG, 2)) * 111) : 0;

  return (
    <div className="space-y-6">
      {/* Qibla Direction Card */}
      <Card className="p-6 text-center bg-gradient-to-br from-primary/5 to-accent/5">
        <h3 className="text-lg font-semibold mb-4 flex items-center justify-center gap-2">
          <Compass className="h-5 w-5" />
          Qibla Direction
        </h3>
        
        {/* Compass */}
        <div className="relative mx-auto w-48 h-48 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-border bg-gradient-to-br from-muted to-background shadow-elegant">
            {/* Compass markings */}
            <div className="absolute inset-2 rounded-full border border-border/50">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((degree) => (
                <div
                  key={degree}
                  className="absolute w-0.5 h-6 bg-muted-foreground origin-bottom"
                  style={{
                    left: '50%',
                    bottom: '50%',
                    transform: `translateX(-50%) rotate(${degree}deg)`,
                  }}
                />
              ))}
              
              {/* Qibla indicator */}
              <div
                className="absolute w-1 h-16 bg-gradient-to-t from-primary to-accent origin-bottom transition-transform duration-1000 ease-out"
                style={{
                  left: '50%',
                  bottom: '50%',
                  transform: `translateX(-50%) rotate(${compassRotation}deg)`,
                }}
              >
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <Navigation className="h-4 w-4 text-accent fill-accent" />
                </div>
              </div>
              
              {/* Center dot */}
              <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            
            {/* Cardinal directions */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-primary">N</div>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-muted-foreground">S</div>
            <div className="absolute top-1/2 right-2 transform -translate-y-1/2 text-sm font-semibold text-muted-foreground">E</div>
            <div className="absolute top-1/2 left-2 transform -translate-y-1/2 text-sm font-semibold text-muted-foreground">W</div>
          </div>
        </div>

        {/* Direction Info */}
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Qibla Direction: <span className="font-semibold text-primary">{Math.round(qiblaDirection)}°</span></p>
          {distance > 0 && (
            <p>Distance to Kaaba: <span className="font-semibold text-foreground">{distance} km</span></p>
          )}
        </div>

        {/* Calibrate Button */}
        <Button 
          onClick={handleCalibrate}
          disabled={isCalibrating}
          className="mt-4"
          variant="outline"
        >
          {isCalibrating ? 'Calibrating...' : 'Calibrate Compass'}
        </Button>
      </Card>

      {/* Instructions */}
      <Card className="p-4 bg-accent/10 border-accent/20">
        <h4 className="font-semibold text-accent mb-2">How to use:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Hold your device flat and level</li>
          <li>• Point the golden arrow towards the Kaaba</li>
          <li>• Calibrate if needed for accuracy</li>
        </ul>
      </Card>
    </div>
  );
};

export default QiblaCompass;