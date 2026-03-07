import './App.css';
import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import OTPPage from './pages/OTPPage';
import SignupPage from './pages/SignupPage';
import HealthInsightsPage from './pages/HealthInsightsPage';
import SplashScreen from './pages/SplashScreen';
import HomePage from './pages/HomePage';
import HealthScanIndexPage from './pages/HealthScanIndexPage';
import ProfilePage from './pages/ProfilePage';
import ReportsPage from './pages/ReportsPage';
import NutritionPage from './pages/NutritionPage';
import CustomerSupportPage from './pages/CustomerSupportPage';
import DiseaseRiskAnalysisPage from './pages/DiseaseRiskAnalysisPage';
import DiseaseDetailPage from './pages/DiseaseDetailPage';
import bgImage from './images/BG-1.png';

function App() {
  const [currentPage, setCurrentPage] = useState('splash'); // Start with splash screen
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
      console.log('Install prompt available');
    };

    const handleAppInstalled = () => {
      console.log('App installed');
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response: ${outcome}`);
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismissInstall = () => {
    setShowInstallPrompt(false);
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: `url(${bgImage})`,
        backgroundAttachment: 'fixed'
      }}
    >
      {/* PWA Install Prompt Banner */}
      {showInstallPrompt && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: '#1a1a2e',
          color: '#fff',
          padding: '16px',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Install Health Scan</p>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Get quick access on your home screen</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleInstallClick}
              style={{
                padding: '8px 16px',
                backgroundColor: '#00d4ff',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Install
            </button>
            <button
              onClick={handleDismissInstall}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: '#fff',
                border: '1px solid #fff',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Later
            </button>
          </div>
        </div>
      )}
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
        <HomePage 
          onNavigateToHealthScan={() => {
            console.log('Navigate to Health Scan Index');
            setCurrentPage('health-scan-index');
          }}
          onNavigateToProfile={() => {
            console.log('Navigate to Profile');
            setCurrentPage('profile');
          }}
          onNavigateToRiskAnalysis={() => {
            console.log('Navigate to Disease Risk Analysis');
            setCurrentPage('disease-risk-analysis');
          }}
          onNavigateToDiseaseDetail={(disease) => {
            setSelectedDisease(disease);
            setCurrentPage('disease-detail');
          }}
        />
      )}

      {currentPage === 'health-scan-index' && (
        <HealthScanIndexPage 
          onBack={() => {
            console.log('Back to Home');
            setCurrentPage('home');
          }}
          onNavigateToRiskAnalysis={() => {
            console.log('Navigate to Disease Risk Analysis');
            setCurrentPage('disease-risk-analysis');
          }}
        />
      )}

      {currentPage === 'disease-risk-analysis' && (
        <DiseaseRiskAnalysisPage 
          onBack={() => {
            console.log('Back to Home');
            setCurrentPage('home');
          }}
          onDiseaseSelect={(disease) => {
            setSelectedDisease(disease);
            setCurrentPage('disease-detail');
          }}
        />
      )}

      {currentPage === 'disease-detail' && (
        <DiseaseDetailPage
          disease={selectedDisease}
          onBack={() => {
            console.log('Back to Disease Risk Analysis');
            setCurrentPage('disease-risk-analysis');
          }}
        />
      )}

      {currentPage === 'profile' && (
        <ProfilePage
          onBack={() => {
            console.log('Back to Home');
            setCurrentPage('home');
          }}
          onOpenReports={() => {
            console.log('Navigate to Reports');
            setCurrentPage('reports');
          }}
          onOpenNutrition={() => {
            console.log('Navigate to Nutrition');
            setCurrentPage('nutrition');
          }}
          onOpenCustomerSupport={() => {
            console.log('Navigate to Customer Support');
            setCurrentPage('customer-support');
          }}
        />
      )}

      {currentPage === 'reports' && (
        <ReportsPage
          onBack={() => {
            console.log('Back to Profile');
            setCurrentPage('profile');
          }}
        />
      )}

      {currentPage === 'nutrition' && (
        <NutritionPage
          onBack={() => {
            console.log('Back to Profile');
            setCurrentPage('profile');
          }}
        />
      )}

      {currentPage === 'customer-support' && (
        <CustomerSupportPage
          onBack={() => {
            console.log('Back to Profile');
            setCurrentPage('profile');
          }}
        />
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
