import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
  isMobile: boolean;
}

export function useWindowSize(mobileBreakpoint = 768): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 0,
    height: 0,
    isMobile: false,
  });

  useEffect(() => {
    const updateWindowSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setWindowSize({
        width,
        height,
        isMobile: width < mobileBreakpoint,
      });
    };

    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    
    return () => window.removeEventListener('resize', updateWindowSize);
  }, [mobileBreakpoint]);

  return windowSize;
} 