import { useLayoutEffect, useRef, useState } from 'react';
import Logo from '../../components/Logo';
import RotatingCube from '../../components/RotatingCube/RotatingCube';
import metfluxLogo from '../../images/metflux_logo.svg';
import './SplashScreen2.css';

const CUBE_FACE_CSS = 320;
const CUBE_ROTATION_OVERSHOOT = 1.62;
const SCALE_MIN = 0.22;
const SCALE_MAX = 0.46;

function computeCubeScale(anchorWidthPx, anchorHeightPx) {
  const m = Math.min(anchorWidthPx, anchorHeightPx);
  const raw = (m * 0.96) / (CUBE_FACE_CSS * CUBE_ROTATION_OVERSHOOT);
  return Math.max(SCALE_MIN, Math.min(SCALE_MAX, raw));
}

/**
 * Splash screen 2 — Figma App--first-phase (e.g. node 3672:6221) + dev overlay spacing:
 * logo 78px; cube margins ~21px / ~20px; 33px below logo; ~139px tags → CTA.
 * Cube scale is computed from the anchor box (ResizeObserver) so CSS never uses invalid scale() math.
 */
const SplashScreen2 = ({ onComplete: _onComplete, onLogin, onSignup }) => {
  const cubeAnchorRef = useRef(null);
  const [cubeScale, setCubeScale] = useState(0.38);

  useLayoutEffect(() => {
    const el = cubeAnchorRef.current;
    if (!el || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const apply = () => {
      setCubeScale(computeCubeScale(el.clientWidth, el.clientHeight));
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      className="splash-screen-2 max-w-md mx-auto h-full min-h-full pt-[86px] pb-6 flex flex-col overflow-hidden"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}
    >
      <div className="splash-screen-2__logo-wrap flex justify-center">
        <Logo size="lg" />
      </div>

      <div className="splash-screen-2__hero">
        <div className="splash-screen-2__cube-anchor" ref={cubeAnchorRef}>
          <div
            className="splash-screen-2__cube-scale-wrap"
            style={{
              transform: `scale(${cubeScale}) translateZ(0)`,
              transformOrigin: 'center center',
            }}
          >
            <RotatingCube />
          </div>
        </div>

        <div className="splash-screen-2__tags splash-screen-2__tags--loading" aria-label="Product themes loading">
          <span className="splash-screen-2__tag splash-screen-2__tag--w0">Bio-AI</span>
          <span className="splash-screen-2__tag-arrow splash-screen-2__tag-arrow--a0" aria-hidden>
            <span className="splash-screen-2__tag-arrow__inner">
              <span className="splash-screen-2__tag-arrow__dot splash-screen-2__tag-arrow__dot--l" />
              <span className="splash-screen-2__tag-arrow__wire">
                <span className="splash-screen-2__tag-arrow__sweep" />
              </span>
              <span className="splash-screen-2__tag-arrow__dot splash-screen-2__tag-arrow__dot--r" />
            </span>
          </span>
          <span className="splash-screen-2__tag splash-screen-2__tag--w1">Nutrition</span>
          <span className="splash-screen-2__tag-arrow splash-screen-2__tag-arrow--a1" aria-hidden>
            <span className="splash-screen-2__tag-arrow__inner">
              <span className="splash-screen-2__tag-arrow__dot splash-screen-2__tag-arrow__dot--l" />
              <span className="splash-screen-2__tag-arrow__wire">
                <span className="splash-screen-2__tag-arrow__sweep" />
              </span>
              <span className="splash-screen-2__tag-arrow__dot splash-screen-2__tag-arrow__dot--r" />
            </span>
          </span>
          <span className="splash-screen-2__tag splash-screen-2__tag--w2">Prevention</span>
          <span className="splash-screen-2__tag-arrow splash-screen-2__tag-arrow--a2" aria-hidden>
            <span className="splash-screen-2__tag-arrow__inner">
              <span className="splash-screen-2__tag-arrow__dot splash-screen-2__tag-arrow__dot--l" />
              <span className="splash-screen-2__tag-arrow__wire">
                <span className="splash-screen-2__tag-arrow__sweep" />
              </span>
              <span className="splash-screen-2__tag-arrow__dot splash-screen-2__tag-arrow__dot--r" />
            </span>
          </span>
          <span className="splash-screen-2__tag splash-screen-2__tag--w3">Longevity</span>
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
    </div>
  );
};

export default SplashScreen2;
