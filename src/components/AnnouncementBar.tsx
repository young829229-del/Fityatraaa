import { useState, useEffect } from 'react';
import { subscribeToStoreSettings } from '../services/firestoreService';

interface AnnouncementBarProps {
  text?: string;
}

export default function AnnouncementBar({ text }: AnnouncementBarProps) {
  const [displayText, setDisplayText] = useState<string>(text || 'Make Health Better Again');

  useEffect(() => {
    if (text !== undefined && text !== '') {
      setDisplayText(text);
      return;
    }
    const unsub = subscribeToStoreSettings((settings) => {
      if (settings?.announcementText) {
        setDisplayText(settings.announcementText);
      }
    });
    return () => unsub();
  }, [text]);

  return (
    <div className="bg-[#0c1a3b] text-white text-center py-2.5 px-4 text-xs sm:text-[13px] font-semibold tracking-wide">
      {displayText}
    </div>
  );
}
