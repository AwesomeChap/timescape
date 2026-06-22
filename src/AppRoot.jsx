import React, { useCallback, useRef, useState } from 'react';
import MapLanding from '@/features/map/MapLanding';
import TimescapePage from '@/features/timescape/TimescapePage';
import PixelPageTransition from '@/shared/transitions/PixelPageTransition';

export default function AppRoot() {
  const [view, setView] = useState('map');
  const transitionRef = useRef(null);

  const enterTimescape = useCallback(() => {
    transitionRef.current?.navigate(() => setView('timescape'));
  }, []);

  const backToMap = useCallback(() => {
    transitionRef.current?.navigate(() => setView('map'));
  }, []);

  return (
    <>
      <PixelPageTransition ref={transitionRef} />
      {view === 'timescape' ? (
        <TimescapePage onBackToMap={backToMap} />
      ) : (
        <MapLanding onEnterTimescape={enterTimescape} />
      )}
    </>
  );
}
