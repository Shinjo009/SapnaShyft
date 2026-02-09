import React, { useState } from 'react';
import Typography from '../../components/Typography';
import Button from '../../components/Button';
import Logo from '../../components/Logo';
import OTPInput from '../../components/OTPInput';
import Timer from '../../components/Timer';

/**
 * OTPPage - OTP verification screen
 * 
 * Props:
 * - phoneNumber: Phone number for display/context
 * - onSuccess: Called when OTP is verified
 * - onBack: Called to go back to login
 */
const OTPPage = ({ phoneNumber, onSuccess, onBack }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyOTP = () => {
    if (otp.length === 6) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        onSuccess();
      }, 1000);
    }
  };

  const handleResendOTP = () => {
    console.log('Resending OTP to:', phoneNumber);
    // API call to resend OTP
  };

  return (
    <div className="max-w-md mx-auto space-y-8 p-8">
      <Typography variant="heading" align="center">
        Welcome to
      </Typography>

      <Logo size="lg" />

      <div className="space-y-6">
        <Typography variant="heading" as="h2">
          Enter OTP
        </Typography>

        <div className="space-y-12">
          <OTPInput
            value={otp}
            onChange={setOtp}
            length={6}
          />

          <Button 
            onClick={handleVerifyOTP}
            loading={loading}
            disabled={otp.length !== 6}
          >
            Verify OTP
          </Button>
        </div>
      </div>

      <div style={{ marginTop: '10px' }}>
        <Timer 
          initialSeconds={30}
          onResend={handleResendOTP}
        />
      </div>
    </div>
  );
};

export default OTPPage;