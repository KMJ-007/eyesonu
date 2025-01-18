import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '@/contexts/SettingsContext';
import { useState, useEffect } from 'react';
import { useMousePosition } from '@/hooks/useMousePosition';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<'info' | 'settings'>('info');
  const mousePosition = useMousePosition();
  const [calculations, setCalculations] = useState({ dx: 0, dy: 0, angle: 0, distance: 0 });

  useEffect(() => {
    // Calculate relative to center of viewport
    const dx = mousePosition.x - window.innerWidth / 2;
    const dy = mousePosition.y - window.innerHeight / 2;
    const angle = Math.atan2(dy, dx);
    const distance = Math.hypot(dx, dy);

    setCalculations({
      dx: Math.round(dx),
      dy: Math.round(dy),
      angle: Math.round((angle * 180) / Math.PI),
      distance: Math.round(distance),
    });
  }, [mousePosition]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed left-1/2 top-[10vh] -translate-x-1/2 w-[90%] max-w-md 
                     bg-[#1F2937] rounded-2xl shadow-2xl z-50 text-gray-100 overflow-hidden
                     flex flex-col max-h-[80vh]"
          >
            {/* Tabs */}
            <div className="flex space-x-4 p-6 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'info'
                    ? 'bg-[#374151] text-white'
                    : 'text-gray-400 hover:bg-[#374151]/50'
                }`}
              >
                Info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-[#374151] text-white'
                    : 'text-gray-400 hover:bg-[#374151]/50'
                }`}
              >
                Settings
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {activeTab === 'info' ? (
                <>
                  <h2 className="text-2xl font-bold mb-4 text-white">Eyes On U 👀</h2>
                  <p className="text-gray-300 mb-4">
                    An interactive art piece where multiple eyes follow your cursor or touch movement.
                    Each eye tracks independently, creating an immersive and slightly unsettling experience.
                  </p>
                  <div className="text-sm text-gray-400">
                    <p>Built with:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Next.js & React</li>
                      <li>Framer Motion</li>
                      <li>Tailwind CSS</li>
                    </ul>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">Settings</h2>
                  
                  <div className="space-y-6">
                    {/* Eye tracking calculations */}
                    <div className="bg-[#374151] p-4 rounded-lg space-y-2">
                      <h3 className="text-sm font-medium text-gray-300">Eye Tracking Calculations</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-400">dx:</span>
                          <span className="ml-2 text-white">{calculations.dx}px</span>
                        </div>
                        <div>
                          <span className="text-gray-400">dy:</span>
                          <span className="ml-2 text-white">{calculations.dy}px</span>
                        </div>
                        <div>
                          <span className="text-gray-400">angle:</span>
                          <span className="ml-2 text-white">{calculations.angle}°</span>
                        </div>
                        <div>
                          <span className="text-gray-400">distance:</span>
                          <span className="ml-2 text-white">{calculations.distance}px</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Eye Scale: {settings.eyeScale}%
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={settings.eyeScale}
                        onChange={(e) => updateSettings({ eyeScale: parseInt(e.target.value) })}
                        className="w-full accent-blue-500 bg-[#374151] h-2 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Movement Damping: {settings.damping}
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="30"
                        value={settings.damping}
                        onChange={(e) => updateSettings({ damping: parseInt(e.target.value) })}
                        className="w-full accent-blue-500 bg-[#374151] h-2 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Movement Stiffness: {settings.stiffness}
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="300"
                        value={settings.stiffness}
                        onChange={(e) => updateSettings({ stiffness: parseInt(e.target.value) })}
                        className="w-full accent-blue-500 bg-[#374151] h-2 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Max Movement Scale: {settings.maxMoveScale.toFixed(2)}
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="25"
                        value={settings.maxMoveScale * 100}
                        onChange={(e) => updateSettings({ maxMoveScale: parseInt(e.target.value) / 100 })}
                        className="w-full accent-blue-500 bg-[#374151] h-2 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 pt-2 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="w-full px-4 py-2 bg-[#374151] text-white rounded-lg 
                         hover:bg-[#4B5563] transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 