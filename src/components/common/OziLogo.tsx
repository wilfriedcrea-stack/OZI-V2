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
    xs: 'h-6 sm:h-7 w-auto max-w-[85px]',
    sm: 'h-8 sm:h-9 w-auto max-w-[120px]',
    md: 'h-9 sm:h-10 w-auto max-w-[145px]',
    lg: 'h-14 sm:h-16 w-auto max-w-[210px]',
    xl: 'h-20 sm:h-24 w-auto max-w-[300px]',
  }[size];

  const iconSizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
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
