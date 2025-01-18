import { useRef, useEffect } from 'react';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';

interface EyeProps {
  mouseX: number;
  mouseY: number;
}

export function Eye({ mouseX, mouseY }: EyeProps) {
  const eyeRef = useRef<HTMLDivElement>(null);
  const pupilRef = useRef<HTMLDivElement>(null);
  const { orientation, motion } = useDeviceOrientation();

  useEffect(() => {
    const eye = eyeRef.current;
    const pupil = pupilRef.current;
    if (!eye || !pupil) return;

    const rect = eye.getBoundingClientRect();
    const eyeCenterX = rect.left + rect.width / 2;
    const eyeCenterY = rect.top + rect.height / 2;

    let dx = mouseX - eyeCenterX;
    let dy = mouseY - eyeCenterY;

    // Use device orientation if available
    if (orientation) {
      // Convert orientation angles to movement
      const beta = orientation.beta ?? 0; // Front/back tilt [-180, 180]
      const gamma = orientation.gamma ?? 0; // Left/right tilt [-90, 90]
      
      // Scale the tilt angles to pixel movement
      // We use gamma for x movement and beta for y movement
      const tiltScale = rect.width * 0.15; // Adjust this value to control sensitivity
      dx = (gamma / 90) * tiltScale;
      dy = (beta / 180) * tiltScale;
    }

    // Use device motion if available for more responsive movement
    if (motion?.accelerationIncludingGravity) {
      const { x, y } = motion.accelerationIncludingGravity;
      if (x !== null && y !== null) {
        // Scale acceleration to pixel movement
        const accelScale = rect.width * 0.05; // Adjust this value to control sensitivity
        dx -= x * accelScale;
        dy += y * accelScale;
      }
    }

    const angle = Math.atan2(dy, dx);
    const maxRadius = rect.width * 0.2;
    const distance = Math.min(Math.hypot(dx, dy) * 0.15, maxRadius);

    // Calculate new position
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    // Apply the transform from the center with smooth transition
    pupil.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    pupil.style.transition = 'transform 0.1s ease-out';
  }, [mouseX, mouseY, orientation, motion]);

  return (
    <div ref={eyeRef} className="relative w-full pt-[100%]">
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="relative rounded-full bg-white shadow-lg overflow-hidden
                    border-2 sm:border-4 border-white/90 w-[95%] h-[95%]"
        >
          <div
            ref={pupilRef}
            className="absolute top-1/2 left-1/2 w-[45%] h-[45%] rounded-full bg-[#4169e1]"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45%] h-[45%] rounded-full bg-black" />
            <div className="absolute top-[15%] left-[15%] w-[25%] h-[25%] rounded-full bg-white/60" />
            <div className="absolute inset-0 rounded-full shadow-[inset_0_0_10px_rgba(0,0,0,0.6)]" />
          </div>
          <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]" />
        </div>
      </div>
    </div>
  );
} 