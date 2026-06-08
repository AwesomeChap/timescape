import React from 'react';
import { useTranslation } from 'react-i18next';
import { TIMELINE_ERAS, easeInOutCubic } from './timescapeMeta';

export default function TimescapeTimeline({
  activeIndex,
  morphProgress,
  morphFromIndex,
  morphToIndex,
  onSelectEra,
}) {
  const { t } = useTranslation();
  const maxIndex = TIMELINE_ERAS.length - 1;
  const isMorphing = morphFromIndex !== morphToIndex;
  const morphT = isMorphing ? easeInOutCubic(morphProgress) : morphProgress;
  const sliderValue = isMorphing
    ? morphFromIndex + (morphToIndex - morphFromIndex) * morphT
    : activeIndex;
  // Slight lead so the active dot grows as the fill reaches the stop, not after.
  const currentIndex = Math.min(Math.floor(sliderValue + 0.08), maxIndex);
  const fillRatio = maxIndex > 0 ? sliderValue / maxIndex : 0;
  const trackFillWidth = `calc((100% - 2 * var(--timeline-rail-inset)) * ${fillRatio})`;

  return (
    <div
      className="timescape-timeline"
      role="group"
      aria-label={t('ui.timelineAria')}
      style={{ '--timeline-stop-count': TIMELINE_ERAS.length }}
    >
      <div className="timescape-timeline__control">
        <div
          className="timescape-timeline__track-fill"
          style={{ width: trackFillWidth }}
          aria-hidden="true"
        />

        <div className="timescape-timeline__stops">
          {TIMELINE_ERAS.map((era, index) => {
            const isActive = index === currentIndex;
            const isVisited = index < currentIndex;

            return (
              <div
                key={era.id}
                className={[
                  'timescape-timeline__stop',
                  isVisited && 'timescape-timeline__stop--visited',
                  isActive && 'timescape-timeline__stop--active',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <button
                  type="button"
                  className="timescape-timeline__dot-button"
                  onClick={() => onSelectEra(index)}
                  aria-current={isActive ? 'step' : undefined}
                  aria-label={`${era.year}: ${t(`eras.${era.id}.label`)}`}
                >
                  <span className="timescape-timeline__dot" aria-hidden="true" />
                </button>
                <span className="timescape-timeline__year" aria-hidden="true">
                  {era.year}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
