import { useRef, useEffect } from 'react';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';

interface EyeProps {
  mouseX: number;
  mouseY: number;
}

export function Eye({ mouseX, mouseY }: EyeProps) {
  const eyeRef = useRef<HTMLDivElement>(null);
  const pupilRef = useRef<HTMLDivElement>(null);
  const { orientation } = useDeviceOrientation();

  useEffect(() => {
    const eye = eyeRef.current;
    const pupil = pupilRef.current;
    if (!eye || !pupil) return;

    const rect = eye.getBoundingClientRect();
    const eyeCenterX = rect.left + rect.width / 2;
    const eyeCenterY = rect.top + rect.height / 2;

    // Calculate the angle between eye center and target position
    const dx = mouseX - eyeCenterX;
    const dy = mouseY - eyeCenterY;
    const angle = Math.atan2(dy, dx);

    // Calculate distance with a non-linear scaling factor
    // This makes the eye movement more pronounced when target is closer
    const distance = Math.hypot(dx, dy);
    const maxDistance = Math.min(window.innerWidth, window.innerHeight) / 2;
    const normalizedDistance = Math.min(distance / maxDistance, 1);
    
    // Apply non-linear scaling to make movement more natural
    // This creates a more dramatic effect when looking at extreme angles
    const scaledDistance = normalizedDistance ** 0.7; // Adjust power for different effects
    
    // Maximum radius the pupil can move from center (as percentage of eye size)
    const maxRadius = rect.width * 0.25; // 25% of eye width
    
    // Calculate final pupil position
    const moveDistance = maxRadius * scaledDistance;
    const x = Math.cos(angle) * moveDistance;
    const y = Math.sin(angle) * moveDistance;

    // Add slight delay for more natural movement
    pupil.style.transition = orientation ? 'transform 0.05s ease-out' : 'transform 0.15s ease-out';
    pupil.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
  }, [mouseX, mouseY, orientation]);

  return (
    <div ref={eyeRef} className="relative w-full pt-[100%]">
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="relative rounded-full bg-white shadow-lg overflow-hidden
                    border-2 sm:border-4 border-white/90 w-[95%] h-[95%]"
        >
          {/* Iris */}
          <div
            ref={pupilRef}
            className="absolute top-1/2 left-1/2 w-[45%] h-[45%] rounded-full bg-[#4169e1]"
          >
            {/* Pupil */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                          w-[45%] h-[45%] rounded-full bg-black" />
            {/* Light reflection */}
            <div className="absolute top-[15%] left-[15%] w-[25%] h-[25%] 
                          rounded-full bg-white/60" />
            {/* Inner shadow */}
            <div className="absolute inset-0 rounded-full shadow-[inset_0_0_10px_rgba(0,0,0,0.6)]" />
          </div>
          {/* Outer shadow */}
          <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]" />
        </div>
      </div>
    </div>
  );
} 