import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Calendar, Moon } from 'lucide-react';

interface HijriDate {
  day: number;
  month: string;
  year: number;
  monthNumber: number;
}

const HijriCalendar = () => {
  const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
  const [gregorianDate, setGregorianDate] = useState<Date>(new Date());

  const hijriMonths = [
    'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
    'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
    'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
  ];

  const hijriMonthsArabic = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
    'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
    'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
  ];

  // Simplified Hijri conversion (in real app, use precise astronomical calculation)
  const convertToHijri = (gregorianDate: Date): HijriDate => {
    // This is a simplified conversion. In production, use a proper Hijri calendar library
    const epoch = new Date('622-07-16'); // Approximate start of Hijri calendar
    const daysDiff = Math.floor((gregorianDate.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24));
    
    // Approximate calculation (354 days per Hijri year)
    const hijriYear = Math.floor(daysDiff / 354) + 1;
    const dayOfYear = daysDiff % 354;
    
    // Approximate month calculation (29.5 days per month)
    const monthNumber = Math.floor(dayOfYear / 29.5);
    const dayOfMonth = Math.floor(dayOfYear % 29.5) + 1;

    return {
      day: dayOfMonth,
      month: hijriMonths[monthNumber] || hijriMonths[0],
      year: hijriYear,
      monthNumber: monthNumber
    };
  };

  const getIslamicEvents = (month: string, day: number) => {
    const events: string[] = [];
    
    if (month === 'Ramadan') {
      if (day === 1) events.push('Start of Ramadan');
      if (day >= 27) events.push('Laylat al-Qadr (Night of Power)');
    }
    
    if (month === 'Dhu al-Hijjah') {
      if (day >= 8 && day <= 12) events.push('Hajj Period');
      if (day === 10) events.push('Eid al-Adha');
    }
    
    if (month === 'Shawwal' && day === 1) {
      events.push('Eid al-Fitr');
    }
    
    if (month === 'Muharram') {
      if (day === 1) events.push('Islamic New Year');
      if (day === 10) events.push('Day of Ashura');
    }

    return events;
  };

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      setGregorianDate(now);
      setHijriDate(convertToHijri(now));
    };

    updateDate();
    const timer = setInterval(updateDate, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  if (!hijriDate) return null;

  const events = getIslamicEvents(hijriDate.month, hijriDate.day);
  const currentTime = gregorianDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="space-y-6">
      {/* Current Date */}
      <Card className="p-6 bg-gradient-to-br from-accent/10 to-primary/5">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="h-6 w-6 text-primary" />
          <h3 className="text-lg font-semibold">Islamic Calendar</h3>
        </div>
        
        <div className="space-y-3">
          {/* Hijri Date */}
          <div className="text-center p-4 bg-background/50 rounded-lg">
            <p className="text-2xl font-bold text-primary mb-1">
              {hijriDate.day} {hijriDate.month} {hijriDate.year} AH
            </p>
            <p className="text-lg text-muted-foreground mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>
              {hijriDate.day} {hijriMonthsArabic[hijriDate.monthNumber]} {hijriDate.year} هـ
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Moon className="h-4 w-4" />
              <span>{currentTime}</span>
            </div>
          </div>
          
          {/* Gregorian Date */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {gregorianDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </Card>

      {/* Islamic Events */}
      {events.length > 0 && (
        <Card className="p-4 bg-primary/10 border-primary/20">
          <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
            <Moon className="h-4 w-4" />
            Today's Significance
          </h4>
          <ul className="space-y-2">
            {events.map((event, index) => (
              <li key={index} className="text-sm bg-background/50 p-2 rounded">
                {event}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Month Info */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">Current Month: {hijriDate.month}</h4>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {/* Days of week */}
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="p-2 font-semibold text-muted-foreground">
              {day}
            </div>
          ))}
          
          {/* Calendar days (simplified) */}
          {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
            <div
              key={day}
              className={`p-2 rounded transition-colors ${
                day === hijriDate.day
                  ? 'bg-primary text-primary-foreground font-bold'
                  : 'hover:bg-muted'
              }`}
            >
              {day}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default HijriCalendar;