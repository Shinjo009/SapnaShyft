import './App.css';
import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import OTPPage from './pages/OTPPage';
import bgImage from './images/BG-1.png';

function App() {
  const [currentPage, setCurrentPage] = useState('login'); // 'login' or 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {currentPage === 'login' && (
        <LoginPage 
          onSuccess={(phone) => {
            setPhoneNumber(phone);
            setCurrentPage('otp');
          }}
        />
      )}

      {currentPage === 'otp' && (
        <OTPPage 
          phoneNumber={phoneNumber}
          onBack={() => setCurrentPage('login')}
          onSuccess={() => {
            console.log('OTP Verified!');
            // Navigate to next screen (signup/dashboard)
          }}
        />
      )}
    </div>
  );
}

export default App;
