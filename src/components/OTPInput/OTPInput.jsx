import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * OTPInput Component - 6-digit OTP input with auto-focus
 * 
 * Features:
 * - Auto-focus on next box when digit entered
 * - Auto-focus on previous box when backspace pressed
 * - Paste support for full OTP
 * - Same styling as regular Input component
 * 
 * Props:
 * - value: OTP value (string)
 * - onChange: Called with complete OTP string
 * - length: Number of digits (default 6)
 */
const OTPInput = ({ 
  value = '',
  onChange,
  length = 6,
  className = '',
  ...props 
}) => {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const inputRefs = useRef([]);

  // Initialize refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, e) => {
    const val = e.target.value;
    
    // Only allow numbers
    if (val && !/^[0-9]$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Call onChange with complete OTP
    onChange(newOtp.join(''));

    // Auto-focus next input
    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Focus previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      }
    }
    // Handle arrow keys
    else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    
    if (!/^\d+$/.test(pastedData)) return; // Only numbers

    const newOtp = pastedData.split('');
    while (newOtp.length < length) newOtp.push('');
    
    setOtp(newOtp);
    onChange(newOtp.join(''));

    // Focus last filled input
    const lastIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[lastIndex]?.focus();
  };

  return (
    <div className={`flex gap-3 justify-center ${className}`} {...props}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="
            w-12
            h-12
            text-center
            text-white
            text-xl
            font-lato
            font-semibold
            rounded-lg
            bg-input-bg
            border
            border-input-border
            focus:outline-none
            focus:border-input-focus
            transition-colors
          "
        />
      ))}
    </div>
  );
};

OTPInput.propTypes = {
  /** OTP value */
  value: PropTypes.string,
  /** Change handler - receives complete OTP string */
  onChange: PropTypes.func.isRequired,
  /** Number of digits */
  length: PropTypes.number,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default OTPInput;