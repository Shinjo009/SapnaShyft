import { useEffect, useRef, useState } from 'react';
import RotatingCube from '../../components/RotatingCube/RotatingCube';
import './SplashScreen3.css';

const CUBE_FACE_CSS = 320;
const CUBE_ROTATION_OVERSHOOT = 1.62;
const SCALE_MIN = 0.22;
const SCALE_MAX = 0.46;

function computeCubeScale(anchorWidthPx, anchorHeightPx) {
  const m = Math.min(anchorWidthPx, anchorHeightPx);
  const raw = (m * 0.96) / (CUBE_FACE_CSS * CUBE_ROTATION_OVERSHOOT);
  return Math.max(SCALE_MIN, Math.min(SCALE_MAX, raw));
}

const SplashScreen3 = ({ onComplete: _onComplete, onLogin, onSignup }) => {
  const cubeAnchorRef = useRef(null);
  const [cubeScale, setCubeScale] = useState(0.38);

  useEffect(() => {
    const el = cubeAnchorRef.current;
    if (!el || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect) {
        return;
      }
      setCubeScale(computeCubeScale(rect.width, rect.height));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      className="splash-screen-2 max-w-md mx-auto h-full min-h-full pt-[86px] pb-6 flex flex-col overflow-hidden"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}
    >
      <div className="splash-screen-2__hero">
        <div className="splash-screen-2__cube-anchor" ref={cubeAnchorRef}>
          <div className="splash-screen-2__pre-cube-flow" aria-hidden>
            <div className="splash-screen-2__square-flow">
              <span className="splash-screen-2__square-label splash-screen-2__square-label--tl">Bio-AI</span>
              <span className="splash-screen-2__square-label splash-screen-2__square-label--tr">Nutrition</span>
              <span className="splash-screen-2__square-label splash-screen-2__square-label--br">Prevention</span>
              <span className="splash-screen-2__square-label splash-screen-2__square-label--bl">Longevity</span>

              <span className="splash-screen-2__square-edge splash-screen-2__square-edge--top" />
              <span className="splash-screen-2__square-edge splash-screen-2__square-edge--right" />
              <span className="splash-screen-2__square-edge splash-screen-2__square-edge--bottom" />
              <span className="splash-screen-2__square-edge splash-screen-2__square-edge--left" />
            </div>
          </div>

          <div
            className="splash-screen-2__cube-scale-wrap splash-screen-2__cube-scale-wrap--delayed"
            style={{
              transform: `scale(${cubeScale}) translateZ(0)`,
              transformOrigin: 'center center',
            }}
          >
            <RotatingCube />
          </div>
        </div>
      </div>

      <div className="splash-screen-2__grow" aria-hidden="true" />

      <div className="splash-screen-2__footer flex flex-col gap-[45px] max-w-[300px] w-full mx-auto relative z-[2]">
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

        <div className="flex flex-col items-center gap-1 pb-1">
          <span className="font-lato text-[10px] font-light leading-none tracking-[0.04px] text-[#CCC] opacity-80 text-center">
            Powered by Supershyft
          </span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen3;
