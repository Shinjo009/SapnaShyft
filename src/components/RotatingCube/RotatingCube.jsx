import './rotating-cube.css';
import bioAiIcon from '../../images/Cube/bio-ai.svg';
import longevityIcon from '../../images/Cube/longevity.svg';
import nutritionIcon from '../../images/Cube/nutrition.svg';
import preventionIcon from '../../images/Cube/prevention.svg';
import doctorsIcon from '../../images/Cube/doctors.svg';
import sportsIcon from '../../images/Cube/sports.svg';

const CUBE_FACES = [
  { className: 'front', icon: bioAiIcon, label: 'Bio Ai', labelIcon: bioAiIcon },
  { className: 'back', icon: longevityIcon, label: 'Longevity', labelIcon: longevityIcon },
  { className: 'right', icon: nutritionIcon, label: 'Nutrition', labelIcon: nutritionIcon },
  { className: 'left', icon: preventionIcon, label: 'Prevention', labelIcon: preventionIcon },
  /** Holistic / Age Reversal: add `labelIcon` when assets are ready */
  { className: 'top', icon: doctorsIcon, label: 'Holistic', labelIcon: null },
  { className: 'bottom', icon: sportsIcon, label: 'Age Reversal', labelIcon: null },
];

/**
 * Same DOM / 3D layout as technology.html (lines 421–458).
 * `variant="icons"` (default): SVGs from `src/images/Cube/*.svg`.
 * `variant="labels"`: icon above Lato label per face (`labelIcon`; optional for Holistic / Age Reversal).
 * Set `showLabelIcons={false}` for text-only label mode (used by SplashScreen3).
 */
export default function RotatingCube({ variant = 'icons', showLabelIcons = true }) {
  const useLabels = variant === 'labels';

  return (
    <div className="parent-container">
      <div className="beam-outer" aria-hidden />
      <div className="beam-inner" aria-hidden />
      <div className="beam-ring" aria-hidden />

      <div className="cube-container">
        {CUBE_FACES.map(({ className, icon, label, labelIcon }) => (
          <div key={className} className={`cube-face ${className}`}>
            <div className="icon-circle">
              {useLabels ? (
                <div className="cube-face-label-stack">
                  {showLabelIcons ? (
                    labelIcon ? (
                      <img
                        src={labelIcon}
                        alt=""
                        className="cube-face-label-icon"
                        width={56}
                        height={56}
                        decoding="async"
                      />
                    ) : (
                      <span className="cube-face-label-icon-spacer" aria-hidden />
                    )
                  ) : null}
                  <span className="cube-face-label">{label}</span>
                </div>
              ) : (
                <img src={icon} alt="" width={160} height={160} decoding="async" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
