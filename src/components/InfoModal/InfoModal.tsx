import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '@/contexts/SettingsContext';
import { useState } from 'react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<'info' | 'settings'>('info');

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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md 
                     max-h-[85vh] flex flex-col bg-[#1F2937] rounded-2xl shadow-2xl z-50 text-gray-100"
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

            <div className="p-6 pt-2">
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