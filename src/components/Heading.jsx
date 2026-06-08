import React from 'react';

export default function Heading({ heading, subHeading, className = '' }) {
  const rootClassName = ['page-heading', 'page-heading--stacked', 'page-heading--mesh-theme', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClassName}>
      <div className="heading-stack">
        {subHeading ? (
          <div className="heading-stack__eyebrow">
            <span className="heading-stack__eyebrow-text">{subHeading}</span>
          </div>
        ) : null}
        <div className="heading-stack__title">{heading}</div>
      </div>
    </div>
  );
}
