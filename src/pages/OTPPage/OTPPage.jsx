import React, { useState } from 'react';
import Typography from '../../components/Typography';
import Button from '../../components/Button';
import Logo from '../../components/Logo';
import OTPInput from '../../components/OTPInput';
import Timer from '../../components/Timer';
import metfluxLogo from '../../images/metflux_logo.svg';

/**
 * OTPPage - OTP verification screen
 * 
 * Props:
 * - phoneNumber: Phone number for display/context
 * - onVerifyOtp: Called with OTP when OTP is verified
 * - onResendOtp: Called with phone number when resend is requested
 * - onBack: Called to go back to login
 */
const OTPPage = ({ phoneNumber, onVerifyOtp, onResendOtp, onBack }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');

  const getMaskedPhone = () => {
    const digits = String(phoneNumber || '');

    if (!digits) return '+91';
    if (digits.length <= 4) return `+91${digits}`;

    const firstTwo = digits.slice(0, 2);
    const lastTwo = digits.slice(-2);
    const middle = '*'.repeat(digits.length - 4);

    return `+91${firstTwo}${middle}${lastTwo}`;
  };

  const formattedPhone = getMaskedPhone();

  const handleVerifyOTP = async () => {
    if (otp.length === 6) {
      try {
        setLoading(true);
        setError('');
        await onVerifyOtp(otp);
      } catch (verifyError) {
        setError(verifyError?.message || 'OTP verification failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResendOTP = async () => {
    try {
      setResendLoading(true);
      setError('');
      await onResendOtp(phoneNumber);
    } catch (resendError) {
      setError(resendError?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-full px-8 pt-[75px] pb-6 flex flex-col">
      <Logo size="lg" />

      <div className="mt-[72px]">
        <Typography variant="heading" as="h2" align="center">
          Enter OTP
        </Typography>

        <p className="text-center font-lato text-[11px] font-normal leading-6 text-[#9A9A9A]">
          Code has been sent to {formattedPhone}
        </p>

        <div className="mt-8 space-y-6">
          <OTPInput
            value={otp}
            onChange={setOtp}
            length={6}
          />

          <Button 
            onClick={handleVerifyOTP}
            loading={loading}
            disabled={otp.length !== 6 || resendLoading}
          >
            Verify OTP
          </Button>

          {error ? (
            <p className="text-center text-[11px] text-[#FF9D9D]">{error}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-3">
        <Timer 
          initialSeconds={30}
          onResend={handleResendOTP}
        />
      </div>

      <div className="mt-auto flex flex-col items-center gap-1 pb-1">
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
  );
};

export default OTPPage;