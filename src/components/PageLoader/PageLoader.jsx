import { useEffect, useState } from 'react';
import './PageLoader.css';
import loaderGif from '../../images/Loader/supershyft-loader.gif';

export default function PageLoader({ active }) {
  const [mounted, setMounted] = useState(Boolean(active));
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (active) {
      setMounted(true);
      setFadeOut(false);
      return undefined;
    }

    if (!mounted) {
      return undefined;
    }

    setFadeOut(true);
    const timer = window.setTimeout(() => {
      setMounted(false);
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [active, mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      id="loader"
      className={`page-loader${fadeOut ? ' page-loader--fade-out' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading"
      aria-busy={!fadeOut}
    >
      <div className="page-loader__content loader-content">
        <img
          src={loaderGif}
          alt="Loading..."
          className="page-loader__logo loader-logo img-fluid"
        />
      </div>
    </div>
  );
}
