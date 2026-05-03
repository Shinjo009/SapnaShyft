import { useEffect, useRef, useState } from 'react';
import RotatingCube from '../../components/RotatingCube/RotatingCube';
import supershyftWhiteLogo from '../../images/SuperShyft - white logo.svg';
import poweredBySupershyft from '../../images/Powered by Supershyt.svg';
import './SplashScreen3.css';

/** Padded scene = graph viewBox = cube placement box (1:1 so edges align). */
const PAD = 36;
const EDGE = 320;
const SCENE_PX = PAD * 2 + EDGE;

const PT = {
  prev: { x: PAD, y: PAD },
  nut: { x: PAD + EDGE, y: PAD },
  bio: { x: PAD + EDGE, y: PAD + EDGE },
  long: { x: PAD, y: PAD + EDGE },
  start: { x: PAD + 100, y: PAD + 100 },
};
const VB = { minX: 0, minY: 0, w: SCENE_PX, h: SCENE_PX };
const ROTATE_CX = PAD + EDGE / 2;
const ROTATE_CY = PAD + EDGE / 2;

/** After last edge draw (~4.1s) + buffer — cube fades in, static, aligned with graph. */
const PHASE_CUBE_MS = 4500;
/** 1s hold with formation + static cube, then spin. */
const PHASE_SPIN_MS = PHASE_CUBE_MS + 1000;

const GRAPH_SCALE_MIN = 0.34;
const GRAPH_SCALE_MAX = 0.58;

function computeGraphScale(anchorMinPx) {
  const raw = (anchorMinPx * 0.99) / SCENE_PX;
  return Math.max(GRAPH_SCALE_MIN, Math.min(GRAPH_SCALE_MAX, raw));
}

const SplashScreen3 = ({ onComplete: _onComplete, onLogin, onSignup, showInstallBannerLogo = false }) => {
  const cubeAnchorRef = useRef(null);
  const [graphScale, setGraphScale] = useState(0.46);
  /** 0 = graph intro only (cube hidden); 1 = hold + static cube; 2 = spin + graph fade */
  const [introPhase, setIntroPhase] = useState(0);

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
    const tCube = window.setTimeout(() => setIntroPhase(1), PHASE_CUBE_MS);
    const tSpin = window.setTimeout(() => setIntroPhase(2), PHASE_SPIN_MS);
    return () => {
      window.clearTimeout(tCube);
      window.clearTimeout(tSpin);
    };
  }, []);

  const phaseClass =
    introPhase === 0
      ? 'splash-screen-2--splash-v3-phase-0'
      : introPhase === 1
        ? 'splash-screen-2--splash-v3-phase-1'
        : 'splash-screen-2--splash-v3-phase-2';

  return (
    <div
      className={`splash-screen-2 max-w-md mx-auto h-full min-h-full pt-[86px] pb-6 flex flex-col overflow-x-hidden overflow-y-visible ${phaseClass}`}
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}
    >
      <div className="splash-screen-2__logo-wrap" aria-hidden={!showInstallBannerLogo}>
        {showInstallBannerLogo ? (
          <img src={supershyftWhiteLogo} alt="SuperShyft" />
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

              <svg
                className="splash-v3-composite-svg"
                viewBox={`${VB.minX} ${VB.minY} ${VB.w} ${VB.h}`}
                width={SCENE_PX}
                height={SCENE_PX}
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id="splashV3GradBioLong"
                    gradientUnits="userSpaceOnUse"
                    x1={PT.bio.x}
                    y1={PT.bio.y}
                    x2={PT.long.x}
                    y2={PT.long.y}
                  >
                    <stop offset="0%" stopColor="#03FCFC" />
                    <stop offset="100%" stopColor="#FFFFFF" />
                  </linearGradient>
                  <linearGradient
                    id="splashV3GradLongPrev"
                    gradientUnits="userSpaceOnUse"
                    x1={PT.long.x}
                    y1={PT.long.y}
                    x2={PT.prev.x}
                    y2={PT.prev.y}
                  >
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#03FCFC" />
                  </linearGradient>
                </defs>

                <g className="splash-v3-tilt" transform={`rotate(-11.5 ${ROTATE_CX} ${ROTATE_CY})`}>
                  <line className="splash-v3-seg splash-v3-seg--pn" x1={PT.prev.x} y1={PT.prev.y} x2={PT.nut.x} y2={PT.nut.y} pathLength={1} />
                  <line className="splash-v3-seg splash-v3-seg--nb" x1={PT.nut.x} y1={PT.nut.y} x2={PT.bio.x} y2={PT.bio.y} pathLength={1} />
                  <line
                    className="splash-v3-seg splash-v3-seg--bl"
                    x1={PT.bio.x}
                    y1={PT.bio.y}
                    x2={PT.long.x}
                    y2={PT.long.y}
                    pathLength={1}
                    stroke="url(#splashV3GradBioLong)"
                  />
                  <line
                    className="splash-v3-seg splash-v3-seg--lp"
                    x1={PT.long.x}
                    y1={PT.long.y}
                    x2={PT.prev.x}
                    y2={PT.prev.y}
                    pathLength={1}
                    stroke="url(#splashV3GradLongPrev)"
                  />

                  <g className="splash-v3-node-g splash-v3-node-g--bio">
                    <circle className="splash-v3-svg-dot" cx={0} cy={0} r="9" />
                    <text className="splash-v3-svg-text splash-v3-svg-text--below" x={-8} y={36} textAnchor="end">
                      Bio-AI
                    </text>
                  </g>

                  <g className="splash-v3-node-g splash-v3-node-g--nut">
                    <circle className="splash-v3-svg-dot" cx={0} cy={0} r="9" />
                    <text className="splash-v3-svg-text splash-v3-svg-text--below" x={-8} y={36} textAnchor="end">
                      Nutrition
                    </text>
                  </g>

                  <g className="splash-v3-node-g splash-v3-node-g--prev">
                    <circle className="splash-v3-svg-dot" cx={0} cy={0} r="9" />
                    <text className="splash-v3-svg-text splash-v3-svg-text--above" x={-6} y={-18} textAnchor="end">
                      Prevention
                    </text>
                  </g>

                  <g className="splash-v3-node-g splash-v3-node-g--long">
                    <circle className="splash-v3-svg-dot" cx={0} cy={0} r="9" />
                    <text className="splash-v3-svg-text splash-v3-svg-text--above" x={-10} y={-18} textAnchor="end">
                      Longevity
                    </text>
                  </g>
                </g>
              </svg>
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
