import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '@/contexts/SettingsContext';
import { useState, useEffect } from 'react';
import { useMousePosition } from '@/hooks/useMousePosition';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';

interface WindowWithOrientation extends Window {
  DeviceOrientationEvent?: {
    requestPermission?: () => Promise<PermissionState>;
  };
}

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<'info' | 'settings'>('info');
  const mousePosition = useMousePosition();
  const { orientation, error } = useDeviceOrientation();
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-[95%] max-w-lg bg-[#1F2937] rounded-2xl shadow-2xl z-50 text-gray-100 
                       overflow-hidden flex flex-col max-h-[80vh]"
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
                    <h2 className="text-2xl font-bold mb-4 text-white">The Universal Feeling of Being Watched: A Reflection of Our Existence</h2>
                    <p className="text-gray-300 mb-4">
                      In a world where we&apos;re constantly being observed, judged, and influenced, the feeling of being watched is a universal phenomenon that transcends cultures and boundaries. It&apos;s a sensation that can evoke feelings of comfort, anxiety, or even paranoia. This piece is an exploration of that feeling, a reflection of our existence in a world where we&apos;re always being seen.
                    </p>
                    <p className="text-gray-300 mb-6">
                      As you move through this space, hundreds of eyes follow your every move – just like the countless 
                      invisible gazes we navigate daily. Some days we crave this attention, other days we wish we could 
                      just... disappear.
                    </p>
                    <div className="text-sm text-gray-400">
                      <p className="mb-2">Created by <a href="https://karanjanthe.me" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Karan Janthe</a></p>
                      <p className="mb-2">GitHub: <a href="https://github.com/KMJ-007/eyesonu" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">eyesonu</a></p>
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white">Settings</h2>
                    
                    <div className="space-y-6">
                      {/* Gyroscope Status */}
                      <div className="bg-[#374151] p-4 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-300">Gyroscope</h3>
                          <span className={`text-xs px-2 py-1 rounded ${orientation ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {orientation ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {error && (
                          <p className="text-xs text-red-400">{error.message}</p>
                        )}
                        {/* Debug Info */}
                        <div className="text-xs text-gray-400 space-y-1 border-t border-gray-600 mt-2 pt-2">
                          <div>
                            <span>Device Orientation Support: </span>
                            <span className="text-white">{('DeviceOrientationEvent' in window) ? 'Yes' : 'No'}</span>
                          </div>
                          <div>
                            <span>Has Permission API: </span>
                            <span className="text-white">
                              {typeof (window as WindowWithOrientation).DeviceOrientationEvent?.requestPermission === 'function' ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div>
                            <span>Is Touch Device: </span>
                            <span className="text-white">{'ontouchstart' in window ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                        {orientation && (
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="text-gray-400">α (alpha):</span>
                              <span className="ml-2 text-white">{orientation.alpha?.toFixed(1)}°</span>
                            </div>
                            <div>
                              <span className="text-gray-400">β (beta):</span>
                              <span className="ml-2 text-white">{orientation.beta?.toFixed(1)}°</span>
                            </div>
                            <div>
                              <span className="text-gray-400">γ (gamma):</span>
                              <span className="ml-2 text-white">{orientation.gamma?.toFixed(1)}°</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Mouse/Gyro Position Debug */}
                      <div className="bg-[#374151] p-4 rounded-lg space-y-2">
                        <h3 className="text-sm font-medium text-gray-300">Position Debug</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400">Mouse X:</span>
                            <span className="ml-2 text-white">{Math.round(mousePosition.x)}px</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Mouse Y:</span>
                            <span className="ml-2 text-white">{Math.round(mousePosition.y)}px</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Window Width:</span>
                            <span className="ml-2 text-white">{window.innerWidth}px</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Window Height:</span>
                            <span className="ml-2 text-white">{window.innerHeight}px</span>
                          </div>
                        </div>
                      </div>

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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 