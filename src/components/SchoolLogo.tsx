import React, { useState, useEffect } from 'react';
import {
  getCachedSchoolSettings,
  fetchSchoolSettings,
  BUNDLED_OFFICIAL_LOGO,
  getOfficialSupabaseLogoUrl,
  SchoolSettings,
} from '../lib/schoolSettings';

interface SchoolLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'intro' | string;
  showGlowRing?: boolean;
  className?: string;
  id?: string;
  customLogoUrl?: string | null;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  size = 'md',
  showGlowRing = true,
  className = '',
  id = 'school-logo-component',
  customLogoUrl,
}) => {
  const [settings, setSettings] = useState<SchoolSettings>(getCachedSchoolSettings());
  const [imgSrc, setImgSrc] = useState<string>(() => {
    if (customLogoUrl && customLogoUrl.trim().length > 0) return customLogoUrl;
    const initial = getCachedSchoolSettings().logo_url;
    return initial && initial.trim().length > 0 ? initial : BUNDLED_OFFICIAL_LOGO;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  // Sync with global school settings & listen for live Supabase updates
  useEffect(() => {
    let isMounted = true;

    fetchSchoolSettings().then((s) => {
      if (isMounted) {
        setSettings(s);
        if (!customLogoUrl) {
          setImgSrc(s.logo_url || BUNDLED_OFFICIAL_LOGO);
        }
      }
    });

    const handleSettingsUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<SchoolSettings>;
      if (customEvent.detail && isMounted) {
        setSettings(customEvent.detail);
        if (!customLogoUrl) {
          setImgSrc(customEvent.detail.logo_url || BUNDLED_OFFICIAL_LOGO);
          setHasError(false);
          setIsLoading(true);
        }
      }
    };

    window.addEventListener('school_settings_updated', handleSettingsUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener('school_settings_updated', handleSettingsUpdated);
    };
  }, [customLogoUrl]);

  useEffect(() => {
    if (customLogoUrl && customLogoUrl.trim().length > 0) {
      setImgSrc(customLogoUrl);
      setHasError(false);
      setIsLoading(true);
    }
  }, [customLogoUrl]);

  // Size mapping matching the Immersive UI proportions
  const sizeMap: Record<
    string,
    {
      container: string;
      img: string;
      ringOuter: string;
      ringMiddle: string;
      borderThickness: string;
      glowSize: string;
      textFallbackSize: string;
    }
  > = {
    xs: {
      container: 'w-8 h-8 sm:w-9 sm:h-9',
      img: 'w-6 h-6 sm:w-7 sm:h-7',
      ringOuter: 'w-10 h-10 sm:w-11 sm:h-11',
      ringMiddle: 'w-9 h-9 sm:w-10 sm:h-10',
      borderThickness: 'border',
      glowSize: 'blur-2xs',
      textFallbackSize: 'text-[6px]',
    },
    sm: {
      container: 'w-10 h-10 sm:w-12 sm:h-12',
      img: 'w-8 h-8 sm:w-10 sm:h-10',
      ringOuter: 'w-12 h-12 sm:w-14 sm:h-14',
      ringMiddle: 'w-11 h-11 sm:w-13 sm:h-13',
      borderThickness: 'border-2',
      glowSize: 'blur-xs',
      textFallbackSize: 'text-[7px]',
    },
    md: {
      container: 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28',
      img: 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24',
      ringOuter: 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32',
      ringMiddle: 'w-22 h-22 sm:w-26 sm:h-26 md:w-30 md:h-30',
      borderThickness: 'border-2 sm:border-3',
      glowSize: 'blur-sm',
      textFallbackSize: 'text-[9px] sm:text-[10px]',
    },
    lg: {
      container: 'w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36',
      img: 'w-22 h-22 sm:w-26 sm:h-26 md:w-30 md:h-30',
      ringOuter: 'w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40',
      ringMiddle: 'w-30 h-30 sm:w-34 sm:h-34 md:w-38 md:h-38',
      borderThickness: 'border-3 sm:border-4',
      glowSize: 'blur-md',
      textFallbackSize: 'text-xs sm:text-sm',
    },
    xl: {
      container: 'w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52',
      img: 'w-28 h-28 sm:w-36 sm:h-36 md:w-42 md:h-42',
      ringOuter: 'w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56',
      ringMiddle: 'w-38 h-38 sm:w-46 sm:h-46 md:w-54 md:h-54',
      borderThickness: 'border-3 sm:border-4 md:border-5',
      glowSize: 'blur-lg',
      textFallbackSize: 'text-sm sm:text-base font-bold',
    },
    intro: {
      container: 'w-36 h-36 xs:w-44 xs:h-44 sm:w-56 sm:h-56 md:w-64 md:h-64',
      img: 'w-30 h-30 xs:w-38 xs:h-38 sm:w-48 sm:h-48 md:w-54 md:h-54',
      ringOuter: 'w-42 h-42 xs:w-52 xs:h-52 sm:w-64 sm:h-64 md:w-72 md:h-72',
      ringMiddle: 'w-38 h-38 xs:w-48 xs:h-48 sm:w-60 sm:h-60 md:w-68 md:h-68',
      borderThickness: 'border-3 sm:border-4 md:border-5',
      glowSize: 'blur-xl',
      textFallbackSize: 'text-xs sm:text-base font-bold',
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const handleImageError = () => {
    setIsLoading(false);
    // If current source failed and isn't already the bundled local path, fall back to bundled official logo
    if (imgSrc !== BUNDLED_OFFICIAL_LOGO) {
      setImgSrc(BUNDLED_OFFICIAL_LOGO);
    } else {
      setHasError(true);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  return (
    <div
      id={id}
      className={`relative inline-flex items-center justify-center select-none ${currentSize.container} ${className}`}
    >
      {/* Outer Radiance Glow Halo Rings */}
      {showGlowRing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Subtle Ambient Radial Glow */}
          <div
            className={`absolute ${currentSize.ringOuter} rounded-full bg-gradient-to-r from-amber-400/30 via-purple-500/20 to-indigo-500/30 ${currentSize.glowSize} animate-pulse`}
          />
          {/* Concentric Golden Ring Frame */}
          <div
            className={`absolute ${currentSize.ringMiddle} rounded-full border border-amber-400/40 opacity-80`}
          />
        </div>
      )}

      {/* Official School Crest Emblem Container */}
      <div
        className={`relative z-10 w-full h-full bg-white rounded-full shadow-2xl flex items-center justify-center ${currentSize.borderThickness} border-white overflow-hidden`}
      >
        {isLoading && !hasError && (
          <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-purple-900 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!hasError ? (
          <img
            src={imgSrc}
            alt={settings.school_name || 'VipulanAntha College Colombo'}
            className={`${currentSize.img} object-contain transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            draggable={false}
          />
        ) : (
          /* Simple Text Fallback - Strictly No fake generated logos */
          <div className="w-full h-full rounded-full bg-purple-950 p-2 flex flex-col items-center justify-center text-center text-amber-200">
            <div className={`font-cinzel font-bold text-amber-300 ${currentSize.textFallbackSize} leading-tight`}>
              VIPULANANTHA COLLEGE COLOMBO
            </div>
            <div className="text-[7px] sm:text-[9px] text-purple-200 mt-0.5">ESTD 1920</div>
          </div>
        )}
      </div>
    </div>
  );
};
