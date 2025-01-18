import { motion as framerMotion, AnimatePresence } from 'framer-motion';
import { useSettings } from '@/contexts/SettingsContext';
import { useState, useEffect } from 'react';
import { useMousePosition } from '@/hooks/useMousePosition';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';

interface WindowWithOrientation extends Window {
  DeviceOrientationEvent?: {
    requestPermission?: () => Promise<PermissionState>;
  };
  DeviceMotionEvent?: {
    requestPermission?: () => Promise<PermissionState>;
  };
}

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Add interface for webkit compass properties
interface DeviceOrientationEventWithWebkit extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
  webkitCompassAccuracy?: number;
}

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<'info' | 'settings'>('info');
  const mousePosition = useMousePosition();
  const { orientation, motion, error } = useDeviceOrientation();
  const [calculations, setCalculations] = useState({ dx: 0, dy: 0, angle: 0, distance: 0 });
  const [rawEvents, setRawEvents] = useState<{
    orientation: DeviceOrientationEvent | null;
    motion: DeviceMotionEvent | null;
  }>({ orientation: null, motion: null });

  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      setRawEvents(prev => ({ ...prev, orientation: e }));
    };
    const handleMotion = (e: DeviceMotionEvent) => {
      setRawEvents(prev => ({ ...prev, motion: e }));
    };

    window.addEventListener('deviceorientation', handleOrientation);
    window.addEventListener('devicemotion', handleMotion);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, []);

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
          <framerMotion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center"
          >
            <framerMotion.div
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
                          <h3 className="text-sm font-medium text-gray-300">Device Sensors</h3>
                          <span className={`text-xs px-2 py-1 rounded ${orientation || motion ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {orientation || motion ? 'Active' : 'Inactive'}
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
                            <span>Device Motion Support: </span>
                            <span className="text-white">{('DeviceMotionEvent' in window) ? 'Yes' : 'No'}</span>
                          </div>
                          <div>
                            <span>Has Permission API: </span>
                            <span className="text-white">
                              {typeof (window as WindowWithOrientation).DeviceOrientationEvent?.requestPermission === 'function' || 
                               typeof (window as WindowWithOrientation).DeviceMotionEvent?.requestPermission === 'function' ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div>
                            <span>Is Touch Device: </span>
                            <span className="text-white">{'ontouchstart' in window ? 'Yes' : 'No'}</span>
                          </div>
                        </div>

                        {/* Device Orientation */}
                        {orientation && (
                          <div className="space-y-2 border-t border-gray-600 mt-2 pt-2">
                            <h4 className="text-sm font-medium text-gray-300">Device Orientation</h4>
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
                          </div>
                        )}

                        {/* Device Motion */}
                        {motion && (
                          <div className="space-y-2 border-t border-gray-600 mt-2 pt-2">
                            <h4 className="text-sm font-medium text-gray-300">Device Motion</h4>
                            
                            {/* Acceleration */}
                            <div className="space-y-1">
                              <h5 className="text-xs text-gray-400">Acceleration (m/s²)</h5>
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-400">X:</span>
                                  <span className="ml-2 text-white">{motion.acceleration.x?.toFixed(2) ?? 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Y:</span>
                                  <span className="ml-2 text-white">{motion.acceleration.y?.toFixed(2) ?? 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Z:</span>
                                  <span className="ml-2 text-white">{motion.acceleration.z?.toFixed(2) ?? 'N/A'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Acceleration Including Gravity */}
                            <div className="space-y-1">
                              <h5 className="text-xs text-gray-400">Acceleration with Gravity (m/s²)</h5>
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-400">X:</span>
                                  <span className="ml-2 text-white">{motion.accelerationIncludingGravity.x?.toFixed(2) ?? 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Y:</span>
                                  <span className="ml-2 text-white">{motion.accelerationIncludingGravity.y?.toFixed(2) ?? 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Z:</span>
                                  <span className="ml-2 text-white">{motion.accelerationIncludingGravity.z?.toFixed(2) ?? 'N/A'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Rotation Rate */}
                            <div className="space-y-1">
                              <h5 className="text-xs text-gray-400">Rotation Rate (°/s)</h5>
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-400">α:</span>
                                  <span className="ml-2 text-white">{motion.rotationRate.alpha?.toFixed(2) ?? 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">β:</span>
                                  <span className="ml-2 text-white">{motion.rotationRate.beta?.toFixed(2) ?? 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">γ:</span>
                                  <span className="ml-2 text-white">{motion.rotationRate.gamma?.toFixed(2) ?? 'N/A'}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-xs">
                              <span className="text-gray-400">Update Interval:</span>
                              <span className="ml-2 text-white">{motion.interval}ms</span>
                            </div>
                          </div>
                        )}

                        {/* Raw Events Debug */}
                        <div className="space-y-2 border-t border-gray-600 mt-2 pt-2">
                          <h4 className="text-sm font-medium text-gray-300">Raw Events</h4>
                          
                          {/* Orientation Event */}
                          {rawEvents.orientation && (
                            <div className="space-y-1">
                              <h5 className="text-xs text-gray-400">Device Orientation Event</h5>
                              <div className="text-xs space-y-1">
                                <div>
                                  <span className="text-gray-400">absolute:</span>
                                  <span className="ml-2 text-white">{String(rawEvents.orientation.absolute)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">alpha:</span>
                                  <span className="ml-2 text-white">{rawEvents.orientation.alpha?.toFixed(2)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">beta:</span>
                                  <span className="ml-2 text-white">{rawEvents.orientation.beta?.toFixed(2)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">gamma:</span>
                                  <span className="ml-2 text-white">{rawEvents.orientation.gamma?.toFixed(2)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">webkitCompassHeading:</span>
                                  <span className="ml-2 text-white">
                                    {(rawEvents.orientation as DeviceOrientationEventWithWebkit).webkitCompassHeading?.toFixed(2) ?? 'N/A'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-400">webkitCompassAccuracy:</span>
                                  <span className="ml-2 text-white">
                                    {(rawEvents.orientation as DeviceOrientationEventWithWebkit).webkitCompassAccuracy ?? 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Motion Event */}
                          {rawEvents.motion && (
                            <div className="space-y-1 mt-2">
                              <h5 className="text-xs text-gray-400">Device Motion Event</h5>
                              <div className="text-xs space-y-1">
                                <div>
                                  <span className="text-gray-400">interval:</span>
                                  <span className="ml-2 text-white">{rawEvents.motion.interval}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">acceleration:</span>
                                  <span className="ml-2 text-white">
                                    x: {rawEvents.motion.acceleration?.x?.toFixed(2) ?? 'N/A'}, 
                                    y: {rawEvents.motion.acceleration?.y?.toFixed(2) ?? 'N/A'}, 
                                    z: {rawEvents.motion.acceleration?.z?.toFixed(2) ?? 'N/A'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-400">accelerationIncludingGravity:</span>
                                  <span className="ml-2 text-white">
                                    x: {rawEvents.motion.accelerationIncludingGravity?.x?.toFixed(2) ?? 'N/A'}, 
                                    y: {rawEvents.motion.accelerationIncludingGravity?.y?.toFixed(2) ?? 'N/A'}, 
                                    z: {rawEvents.motion.accelerationIncludingGravity?.z?.toFixed(2) ?? 'N/A'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-400">rotationRate:</span>
                                  <span className="ml-2 text-white">
                                    α: {rawEvents.motion.rotationRate?.alpha?.toFixed(2) ?? 'N/A'}, 
                                    β: {rawEvents.motion.rotationRate?.beta?.toFixed(2) ?? 'N/A'}, 
                                    γ: {rawEvents.motion.rotationRate?.gamma?.toFixed(2) ?? 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
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
            </framerMotion.div>
          </framerMotion.div>
        </>
      )}
    </AnimatePresence>
  );
} 