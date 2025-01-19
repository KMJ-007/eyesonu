'use client';

import { Eye } from '@/components/Eye/Eye';
import { InfoModal } from '@/components/InfoModal/InfoModal';
import { useMousePosition } from '@/hooks/useMousePosition';
import { useWindowSize } from '@/hooks/useWindowSize';
import { getGridConfig } from '@/utils/gridConfig';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';
import { useWebcamTracking } from '@/hooks/useWebcamTracking';

const INITIAL_EYES = 500;
const EYES_INCREMENT = 200;
const LOAD_THRESHOLD = 0.3;

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const mousePosition = useMousePosition();
  const windowSize = useWindowSize();
  const containerRef = useRef<HTMLDivElement>(null);
  const [totalEyes, setTotalEyes] = useState(INITIAL_EYES);
  const { orientation, requestAccess: requestGyroAccess } = useDeviceOrientation();
  const [isGyroAvailable, setIsGyroAvailable] = useState(false);
  const { position: webcamPosition, isEnabled: isWebcamEnabled, initializeWebcam } = useWebcamTracking();
  const hasInitializedRef = useRef(false);

  // Auto-initialize webcam only once on mount
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      // Small delay to avoid immediate permission popup
      const timer = setTimeout(() => {
        initializeWebcam();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [initializeWebcam]);

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window;
    setIsGyroAvailable(isTouchDevice);
    
    // Auto-request gyro access on touch devices
    if (isTouchDevice && !orientation) {
      requestGyroAccess();
    }
  }, [orientation, requestGyroAccess]);

  // Determine tracking position based on priority
  const trackingPosition = useMemo(() => {
    if (!windowSize.width || !windowSize.height) {
      return mousePosition;
    }

    if (isWebcamEnabled && webcamPosition) {
      return webcamPosition;
    }
    if (isGyroAvailable && orientation) {
      // Convert orientation to screen coordinates with clamping
      const x = Math.min(Math.max((orientation.gamma || 0) / 90 * windowSize.width + windowSize.width / 2, 0), windowSize.width);
      const y = Math.min(Math.max((orientation.beta || 0) / 90 * windowSize.height + windowSize.height / 2, 0), windowSize.height);
      return { x, y };
    }
    return mousePosition;
  }, [isWebcamEnabled, webcamPosition, isGyroAvailable, orientation, mousePosition, windowSize]);

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
              mouseX={trackingPosition.x} 
              mouseY={trackingPosition.y}
            />
          );
        })}
      </div>

      <div className="fixed left-4 bottom-4 flex gap-2 z-30">
        {/* Webcam button */}
        <button
          type="button"
          className={`w-8 h-8 rounded-full shadow-lg overflow-hidden
                   border-2 border-white/90 hover:scale-110 transition-transform
                   flex items-center justify-center ${isWebcamEnabled ? 'bg-green-500 text-white' : 'bg-white text-gray-700'}`}
          onClick={() => {
            if (hasInitializedRef.current) {
              initializeWebcam();
            }
          }}
          title={isWebcamEnabled ? 'Click to disable webcam tracking (Priority 1)' : 'Enable webcam tracking (Priority 1)'}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="w-5 h-5"
            aria-label="Webcam icon"
            role="img"
          >
            <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z" />
          </svg>
        </button>

        {/* Gyroscope button */}
        {isGyroAvailable && (
          <button
            type="button"
            className={`w-8 h-8 rounded-full shadow-lg overflow-hidden
                     border-2 border-white/90 hover:scale-110 transition-transform
                     flex items-center justify-center ${orientation ? 'bg-green-500 text-white' : 'bg-white text-gray-700'}`}
            onClick={requestGyroAccess}
            title={orientation ? 'Gyroscope active (Priority 2)' : 'Click to enable gyroscope (Priority 2)'}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-5 h-5"
              aria-label="Gyroscope icon"
              role="img"
            >
              <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
              <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3h-15a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0zm12-1.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
          </button>
        )}
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
