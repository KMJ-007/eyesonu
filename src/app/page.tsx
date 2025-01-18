'use client';

import { Eye } from '@/components/Eye/Eye';
import { InfoModal } from '@/components/InfoModal/InfoModal';
import { useMousePosition } from '@/hooks/useMousePosition';
import { useWindowSize } from '@/hooks/useWindowSize';
import { getGridConfig } from '@/utils/gridConfig';
import { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { settings } = useSettings();
  const { mouseX, mouseY } = useMousePosition({ 
    damping: settings.damping, 
    stiffness: settings.stiffness 
  });
  const windowSize = useWindowSize();

  if (!windowSize.width || !windowSize.height) {
    return null;
  }

  const { cols, total } = getGridConfig(windowSize, settings.eyeCount);

  return (
    <main className="min-h-screen bg-[#111827] overflow-hidden touch-none">
      <div 
        className="fixed inset-0 grid auto-rows-max gap-1 sm:gap-2 md:gap-4 lg:gap-6 overflow-auto"
        style={{ 
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
        }}
      >
        {Array.from({ length: total }).map((_, i) => (
          <Eye 
            key={`eye-position-${i}`} 
            mouseX={mouseX} 
            mouseY={mouseY}
            isMobile={windowSize.isMobile}
            scale={settings.eyeScale}
            maxMoveScale={settings.maxMoveScale}
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
