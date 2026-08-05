import React from 'react';

interface BrandIconProps {
  className?: string;
  size?: number | string;
}

export default function BrandIcon({ className = '', size = 36 }: BrandIconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 512 512" 
      className={className} 
      style={{ width: size, height: size, display: 'inline-block' }}
    >
      <defs>
        <linearGradient id="ef-green-icon" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#16A34A"/>
          <stop offset="100%" stopColor="#4ADE80"/>
        </linearGradient>
      </defs>

      {/* badge */}
      <rect width="512" height="512" rx="115" fill="#131313"/>

      {/* ascending bars: earnings / flow growing upward */}
      <rect x="117" y="261" width="66" height="130" rx="33" fill="url(#ef-green-icon)"/>
      <rect x="223" y="191" width="66" height="200" rx="33" fill="url(#ef-green-icon)"/>
      <rect x="329" y="121" width="66" height="270" rx="33" fill="url(#ef-green-icon)"/>
    </svg>
  );
}
