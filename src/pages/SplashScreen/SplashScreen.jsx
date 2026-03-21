import { useState, useCallback } from 'react';
import SpinningTriangle from '../../components/SpinningTriangle';
import WordList from '../../components/WordList';
import Logo from '../../components/Logo';
import metfluxLogo from '../../images/metflux_logo.svg';

const words = [
  'Bio AI',
  'Holistic',
  'Precision',
  'Nutrition',
  'Longevity',
  'Prevention',
];

const WORD_FONT_SIZE = 36;
const WORD_LINE_HEIGHT = 55;
const WORD_GAP = 0;
const WORD_STEP = WORD_LINE_HEIGHT + WORD_GAP;

const SplashScreen = ({ onComplete, onLogin, onSignup }) => {
  const [activeWordIndex, setActiveWordIndex] = useState(0);

  const handleWordIndexChange = useCallback((index) => {
    setActiveWordIndex(index);
  }, []);

  const handleAnimationComplete = useCallback(() => {
    setActiveWordIndex(null);
    onComplete?.();
  }, [onComplete]);

  return (
    <div
      className="max-w-md mx-auto min-h-screen px-8 pt-[75px] pb-6 flex flex-col overflow-hidden"
      style={{ minHeight: '100dvh', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}
    >
      <Logo size="lg" />

      <div className="relative mt-[100px]">
        <SpinningTriangle
          onWordIndex={handleWordIndexChange}
          totalWords={words.length}
          onAnimationComplete={handleAnimationComplete}
          wordStep={WORD_STEP}
        />

        <div className="relative -ml-4">
          <WordList
            words={words}
            activeIndex={activeWordIndex}
            fontSize={WORD_FONT_SIZE}
            lineHeight={WORD_LINE_HEIGHT}
            gap={WORD_GAP}
            letterSpacing={0.18}
          />
        </div>
      </div>

      <div className="mt-[100px]">
        <div className="flex h-10 px-6 py-[10px] justify-center items-center self-stretch rounded-[36px] border border-[#969696] bg-[linear-gradient(90deg,#296359_0%,#41AB99_100%)] shadow-[0_12px_20px_0_rgba(255,255,255,0.15)]">
          <button
            type="button"
            onClick={onLogin}
            className="text-white text-center font-lato text-[15px] font-semibold leading-normal tracking-[0.3px]"
          >
            Log In
          </button>

          <div className="mx-[44px] h-6 w-px bg-white rounded-full" />

          <button
            type="button"
            onClick={onSignup}
            className="text-white text-center font-lato text-[15px] font-semibold leading-normal tracking-[0.3px]"
          >
            Sign Up
          </button>
        </div>
      </div>

      <div className="mt-auto flex flex-col items-center gap-1 pb-1">
        <span className="font-lato text-[8px] font-light leading-none tracking-[0.04px] text-[#CCC] opacity-80 text-center">
          Powered by
        </span>
        <img
          src={metfluxLogo}
          alt="MetFlux Research"
          className="w-[60px] h-[22px]"
          style={{ aspectRatio: '30 / 11' }}
        />
      </div>
    </div>
  );
};

export default SplashScreen;
