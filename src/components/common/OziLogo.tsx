import React, { useState } from 'react';
import { OZI_LOGO_URL } from '../../assets/oziLogoBase64';

interface OziLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const OziLogo: React.FC<OziLogoProps> = ({ 
  className = '', 
  size = 'md',
  showText = false
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    xs: 'h-7 sm:h-8 w-auto max-w-[100px]',
    sm: 'h-10 sm:h-11 w-auto max-w-[150px]',
    md: 'h-12 sm:h-14 w-auto max-w-[200px]',
    lg: 'h-18 sm:h-20 w-auto max-w-[280px]',
    xl: 'h-24 sm:h-28 w-auto max-w-[380px]',
  }[size];

  const iconSizes = {
    xs: 'w-7 h-7',
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-18 h-18',
    xl: 'w-24 h-24',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {!imgError ? (
        <img
          src={OZI_LOGO_URL || '/images/ozi-logo.png'}
          alt="OZI Logo"
          onError={() => {
            setImgError(true);
          }}
          className={`${sizeClasses} object-contain transition-transform hover:scale-105 duration-200 shrink-0 drop-shadow-md`}
          loading="eager"
        />
      ) : (
        <div className="flex items-center gap-2">
          <div className={`${iconSizes} rounded-xl bg-gradient-to-br from-[#FF6B5B] to-[#FF3829] flex items-center justify-center shadow-lg shadow-red-500/20 shrink-0`}>
            <div className="w-2/3 h-2/3 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
          </div>
          <span className="font-black text-white text-lg tracking-tight font-almodobar">
            O<span className="text-[#FF5A50]">Z</span>I
          </span>
        </div>
      )}

      {showText && !imgError && (
        <span className="font-extrabold tracking-tight text-white font-almodobar text-base leading-none hidden sm:inline-block">
          OZI<span className="text-[#ff5a50] font-normal text-xs ml-1 font-sans">Webtoon</span>
        </span>
      )}
    </div>
  );
};

export default OziLogo;
