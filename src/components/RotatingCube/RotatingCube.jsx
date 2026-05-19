import './rotating-cube.css';
import bioAiIcon from '../../images/Cube/bio-ai.svg';
import longevityIcon from '../../images/Cube/longevity.svg';
import nutritionIcon from '../../images/Cube/nutrition.svg';
import preventionIcon from '../../images/Cube/prevention.svg';
import doctorsIcon from '../../images/Cube/doctors.svg';
import sportsIcon from '../../images/Cube/sports.svg';

/**
 * Same DOM as technology.html (lines 421–458).
 * Face icons sourced from src/images/Cube/bio-ai.svg … sports.svg.
 */
export default function RotatingCube() {
  return (
    <div className="parent-container">
      <div className="beam-outer" aria-hidden />
      <div className="beam-inner" aria-hidden />
      <div className="beam-ring" aria-hidden />

      <div className="cube-container">
        <div className="cube-face front">
          <div className="icon-circle">
            <img src={bioAiIcon} alt="" width={160} height={160} decoding="async" />
          </div>
        </div>
        <div className="cube-face back">
          <div className="icon-circle">
            <img src={longevityIcon} alt="" width={160} height={160} decoding="async" />
          </div>
        </div>
        <div className="cube-face right">
          <div className="icon-circle">
            <img src={nutritionIcon} alt="" width={160} height={160} decoding="async" />
          </div>
        </div>
        <div className="cube-face left">
          <div className="icon-circle">
            <img src={preventionIcon} alt="" width={160} height={160} decoding="async" />
          </div>
        </div>
        <div className="cube-face top">
          <div className="icon-circle">
            <img src={doctorsIcon} alt="" width={160} height={160} decoding="async" />
          </div>
        </div>
        <div className="cube-face bottom">
          <div className="icon-circle">
            <img src={sportsIcon} alt="" width={160} height={160} decoding="async" />
          </div>
        </div>
      </div>
    </div>
  );
}
