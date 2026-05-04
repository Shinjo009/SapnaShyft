import { useEffect, useRef, useState } from 'react';
import RotatingCube from '../../components/RotatingCube/RotatingCube';
import supershyftLogo from '../../images/SuperShyft - Logo [Final]-03 1.png';
import poweredBySupershyft from '../../images/Powered by Supershyt.svg';
import './SplashScreen3.css';

/** Padded scene = graph viewBox = cube placement box (1:1 so edges align). */
const PAD = 36;
const EDGE = 320;
const SCENE_PX = PAD * 2 + EDGE;

/** Graph / line intro disabled — cube visible on load; 1s hold then spin. */
const PHASE_SPIN_MS = 1000;

const GRAPH_SCALE_MIN = 0.34;
const GRAPH_SCALE_MAX = 0.58;

function computeGraphScale(anchorMinPx) {
  const raw = (anchorMinPx * 0.99) / SCENE_PX;
  return Math.max(GRAPH_SCALE_MIN, Math.min(GRAPH_SCALE_MAX, raw));
}

const SplashScreen3 = ({ onComplete: _onComplete, onLogin, onSignup, showInstallBannerLogo = false }) => {
  const cubeAnchorRef = useRef(null);
  const [graphScale, setGraphScale] = useState(0.46);
  /** 1 = static cube; 2 = spin (graph/line layer commented out). */
  const [introPhase, setIntroPhase] = useState(1);

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
      const m = Math.min(rect.width, rect.height);
      setGraphScale(computeGraphScale(m));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const tSpin = window.setTimeout(() => setIntroPhase(2), PHASE_SPIN_MS);
    return () => window.clearTimeout(tSpin);
  }, []);

  const phaseClass =
    introPhase === 1 ? 'splash-screen-2--splash-v3-phase-1' : 'splash-screen-2--splash-v3-phase-2';

  return (
    <div
      className={`splash-screen-2 max-w-md mx-auto h-full min-h-full pt-[86px] pb-6 flex flex-col overflow-x-hidden overflow-y-hidden ${phaseClass}`}
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}
    >
      <div className="splash-screen-2__logo-wrap" aria-hidden={!showInstallBannerLogo}>
        {showInstallBannerLogo ? (
          <img src={supershyftLogo} alt="SuperShyft" />
        ) : (
          <span className="splash-screen-2__logo-spacer" aria-hidden />
        )}
      </div>

      <div className="splash-screen-2__hero">
        <div className="splash-screen-2__cube-anchor" ref={cubeAnchorRef}>
          <div
            className="splash-v3-scene"
            style={{
              transform: `scale(${graphScale}) translateZ(0)`,
              transformOrigin: 'center center',
            }}
          >
            <div className="splash-v3-scene-flat">
              <div className="splash-v3-cube-layer">
                {/* Same 320×320 front face as graph square; offset (PAD,PAD) inside SCENE_PX via CSS. */}
                <div className="splash-v3-cube-zwrap">
                  <RotatingCube />
                </div>
              </div>

              {/* Connecting line + node graph SVG was here; reintroduce with PAD/EDGE/SCENE_PX when enabling. */}
            </div>
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
          <img
            src={poweredBySupershyft}
            alt="Powered by SuperShyft"
            className="block h-[30px] w-auto max-w-[min(280px,88vw)] object-contain object-center"
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen3;
