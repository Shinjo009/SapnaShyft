import './App.css';
import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import OTPPage from './pages/OTPPage';
import SignupPage from './pages/SignupPage';
import HealthInsightsPage from './pages/HealthInsightsPage';
import SplashScreen from './pages/SplashScreen';
import HomePage from './pages/HomePage';
import bgImage from './images/BG-1.png';

function App() {
  const [currentPage, setCurrentPage] = useState('splash'); // Start with splash screen
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
          onSignup={() => setCurrentPage('signup')}
        />
      )}

      {currentPage === 'signup' && (
        <SignupPage 
          onSuccess={(data) => {
            setPhoneNumber(data.phone);
            setCurrentPage('otp');
          }}
          onLogin={() => setCurrentPage('login')}
        />
      )}

      {currentPage === 'otp' && (
        <OTPPage 
          phoneNumber={phoneNumber}
          onBack={() => setCurrentPage('login')}
          onSuccess={() => {
            console.log('OTP Verified!');
            setCurrentPage('health-insights');
          }}
        />
      )}

      {currentPage === 'health-insights' && (
        <HealthInsightsPage 
          onGetStarted={() => {
            console.log('Get Started clicked');
            setCurrentPage('home');
          }}
        />
      )}

      {currentPage === 'home' && (
        <HomePage />
      )}

      {currentPage === 'splash' && (
        <SplashScreen 
          onComplete={() => {
            console.log('Splash animation complete');
            setCurrentPage('login');
          }}
        />
      )}
    </div>
  );
}

export default App;
