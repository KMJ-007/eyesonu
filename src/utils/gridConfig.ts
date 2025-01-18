interface WindowSize {
  width: number | null;
  height: number | null;
  isMobile: boolean;
}

export function getGridConfig(windowSize: WindowSize, targetEyeCount: number = 35) {
  const { width, height } = windowSize;
  if (!width || !height) return { cols: 0, total: 0 };

  // Calculate the best number of columns based on screen width
  let cols: number;
  if (width < 640) { // mobile
    cols = 4;
  } else if (width < 1024) { // tablet
    cols = 5;
  } else if (width < 1280) { // small desktop
    cols = 6;
  } else { // large desktop
    cols = 7;
  }

  // Calculate the size of each eye (including gap)
  const gap = width < 640 ? 4 : width < 768 ? 8 : width < 1024 ? 16 : 24; // gap in pixels
  const eyeSize = (width / cols) - gap;
  
  // Calculate how many rows fit perfectly in the viewport
  const perfectRows = Math.floor(height / (eyeSize + gap));
  
  // Calculate total eyes needed for perfect grid
  const perfectTotal = cols * perfectRows;
  
  // Use the larger of perfectTotal or targetEyeCount to ensure we have at least enough eyes
  // for endless scrolling while starting with a perfect grid
  const total = Math.max(perfectTotal, targetEyeCount);

  return { cols, total };
} 