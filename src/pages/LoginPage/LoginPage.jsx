import React, { useState } from 'react';
import Typography from '../../components/Typography';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Logo from '../../components/Logo';
import metfluxLogo from '../../images/metflux_logo.svg';

/**
 * LoginPage - User login with phone number
 * 
 * Props:
 * - onSuccess: Called with phone number when Send OTP is clicked
 * - onSignup: Called when Signup link is clicked
 */
const LoginPage = ({ onSuccess, onSignup }) => {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSendOTP = () => {
    if (phoneNumber.trim().length >= 10) {
      onSuccess(phoneNumber);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen px-8 pt-[75px] pb-6 flex flex-col">
      <Logo size="lg" />

      <div className="mt-[85px]">
        <Typography variant="heading" as="h2" align="center">
          Log In
        </Typography>

        <div className="mt-[44px]">
          <Input
            type="tel"
            placeholder="Phone Number"
            maxLength={10}
            value={phoneNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
              setPhoneNumber(value);
            }}
          />

          <div className="mt-6">
            <Button onClick={handleSendOTP} disabled={phoneNumber.trim().length < 10}>
              Send OTP
            </Button>
          </div>
        </div>

        <div className="text-center mt-4">
          <span className="opacity-80 text-white text-center font-lato text-[10px] font-medium leading-normal tracking-[0.05px]">
            Don't have an account?{' '}
            <span
              className="text-[12px] tracking-[0.06px] underline cursor-pointer hover:opacity-80"
              onClick={onSignup}
            >
              Signup
            </span>
          </span>
        </div>
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

export default LoginPage;