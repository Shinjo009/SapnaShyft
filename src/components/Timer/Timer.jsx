import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Timer Component - Countdown timer with resend functionality
 * 
 * Features:
 * - Countdown from specified seconds
 * - Shows "Resend OTP" link when timer reaches 0
 * - Auto-resets on resend
 * 
 * Props:
 * - initialSeconds: Starting time in seconds (default 30)
 * - onResend: Called when user clicks Resend OTP
 */
const Timer = ({ 
  initialSeconds = 30,
  onResend,
  className = '',
  ...props 
}) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval = null;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds]);

  const handleResend = () => {
    setSeconds(initialSeconds);
    setIsActive(true);
    if (onResend) onResend();
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={`text-center font-lato text-white ${className}`}
      {...props}
    >
      {seconds > 0 ? (
        <span className="text-sm font-normal opacity-80">
          {formatTime(seconds)}{' '}
          <span className="text-[12px] underline cursor-not-allowed opacity-60">
            Resend OTP
          </span>
        </span>
      ) : (
        <span 
          className="text-[12px] font-medium underline cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
          onClick={handleResend}
        >
          Resend OTP
        </span>
      )}
    </div>
  );
};

Timer.propTypes = {
  /** Initial countdown time in seconds */
  initialSeconds: PropTypes.number,
  /** Called when user clicks Resend OTP */
  onResend: PropTypes.func,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default Timer;