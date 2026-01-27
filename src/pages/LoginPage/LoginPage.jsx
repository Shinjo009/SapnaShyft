import React, { useState } from 'react';
import Typography from '../../components/Typography';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Logo from '../../components/Logo';

/**
 * LoginPage - User login with phone number
 * 
 * Props:
 * - onSuccess: Called with phone number when Send OTP is clicked
 */
const LoginPage = ({ onSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSendOTP = () => {
    if (phoneNumber.trim()) {
      onSuccess(phoneNumber);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-8 p-8">
      <Typography variant="heading" align="center">
        Welcome to
      </Typography>

      <Logo size="lg" />

      <div className="space-y-6">
        <Typography variant="heading" as="h2">
          Log in
        </Typography>

        <div className="space-y-12">
          <Input
            type="tel"
            placeholder="Phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />

          <Button onClick={handleSendOTP}>
            Send OTP
          </Button>
        </div>
      </div>

      <div className="text-center space-y-4">
        <span className="opacity-80 text-white text-center font-lato text-[10px] font-medium leading-normal tracking-[0.05px]">
          Don't have an account?{' '}
          <span className="text-[12px] tracking-[0.06px] underline cursor-pointer">
            Signup
          </span>
        </span>
      </div>
    </div>
  );
};

export default LoginPage;