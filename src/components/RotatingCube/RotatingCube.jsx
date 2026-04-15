import './rotating-cube.css';
import icon1 from '../../images/Cube/icon1.svg';
import icon2 from '../../images/Cube/icon2.svg';
import icon3 from '../../images/Cube/icon3.svg';
import icon4 from '../../images/Cube/icon4.svg';
import icon5 from '../../images/Cube/icon5.svg';
import icon6 from '../../images/Cube/icon6.svg';

/**
 * Same DOM as technology.html (lines 421–458).
 * Face icons sourced from src/images/Cube/icon1.svg … icon6.svg
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
            <img src={icon1} alt="" width={160} height={160} decoding="async" />
          </div>
        </div>
        <div className="cube-face back">
          <div className="icon-circle">
            <img src={icon2} alt="" width={160} height={160} decoding="async" />
          </div>
        </div>
        <div className="cube-face right">
          <div className="icon-circle">
            <img src={icon3} alt="" width={160} height={160} decoding="async" />
          </div>
        </div>
        <div className="cube-face left">
          <div className="icon-circle">
            <img src={icon4} alt="" width={160} height={160} decoding="async" />
          </div>
        </div>
        <div className="cube-face top">
          <div className="icon-circle">
            <img src={icon5} alt="" width={160} height={160} decoding="async" />
          </div>
        </div>
        <div className="cube-face bottom">
          <div className="icon-circle">
            <img src={icon6} alt="" width={160} height={160} decoding="async" />
          </div>
        </div>
      </div>
    </div>
  );
}
