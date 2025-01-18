'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform, MotionValue, AnimatePresence } from 'framer-motion';

function InfoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md 
                     bg-white dark:bg-gray-800 rounded-xl p-6 shadow-2xl z-50"
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Eyes On U 👀</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              An interactive art piece where multiple eyes follow your cursor or touch movement.
              Each eye tracks independently, creating an immersive and slightly unsettling experience.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Built with:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Next.js & React</li>
                <li>Framer Motion</li>
                <li>Tailwind CSS</li>
              </ul>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg 
                       hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const springConfig = { damping: 15, stiffness: 150 };
  
  const mouseX = useSpring(mousePosition.x, springConfig);
  const mouseY = useSpring(mousePosition.y, springConfig);

  useEffect(() => {
    const updateWindowSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setWindowSize({ width, height });
      setIsMobile(width < 768); // Update mobile state
    };

    updateWindowSize();

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        setMousePosition({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('resize', updateWindowSize);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', updateWindowSize);
    };
  }, []);

  if (!windowSize.width || !windowSize.height) {
    return null;
  }

  // Calculate number of eyes based on screen size
  const getGridConfig = () => {
    if (windowSize.width < 480) return { cols: 3, total: 15 };
    if (windowSize.width < 768) return { cols: 4, total: 20 };
    if (windowSize.width < 1024) return { cols: 5, total: 25 };
    return { cols: 7, total: 35 };
  };

  const { cols, total } = getGridConfig();

  return (
    <main className="min-h-screen bg-[#111827] overflow-hidden touch-none">
      <div 
        className="fixed inset-0 p-4 sm:p-6 md:p-8 lg:p-12 grid gap-2 sm:gap-4 md:gap-6 lg:gap-8"
        style={{ 
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          aspectRatio: isMobile ? 'auto' : '16/9',
          maxHeight: isMobile ? '100vh' : 'none'
        }}
      >
        {Array.from({ length: total }).map((_, i) => (
          <Eye 
            key={`eye-${i}`} 
            mouseX={mouseX} 
            mouseY={mouseY}
            isMobile={isMobile}
          />
        ))}
      </div>

      {/* Floating Info Button */}
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

interface EyeProps {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  isMobile: boolean;
}

function Eye({ mouseX, mouseY, isMobile }: EyeProps) {
  const eyeRef = useRef<HTMLDivElement>(null);
  const [eyeRect, setEyeRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!eyeRef.current) return;
    const updateEyeRect = () => {
      setEyeRect(eyeRef.current?.getBoundingClientRect() || null);
    };
    
    updateEyeRect();
    const observer = new ResizeObserver(updateEyeRect);
    observer.observe(eyeRef.current);
    
    return () => observer.disconnect();
  }, []);

  const getOffset = (mousePos: number, eyePos: number, eyeSize: number) => {
    const delta = mousePos - (eyePos + eyeSize / 2);
    const maxMove = eyeSize * (isMobile ? 0.1 : 0.15); // Reduced movement on mobile
    return Math.max(Math.min(delta * 0.2, maxMove), -maxMove);
  };

  const x = useTransform(mouseX, (latestX) => {
    if (!eyeRect) return 0;
    return getOffset(latestX, eyeRect.left, eyeRect.width);
  });

  const y = useTransform(mouseY, (latestY) => {
    if (!eyeRect) return 0;
    return getOffset(latestY, eyeRect.top, eyeRect.height);
  });
  console.log({x,y})
  return (
    <div ref={eyeRef} className="relative w-full pt-[100%]">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[85%] h-[85%] rounded-full bg-white shadow-lg overflow-hidden
                      border-2 sm:border-4 border-white/90">
          <motion.div
            className="absolute w-[45%] h-[45%] rounded-full bg-[#4169e1]"
            style={{
              top: '50%',
              left: '50%',
              x,
              y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45%] h-[45%] rounded-full bg-black" />
            <div className="absolute top-[15%] left-[15%] w-[25%] h-[25%] rounded-full bg-white/60" />
            <div className="absolute inset-0 rounded-full shadow-[inset_0_0_10px_rgba(0,0,0,0.6)]" />
          </motion.div>
          <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]" />
        </div>
      </div>
    </div>
  );
}
