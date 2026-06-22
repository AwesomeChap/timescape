import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import Heading from '@/components/Heading';
import TimescapeTimeline from '@/features/timescape/TimescapeTimeline';
import { MONUMENT, TIMELINE_ERAS, MORPH_DURATION_MS } from '@/features/timescape/timescapeMeta';

const TimescapeCanvas = lazy(() => import('@/features/timescape/TimescapeCanvas'));

// Timeline reads oldest → newest, so the present day sits at the last stop.
const PRESENT_ERA_INDEX = TIMELINE_ERAS.length - 1;

export default function App() {
  const [activeIndex, setActiveIndex] = useState(PRESENT_ERA_INDEX);
  const [morphProgress, setMorphProgress] = useState(1);
  const [fromEraIndex, setFromEraIndex] = useState(PRESENT_ERA_INDEX);
  const [toEraIndex, setToEraIndex] = useState(PRESENT_ERA_INDEX);
  const morphFrameRef = useRef(0);
  const morphStartRef = useRef(0);
  const activeIndexRef = useRef(PRESENT_ERA_INDEX);
  const morphingRef = useRef(false);
  const canvasRef = useRef(null);

  const cancelMorph = useCallback(() => {
    if (morphFrameRef.current) {
      window.cancelAnimationFrame(morphFrameRef.current);
      morphFrameRef.current = 0;
    }
    morphingRef.current = false;
  }, []);

  const selectEra = useCallback(
    (nextIndex) => {
      const clamped = Math.max(0, Math.min(TIMELINE_ERAS.length - 1, nextIndex));
      const current = activeIndexRef.current;

      if (clamped === current && !morphingRef.current) return;

      cancelMorph();

      const from = morphingRef.current ? toEraIndex : current;

      morphingRef.current = true;
      setFromEraIndex(from);
      setToEraIndex(clamped);
      setMorphProgress(0);
      morphStartRef.current = performance.now();

      const tick = (now) => {
        const elapsed = now - morphStartRef.current;
        const t = Math.min(elapsed / MORPH_DURATION_MS, 1);
        setMorphProgress(t);

        if (t < 1) {
          morphFrameRef.current = window.requestAnimationFrame(tick);
          return;
        }

        activeIndexRef.current = clamped;
        setActiveIndex(clamped);
        setFromEraIndex(clamped);
        setToEraIndex(clamped);
        setMorphProgress(1);
        morphingRef.current = false;
        morphFrameRef.current = 0;
      };

      morphFrameRef.current = window.requestAnimationFrame(tick);
    },
    [cancelMorph, toEraIndex]
  );

  useEffect(() => () => cancelMorph(), [cancelMorph]);

  const displayIndex = morphProgress < 1 ? toEraIndex : activeIndex;
  const displayEra = TIMELINE_ERAS[displayIndex];

  return (
    <div className="section section-timescape timescape-page">
      <div className="inner-section">
        <div className="sub-section timescape-page__hero">
          <div className="timescape-page__copy-column">
            <header className="timescape-page__intro">
              <Heading heading="Timescape" subHeading="Hackathon experiment" />
              <p className="text timescape-page__monument">
                {MONUMENT.name}
                <span className="timescape-page__location">{MONUMENT.location}</span>
              </p>
            </header>

            <aside className="timescape-page__details">
              <div className="timescape-page__era">
                <Heading
                  heading={String(displayEra.year)}
                  subHeading={displayEra.label}
                  className="timescape-page__era-heading"
                />
                {displayEra.description
                  .split('\n')
                  .filter((line) => line.trim() !== '')
                  .map((line, index) => {
                    const match = line.match(/^(\d{4}):?(.*)$/);
                    return (
                      <p className="text timescape-page__era-line" key={index}>
                        {match ? (
                          <>
                            <span className="timescape-page__era-year-inline">{match[1]}</span>
                            {match[2]}
                          </>
                        ) : (
                          line
                        )}
                      </p>
                    );
                  })}
              </div>
            </aside>
          </div>

          <div className="image-container timescape-page__visual">
            <div className="timescape-page__stage">
              <div className="timescape-page__model">
                <div className="timescape-page__stage-controls">
                  <p className="timescape-page__stage-hint">Drag to orbit · scroll to zoom</p>
                  <button
                    type="button"
                    className="timescape-page__reset-view"
                    onClick={() => canvasRef.current?.resetView()}
                    aria-label="Reset zoom and camera angle"
                  >
                    Reset zoom
                  </button>
                </div>
                <div className="image timescape-page__canvas-shell">
                  <Suspense fallback={null}>
                    <TimescapeCanvas
                      ref={canvasRef}
                      morphProgress={morphProgress}
                      fromEraIndex={fromEraIndex}
                      toEraIndex={toEraIndex}
                    />
                  </Suspense>
                </div>
              </div>
            </div>

            <TimescapeTimeline
              activeIndex={activeIndex}
              morphProgress={morphProgress}
              morphFromIndex={fromEraIndex}
              morphToIndex={toEraIndex}
              onSelectEra={selectEra}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
