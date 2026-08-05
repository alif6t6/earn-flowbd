import React, { useRef, useState, useEffect, useMemo, memo } from 'react';

export interface AdRendererProps {
  content?: string;
  type?: string;
  imageUrl?: string;
  destinationUrl?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  adRatio?: string;
  className?: string;
}

const AdRenderer = memo(function AdRenderer({
  content = '',
  type,
  imageUrl,
  destinationUrl,
  title,
  description,
  buttonText,
  adRatio = 'horizontal',
  className = ''
}: AdRendererProps) {
  const trimmed = (content || '').trim();
  const isDirectUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://');
  const targetLink = destinationUrl || (isDirectUrl ? trimmed : '');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // 1. High-Quality Custom Image Banner Ad
  if (imageUrl) {
    return (
      <div className={`relative w-full overflow-hidden rounded-xl bg-transparent flex items-center justify-center mx-auto ${className}`}>
        <a href={targetLink || '#'} target={targetLink ? "_blank" : "_self"} rel="noopener noreferrer" className="block w-full h-full group">
          <img src={imageUrl} alt={title || "Advertisement"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          <span className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider rounded z-10">Ad</span>
        </a>
      </div>
    );
  }

  // 2. Direct Link Ad
  if (isDirectUrl) {
    return (
      <div className={`relative w-full overflow-hidden flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 mx-auto min-h-[90px] ${className}`}>
        <a href={trimmed} target="_blank" rel="noopener noreferrer" className="w-full h-full flex flex-col items-center justify-center gap-2 text-white font-black hover:scale-[1.02] active:scale-95 transition-transform px-4 text-center">
          <span className="text-sm md:text-base drop-shadow-sm">⚡ Open Direct Link Banner</span>
        </a>
        <span className="absolute top-2 right-2 px-2 py-0.5 bg-black/40 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider rounded pointer-events-none">Ad</span>
      </div>
    );
  }

  if (!trimmed) return null;

  // 3. Raw Script / HTML (e.g. Adsterra / Google)
  
  // Parse dimensions from raw ad script to auto-scale on mobile
  let w = 320;
  let h = 50;
  
  const widthMatch = trimmed.match(/['"]?width['"]?\s*[:=]\s*['"]?(\d+)['"]?/i);
  const heightMatch = trimmed.match(/['"]?height['"]?\s*[:=]\s*['"]?(\d+)['"]?/i);
  
  if (widthMatch && widthMatch[1]) w = parseInt(widthMatch[1], 10);
  if (heightMatch && heightMatch[1]) h = parseInt(heightMatch[1], 10);

  // specific overrides for common adsterra formats if not parsed correctly
  if (trimmed.includes('728') && trimmed.includes('90')) { w = 728; h = 90; }
  else if (trimmed.includes('300') && trimmed.includes('250')) { w = 300; h = 250; }
  else if (trimmed.includes('160') && trimmed.includes('600')) { w = 160; h = 600; }
  else if (trimmed.includes('468') && trimmed.includes('60')) { w = 468; h = 60; }
  else if (trimmed.includes('320') && trimmed.includes('50')) { w = 320; h = 50; }

  // We use useMemo to avoid recreating the iframe content on every render
  const iframeHtml = useMemo(() => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <script>
          window.onerror = function() { return true; };
          window.addEventListener('error', function(e) { e.preventDefault(); e.stopImmediatePropagation(); }, true);
          window.addEventListener('unhandledrejection', function(e) { e.preventDefault(); });
        </script>
        <style>
          body, html { 
             margin: 0 !important; 
             padding: 0 !important; 
             background: transparent !important;
             display: flex;
             justify-content: center;
             align-items: center;
             overflow: hidden !important;
             width: 100vw;
             height: 100vh;
          }
          div {
             display: flex;
             justify-content: center;
             align-items: center;
          }
        </style>
      </head>
      <body>
        ${trimmed}
      </body>
    </html>
  `, [trimmed]);

  // Make the ad perfectly responsive on all devices (especially mobile)
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const containerWidth = entry.contentRect.width;
        if (containerWidth < w && containerWidth > 0) {
          // Scale down to fit the screen width perfectly
          setScale(containerWidth / w);
        } else {
          // Normal size on PC/Laptop
          setScale(1);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [w]);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full flex items-center justify-center bg-transparent mx-auto overflow-hidden ${className}`} 
      style={{ height: Math.max(h * scale, 50) }}
    >
      <div 
        style={{
          width: `${w}px`,
          height: `${h}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }} 
        className="flex-shrink-0 flex items-center justify-center relative"
      >
        <iframe
          srcDoc={iframeHtml}
          style={{ width: '100%', height: '100%', border: 'none', background: 'transparent' }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
          scrolling="no"
          loading="lazy"
          title="Advertisement"
        />
        <span className="absolute top-0 right-0 px-1 py-0.5 bg-black/10 text-[8px] font-bold text-slate-400 uppercase rounded-bl pointer-events-none z-10" style={{ transform: `scale(${1/scale})`, transformOrigin: 'top right' }}>
          Ad
        </span>
      </div>
    </div>
  );
});

export default AdRenderer;
