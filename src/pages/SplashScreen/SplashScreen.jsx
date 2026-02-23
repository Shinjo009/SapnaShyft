import { useState, useCallback } from 'react';
import SpinningTriangle from '../../components/SpinningTriangle';
import WordList from '../../components/WordList';
import './SplashScreen.css';

const words = [
  'Prevention',
  'Precision',
  'Nutrition',
  'Age Reversal',
  'Longevity',
  'Community',
  'Bio-AI',
  'Mindfulness',
  'Progress',
  'Personalized',
  'Holistic',
  'Performance',
];

const SplashScreen = ({ onComplete }) => {
  const [activeWordIndex, setActiveWordIndex] = useState(0);

  const handleWordIndexChange = useCallback((index) => {
    setActiveWordIndex(index);
  }, []);

  const handleAnimationComplete = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'relative',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'relative', zIndex: 10, height: '100%', width: '100%' }}>
        <div style={{ position: 'relative', height: '100%', paddingLeft: '32px', paddingTop: '16px' }} className="splash-content">
          {/* Spinning Triangle */}
          <SpinningTriangle
            onWordIndex={handleWordIndexChange}
            totalWords={words.length}
            activeIndex={activeWordIndex}
            onAnimationComplete={handleAnimationComplete}
          />

          {/* Word List */}
          <div style={{ position: 'relative', marginTop: '110px' }} className="words-wrapper">
            <WordList words={words} activeIndex={activeWordIndex} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
