import { useRef, useEffect } from 'react';

interface EyeProps {
  mouseX: number;
  mouseY: number;
}

export function Eye({ mouseX, mouseY }: EyeProps) {
  const eyeRef = useRef<HTMLDivElement>(null);
  const pupilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const eye = eyeRef.current;
    const pupil = pupilRef.current;
    if (!eye || !pupil) return;

    const rect = eye.getBoundingClientRect();
    const eyeCenterX = rect.left + rect.width / 2;
    const eyeCenterY = rect.top + rect.height / 2;

    const radian = Math.atan2(mouseY - eyeCenterY, mouseX - eyeCenterX);
    const maxDistance = rect.width * 0.08;

    const distance = Math.min(
      Math.hypot(mouseX - eyeCenterX, mouseY - eyeCenterY) * 0.15,
      maxDistance
    );

    const pupilX = Math.cos(radian) * distance;
    const pupilY = Math.sin(radian) * distance;

    pupil.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
  }, [mouseX, mouseY]);

  return (
    <div ref={eyeRef} className="relative w-full pt-[100%]">
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="relative rounded-full bg-white shadow-lg overflow-hidden
                    border-2 sm:border-4 border-white/90 w-[95%] h-[95%]"
        >
          <div
            ref={pupilRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                     w-[45%] h-[45%] rounded-full bg-[#4169e1]"
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