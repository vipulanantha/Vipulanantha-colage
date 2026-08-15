import React from 'react';

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
  // Size mapping matching the Immersive UI proportions
  const sizeMap = {
    sm: {
      container: 'w-10 h-10 sm:w-12 sm:h-12',
      img: 'w-8 h-8 sm:w-10 sm:h-10',
      glowRing: 'inset-[-4px]',
      dashedRing: 'inset-[-3px]',
      solidRing: 'inset-[-1px]',
      blurSize: 'blur-md',
      borderThickness: 'border-2',
    },
    md: {
      container: 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28',
      img: 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24',
      glowRing: 'inset-[-10px] sm:inset-[-12px]',
      dashedRing: 'inset-[-6px] sm:inset-[-8px]',
      solidRing: 'inset-[-2px] sm:inset-[-3px]',
      blurSize: 'blur-xl',
      borderThickness: 'border-[2.5px] sm:border-[3px]',
    },
    lg: {
      container: 'w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36',
      img: 'w-22 h-22 sm:w-26 sm:h-26 md:w-30 md:h-30',
      glowRing: 'inset-[-12px] sm:inset-[-16px]',
      dashedRing: 'inset-[-8px] sm:inset-[-10px]',
      solidRing: 'inset-[-3px] sm:inset-[-4px]',
      blurSize: 'blur-2xl',
      borderThickness: 'border-[3px] sm:border-4',
    },
    intro: {
      container: 'w-36 h-36 xs:w-44 xs:h-44 sm:w-56 sm:h-56 md:w-64 md:h-64',
      img: 'w-30 h-30 xs:w-38 xs:h-38 sm:w-48 sm:h-48 md:w-54 md:h-54',
      glowRing: 'inset-[-16px] sm:inset-[-24px]',
      dashedRing: 'inset-[-10px] sm:inset-[-14px]',
      solidRing: 'inset-[-4px] sm:inset-[-6px]',
      blurSize: 'blur-2xl sm:blur-3xl',
      borderThickness: 'border-[3px] sm:border-4',
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
        <img
          src="/assets/vipulanatha-college-logo.png"
          alt="VipulanAntha College Colombo"
          className={`${currentSize.img} object-contain`}
          draggable={false}
        />
      </div>
    </div>
  );
};


