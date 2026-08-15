import React, { useState } from 'react';

interface SchoolLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'intro';
  showGlowRing?: boolean;
  className?: string;
  id?: string;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  size = 'md',
  showGlowRing = true,
  className = '',
  id = 'school-logo-component',
}) => {
  const [imgError, setImgError] = useState(false);

  // Size mapping matching the Immersive UI proportions
  const sizeMap = {
    sm: {
      container: 'w-12 h-12',
      img: 'w-10 h-10',
      glowRing: 'inset-[-4px]',
      dashedRing: 'inset-[-3px]',
      solidRing: 'inset-[-1px]',
      blurSize: 'blur-md',
      borderThickness: 'border-2',
    },
    md: {
      container: 'w-24 h-24 sm:w-28 sm:h-28',
      img: 'w-20 h-20 sm:w-24 sm:h-24',
      glowRing: 'inset-[-12px]',
      dashedRing: 'inset-[-8px]',
      solidRing: 'inset-[-3px]',
      blurSize: 'blur-xl',
      borderThickness: 'border-[3px]',
    },
    lg: {
      container: 'w-32 h-32 sm:w-36 sm:h-36',
      img: 'w-26 h-26 sm:w-30 sm:h-30',
      glowRing: 'inset-[-16px]',
      dashedRing: 'inset-[-10px]',
      solidRing: 'inset-[-4px]',
      blurSize: 'blur-2xl',
      borderThickness: 'border-4',
    },
    intro: {
      container: 'w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64',
      img: 'w-40 h-40 sm:w-48 sm:h-48 md:w-54 md:h-54',
      glowRing: 'inset-[-24px]',
      dashedRing: 'inset-[-14px]',
      solidRing: 'inset-[-6px]',
      blurSize: 'blur-3xl',
      borderThickness: 'border-4',
    },
  };

  const currentSize = sizeMap[size];

  return (
    <div
      id={id}
      className={`relative flex items-center justify-center select-none ${currentSize.container} ${className}`}
    >
      {/* Immersive UI: Golden radiant background aura */}
      {showGlowRing && (
        <>
          <div
            className={`absolute ${currentSize.glowRing} bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] rounded-full ${currentSize.blurSize} opacity-35 animate-golden-pulse pointer-events-none`}
            aria-hidden="true"
          />

          {/* Immersive UI: Outer thin solid gold accent border */}
          <div
            className={`absolute ${currentSize.solidRing} border-2 border-[#D4AF37]/30 rounded-full pointer-events-none`}
            aria-hidden="true"
          />

          {/* Immersive UI: Outer dashed spinning orbital ring */}
          <div
            className={`absolute ${currentSize.dashedRing} border border-dashed border-[#D4AF37]/50 rounded-full animate-slow-rotate pointer-events-none`}
            aria-hidden="true"
          />
        </>
      )}

      {/* Official School Crest Emblem Medallion */}
      <div
        className={`relative z-10 w-full h-full bg-white rounded-full shadow-2xl flex items-center justify-center ${currentSize.borderThickness} border-white overflow-hidden`}
      >
        {!imgError ? (
          <img
            src="/school-logo.jpg"
            alt="Vipulanantha College Colombo Official Crest - ESTD 1920"
            className={`${currentSize.img} object-contain`}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            draggable={false}
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-950 via-purple-900 to-blue-950 p-2 flex flex-col items-center justify-center text-center text-amber-200">
            <div className="text-[10px] sm:text-xs font-cinzel font-bold tracking-wider text-amber-300">
              VIPULANANTHA
            </div>
            <div className="my-1 w-6 h-6 rounded-full bg-amber-500/20 border border-amber-300 flex items-center justify-center text-amber-300">
              🪔
            </div>
            <div className="text-[8px] sm:text-[9px] font-semibold text-white">ESTD 1920</div>
            <div className="text-[7px] sm:text-[8px] font-tamil text-amber-300 mt-0.5">
              நாளும் பயில்வோம் நற்பணி புரிவோம்
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

