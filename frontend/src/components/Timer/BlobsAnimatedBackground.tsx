import React from 'react';

export const BlobsAnimatedBackground: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`relative w-full flex items-center justify-center ${className}`} style={{ zIndex: 1 }}>
    <div className="stack">
      <div className="blobs">
        <div className="blob"></div>
        <div className="blob"></div>
        <div className="blob"></div>
        <div className="blob"></div>
      </div>
    </div>
  </div>
); 