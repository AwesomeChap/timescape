import React, { useCallback, useState } from 'react';
import MapLanding from '@/features/map/MapLanding';
import TimescapePage from '@/features/timescape/TimescapePage';

export default function AppRoot() {
  const [view, setView] = useState('map');

  const enterTimescape = useCallback(() => setView('timescape'), []);
  const backToMap = useCallback(() => setView('map'), []);

  if (view === 'timescape') {
    return <TimescapePage onBackToMap={backToMap} />;
  }

  return <MapLanding onEnterTimescape={enterTimescape} />;
}
