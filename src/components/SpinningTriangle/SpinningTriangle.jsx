import { useEffect, useRef } from 'react';
import triangleImg from '../../images/triangle.png';

const SpinningTriangle = ({
  onWordIndex,
  totalWords,
  onAnimationComplete,
  wordStep = 57,
  width = 162.684,
  height = 140.889,
  leftOffset = -100,
}) => {
  const triangleRef = useRef(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const animationFinishedRef = useRef(false);
  const lastWordIndexRef = useRef(-1);

  const ROTATION_DURATION = 2300;
  const START_OFFSET = -45;

  useEffect(() => {
    const triangleElement = triangleRef.current;

    if (!triangleElement) {
      return undefined;
    }

    // Reset animation state each mount/run.
    startTimeRef.current = null;
    animationFinishedRef.current = false;
    lastWordIndexRef.current = -1;
    triangleElement.style.opacity = '1';
    triangleElement.style.transform = `translateY(${START_OFFSET}px) rotate(0deg)`;

    const animate = (timestamp) => {
      if (animationFinishedRef.current) {
        return;
      }

      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / ROTATION_DURATION, 1);

      const currentRotation = progress * 360;
      const normalizedRotation = currentRotation % 360;
      const positionY = progress * Math.max(totalWords - 1, 0) * wordStep;

      // Keep the triangle on a smooth, straight downward path while spinning.
      triangleElement.style.transform = `translateY(${positionY + START_OFFSET}px) rotate(${normalizedRotation}deg)`;

      const targetIndex =
        Math.floor(normalizedRotation / (360 / totalWords)) % totalWords;

      if (targetIndex !== lastWordIndexRef.current) {
        lastWordIndexRef.current = targetIndex;
        onWordIndex(targetIndex);
      }

      if (progress >= 1) {
        animationFinishedRef.current = true;
        triangleElement.style.opacity = '0';
        onWordIndex(null);
        onAnimationComplete?.();
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [onAnimationComplete, onWordIndex, totalWords, wordStep]);

  return (
    <div
      ref={triangleRef}
      style={{
        position: 'absolute',
        left: `${leftOffset}px`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex: 15,
        top: 0,
        transformOrigin: 'center center',
        transition: 'opacity 0.16s ease-out',
        pointerEvents: 'none',
        willChange: 'transform, opacity',
      }}
    >
      <img
        src={triangleImg}
        alt="Rotating triangle"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  );
};

export default SpinningTriangle;
