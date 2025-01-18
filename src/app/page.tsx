'use client';

import { Eye } from '@/components/Eye/Eye';
import { InfoModal } from '@/components/InfoModal/InfoModal';
import { useMousePosition } from '@/hooks/useMousePosition';
import { useWindowSize } from '@/hooks/useWindowSize';
import { getGridConfig } from '@/utils/gridConfig';
import { useState, useRef, useEffect, useCallback } from 'react';

const INITIAL_EYES = 500;
const EYES_INCREMENT = 200;
const LOAD_THRESHOLD = 0.3;

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const mousePosition = useMousePosition();
  const windowSize = useWindowSize();
  const containerRef = useRef<HTMLDivElement>(null);
  const [totalEyes, setTotalEyes] = useState(INITIAL_EYES);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (scrollPercentage > (1 - LOAD_THRESHOLD) || distanceFromBottom < 1000) {
      setTotalEyes(prev => prev + EYES_INCREMENT);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const interval = setInterval(() => {
      handleScroll();
    }, 100);

    const scrollListener = () => {
      handleScroll();
    };

    container.addEventListener('scroll', scrollListener, { passive: true });
    
    return () => {
      clearInterval(interval);
      container.removeEventListener('scroll', scrollListener);
    };
  }, [handleScroll]);

  if (!windowSize.width || !windowSize.height) {
    return null;
  }

  const { cols } = getGridConfig(windowSize);

  return (
    <main className="min-h-screen bg-[#111827] overflow-hidden touch-none">
      <div 
        ref={containerRef}
        className="fixed inset-0 grid auto-rows-max gap-1 sm:gap-2 md:gap-4 lg:gap-6 overflow-auto 
                  scroll-smooth overscroll-none will-change-scroll"
        style={{ 
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
        }}
      >
        {Array.from({ length: totalEyes }).map((_, i) => {
          const eyeId = `eye-${Math.floor(i / cols)}-${i % cols}`;
          return (
            <Eye 
              key={eyeId}
              mouseX={mousePosition.x} 
              mouseY={mousePosition.y}
            />
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="fixed right-4 bottom-4 w-8 h-8 rounded-full bg-white shadow-lg overflow-hidden
                 border-2 border-white/90 hover:scale-110 transition-transform z-30
                 flex items-center justify-center group"
      >
        <div className="relative w-[80%] h-[80%] rounded-full bg-red-500">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                        w-[45%] h-[45%] rounded-full bg-black group-hover:scale-110 transition-transform" />
          <div className="absolute top-[15%] left-[15%] w-[25%] h-[25%] 
                        rounded-full bg-white/60 group-hover:scale-110 transition-transform" />
        </div>
      </button>

      <InfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}
