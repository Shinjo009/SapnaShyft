import { useState, useEffect, useRef } from 'react';
import triangleImg from '../../images/triangle.png';

const SpinningTriangle = ({ onWordIndex, totalWords, activeIndex, onAnimationComplete }) => {
  const [rotation, setRotation] = useState(0);
  const [smoothY, setSmoothY] = useState(0);
  const [animationFinished, setAnimationFinished] = useState(false);

  const animationRef = useRef();
  const startTimeRef = useRef();

  const ROTATION_DURATION = 2500;
  const WORD_HEIGHT = 57;
  const SMOOTHING = 0.08;
  const OFFSET = 1;

  useEffect(() => {
    const animate = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      
      // Stop animation after one complete rotation
      if (elapsed >= ROTATION_DURATION) {
        const lastIndex = totalWords - 1;
        const lastY = lastIndex * WORD_HEIGHT;
        setSmoothY(lastY);
        setRotation(360);
        if (!animationFinished) {
          setAnimationFinished(true);
          onAnimationComplete?.();
        }
        return;
      }

      const currentRotation = (elapsed / ROTATION_DURATION) * 360;
      const normalizedRotation = currentRotation % 360;

      setRotation(normalizedRotation);

      const targetIndex =
        Math.floor(normalizedRotation / (360 / totalWords)) % totalWords;
      onWordIndex(targetIndex);

      const targetY = targetIndex * WORD_HEIGHT;
      setSmoothY((prev) => prev + (targetY - prev) * SMOOTHING);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [onWordIndex, totalWords]);

  return (
    <div
      style={{
        position: 'absolute',
        left: '-80px',
        width: '256px',
        height: '256px',
        zIndex: 10,
        top: 0,
        transform: `translateY(${smoothY + OFFSET}px) rotate(${rotation}deg)`,
        transformOrigin: 'center center',
        transition: 'transform 0.05s linear',
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
