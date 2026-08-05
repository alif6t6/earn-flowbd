import React from 'react';

interface BrandLogoProps {
  className?: string;
  height?: number | string;
  variant?: 'dark' | 'light';
}

export default function BrandLogo({ className = '', height = 36, variant = 'dark' }: BrandLogoProps) {
  const textColor = variant === 'light' ? '#FFFFFF' : '#131313';

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 660 240" 
      className={className} 
      style={{ height, width: 'auto', display: 'inline-block' }}
    >
      <defs>
        <linearGradient id="ef-green-logo" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#16A34A"/>
          <stop offset="100%" stopColor="#4ADE80"/>
        </linearGradient>
      </defs>

      {/* icon badge */}
      <rect x="20" y="40" width="160" height="160" rx="36" fill="#131313"/>
      <rect x="56" y="122" width="20" height="40" rx="10" fill="url(#ef-green-logo)"/>
      <rect x="90" y="100" width="20" height="62" rx="10" fill="url(#ef-green-logo)"/>
      <rect x="124" y="78" width="20" height="84" rx="10" fill="url(#ef-green-logo)"/>

      {/* wordmark */}
      <text x="216" y="152" fontFamily="Poppins, system-ui, sans-serif" fontWeight="700" fontSize="88" fill={textColor}>
        Earn<tspan fill="url(#ef-green-logo)">Flow</tspan>
      </text>
    </svg>
  );
}
