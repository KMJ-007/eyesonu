interface WindowSize {
  width: number | null;
  height: number | null;
  isMobile: boolean;
}

export function getGridConfig(windowSize: WindowSize) {
  const { width } = windowSize;
  if (!width) return { cols: 0 };

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

  return { cols };
} 