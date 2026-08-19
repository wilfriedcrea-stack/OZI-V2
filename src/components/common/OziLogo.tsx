import React from 'react';

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
  const dimensions = {
    xs: { width: 44, height: 26 },
    sm: { width: 68, height: 38 },
    md: { width: 96, height: 52 },
    lg: { width: 130, height: 70 },
    xl: { width: 180, height: 98 },
  }[size];

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 440 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform hover:scale-105 duration-200 shrink-0"
      >
        <defs>
          <linearGradient id="oziFrontGrad" x1="10%" y1="10%" x2="90%" y2="90%">
            <stop offset="0%" stopColor="#FF645A" />
            <stop offset="60%" stopColor="#FF5045" />
            <stop offset="100%" stopColor="#F03D31" />
          </linearGradient>

          <linearGradient id="ozi3DShadow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E24036" />
            <stop offset="100%" stopColor="#C92F26" />
          </linearGradient>

          <filter id="oziSubtleGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#FF5045" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* 3D Extrusion Depth / Bottom-Right Shadow & Tail */}
        <g filter="url(#oziSubtleGlow)">
          {/* Shadow & Tail Polygon */}
          <path
            d="M 330 65 
               L 375 90 
               C 395 105 408 128 408 155 
               L 408 175 
               L 435 228 
               L 368 200 
               C 340 215 295 218 250 215 
               L 180 215 
               C 95 215 50 180 40 145 
               L 65 195 
               C 105 232 200 235 270 215 
               L 360 208 
               L 435 228 
               L 408 175 
               C 410 135 390 100 355 75 Z"
            fill="url(#ozi3DShadow)"
          />

          {/* Corps principal de la bulle / Badge OZI Coral */}
          <path
            d="M 125 22
               C 56 22 2 76 2 145
               C 2 205 52 232 120 232
               C 172 232 215 205 240 175
               C 275 188 335 192 385 180
               C 400 176 405 160 405 142
               C 405 110 385 70 355 58
               L 355 45
               C 355 30 342 22 325 22
               C 310 22 300 30 300 45
               L 300 58
               C 275 52 245 52 220 58
               C 192 35 160 22 125 22 Z"
            fill="url(#oziFrontGrad)"
          />
        </g>

        {/* ========================================================= */}
        {/* LETTRE 'O' : CIBLE CONCENTRIQUE (Bullseye Rings) */}
        {/* ========================================================= */}
        {/* Anneau extérieur blanc */}
        <circle cx="120" cy="132" r="76" stroke="#FFFFFF" strokeWidth="17" />
        
        {/* Anneau intermédiaire blanc */}
        <circle cx="120" cy="132" r="44" stroke="#FFFFFF" strokeWidth="14" />
        
        {/* Centre de la cible (point rouge au centre entouré de blanc) */}
        <circle cx="120" cy="132" r="16" fill="#FFFFFF" />
        <circle cx="120" cy="132" r="9" fill="#FF5045" />

        {/* ========================================================= */}
        {/* LETTRE 'Z' : TRACÉ DYNAMIQUE COMICS BLANC */}
        {/* ========================================================= */}
        <path
          d="M 215 95 
             C 240 88 285 86 312 95 
             C 324 99 320 114 308 120 
             L 248 152 
             C 238 158 246 164 260 164 
             L 325 164 
             C 336 164 340 173 336 182 
             C 330 193 318 196 295 196 
             L 205 196 
             C 188 196 184 182 195 171 
             L 262 126 
             C 272 119 262 114 246 115 
             L 212 118 
             C 200 119 196 109 202 101 
             C 205 97 210 95 215 95 Z"
          fill="#FFFFFF"
        />

        {/* ========================================================= */}
        {/* LETTRE 'I' : BLANC VIF AVEC POINT DÉTACHÉ */}
        {/* ========================================================= */}
        {/* Point du 'i' (carré arrondi / pastille) */}
        <rect x="318" y="28" width="34" height="28" rx="8" fill="#FFFFFF" />

        {/* Fût du 'i' dynamique */}
        <path
          d="M 314 88 
             C 314 80 322 75 332 75 
             L 344 75 
             C 354 75 358 83 356 93 
             L 342 178 
             C 340 188 330 195 320 195 
             L 306 195 
             C 296 195 292 187 294 177 
             L 314 88 Z"
          fill="#FFFFFF"
        />
      </svg>

      {showText && (
        <span className="font-extrabold tracking-tight text-white font-['Outfit',sans-serif] text-base leading-none">
          OZI<span className="text-[#ff5a50] font-normal text-xs ml-1">Webtoon</span>
        </span>
      )}
    </div>
  );
};
