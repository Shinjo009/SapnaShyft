import './App.css';
import { useState, useEffect, useRef } from 'react';
import LoginPage from './pages/LoginPage';
import OTPPage from './pages/OTPPage';
import SignupPage from './pages/SignupPage';
import HealthInsightsPage from './pages/HealthInsightsPage';
import SplashScreen from './pages/SplashScreen';
import HomePage from './pages/HomePage';
import HealthScanIndexPage from './pages/HealthScanIndexPage';
import ProfilePage from './pages/ProfilePage';
import AllAppointmentsPage from './pages/AllAppointmentsPage';
import ReportsPage from './pages/ReportsPage';
import NutritionPage from './pages/NutritionPage';
import CustomerSupportPage from './pages/CustomerSupportPage';
import PermissionsPage from './pages/PermissionsPage';
import AddAccountPage from './pages/AddAccountPage';
import EditProfilePage from './pages/EditProfilePage';
import FAQPage from './pages/FAQPage';
import TermsConditionsPage from './pages/TermsConditionsPage';
import HealthAssessmentPage from './pages/HealthAssessmentPage';
import QuestionnaireBlankPage from './pages/QuestionnaireBlankPage';
import BloodMarkersPage from './pages/BloodMarkersPage/BloodMarkersPage';
import PackagesPage from './pages/PackagesPage';
import PackageDetailsPage from './pages/PackageDetailsPage';
import CreateCustomPackagePage from './pages/CreateCustomPackagePage/CreateCustomPackagePage';
import AccountSelectionPage from './pages/AccountSelectionPage';

import DiseaseRiskAnalysisPage from './pages/DiseaseRiskAnalysisPage';
import DiseaseDetailPage from './pages/DiseaseDetailPage';
import { sendOtp, verifyOtp, refreshToken, logout, switchAccount } from './services/authService';
import { createUser, getMyProfiles } from './services/usersService';
import { getMyProfile } from './services/profileService';
import { loadQuestionnaireContext } from './services/questionnaireService';
import {
  saveAuthTokens,
  getRefreshToken,
  clearAuthTokens,
  extractTokensFromResponse,
} from './utils/authStorage';

function App() {
  const [currentPage, setCurrentPage] = useState('splash'); // Start with splash screen
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userName, setUserName] = useState('');
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [questionnaireProgress, setQuestionnaireProgress] = useState(0);
  const [expandedQuestionnaireStep, setExpandedQuestionnaireStep] = useState(null);
  const [questionnaireSteps, setQuestionnaireSteps] = useState([]);
  const [questionnaireQuestionsByCategoryId, setQuestionnaireQuestionsByCategoryId] = useState({});
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [selectedHealthScanTab, setSelectedHealthScanTab] = useState(0);
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const appScrollRef = useRef(null);

  useEffect(() => {
    if (appScrollRef.current) {
      appScrollRef.current.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentPage]);

  const getProgressFromCategories = (categories) => {
    let completedCount = 0;

    for (const category of categories) {
      if ((category?.status || '').toLowerCase() === 'complete') {
        completedCount += 1;
      } else {
        break;
      }
    }

    return completedCount;
  };

  const getCategoryByRoute = (routeId) => {
    return questionnaireSteps.find((step) => step.routeId === routeId) || null;
  };

  const getQuestionsByRoute = (routeId) => {
    const category = getCategoryByRoute(routeId);
    if (!category) {
      return [];
    }

    return questionnaireQuestionsByCategoryId[String(category.category_id)] || [];
  };

  const handleStepComplete = (routeId) => {
    const routeProgressMap = {
      'anthropometry': 1,
      'family-history': 2,
      'lifestyle-habits': 3,
      'nutrition-log': 4,
      'vitals': 5,
    };
    const progressValue = routeProgressMap[routeId] || 0;
    setQuestionnaireProgress((prev) => Math.max(prev, progressValue));
    setExpandedQuestionnaireStep(null);
  };

  const initializeQuestionnaire = async () => {
    try {
      const context = await loadQuestionnaireContext();
      const categories = context?.categories || [];

      setQuestionnaireSteps(categories);
      setQuestionnaireQuestionsByCategoryId(context?.questionsByCategoryId || {});

      const completedProgress = getProgressFromCategories(categories);
      setQuestionnaireProgress(completedProgress);
      setExpandedQuestionnaireStep(null);
    } catch (error) {
      setQuestionnaireSteps([]);
      setQuestionnaireQuestionsByCategoryId({});
      setQuestionnaireProgress(0);
      console.error('Failed to load questionnaire context:', error);
    }
  };

  useEffect(() => {
    const trySessionRestore = async () => {
      const refreshTokenValue = getRefreshToken();

      if (!refreshTokenValue) {
        return;
      }

      try {
        const refreshResponse = await refreshToken(refreshTokenValue);
        const tokens = extractTokensFromResponse(refreshResponse, refreshTokenValue);
        saveAuthTokens(tokens);
      } catch (error) {
        console.error('Token refresh failed:', error);
        clearAuthTokens();
      }
    };

    trySessionRestore();
  }, []);

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

  useEffect(() => {
    const lockScrollPages = new Set([
      'health-assessment',
    ]);

    if (!lockScrollPages.has(currentPage)) {
      return undefined;
    }

    const { body, documentElement } = document;
    const previous = {
      bodyOverflow: body.style.overflow,
      bodyTouchAction: body.style.touchAction,
      bodyOverscrollBehavior: body.style.overscrollBehavior,
      htmlOverflow: documentElement.style.overflow,
      htmlOverscrollBehavior: documentElement.style.overscrollBehavior,
    };

    body.style.overflow = 'hidden';
    body.style.touchAction = 'none';
    body.style.overscrollBehavior = 'none';
    documentElement.style.overflow = 'hidden';
    documentElement.style.overscrollBehavior = 'none';

    return () => {
      body.style.overflow = previous.bodyOverflow;
      body.style.touchAction = previous.bodyTouchAction;
      body.style.overscrollBehavior = previous.bodyOverscrollBehavior;
      documentElement.style.overflow = previous.htmlOverflow;
      documentElement.style.overscrollBehavior = previous.htmlOverscrollBehavior;
    };
  }, [currentPage]);

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

  const handleSendOtp = async (phone) => {
    await sendOtp(phone);
    setPhoneNumber(phone);
    setCurrentPage('otp');
  };

  const handleSignup = async (formData) => {
    await createUser(formData);
    await handleSendOtp(formData.phone);
  };

  const handleVerifyOtp = async (otp) => {
    const verificationResponse = await verifyOtp({ phone: phoneNumber, otp });
    const tokens = extractTokensFromResponse(verificationResponse);

    if (!tokens.refreshToken) {
      throw new Error('Login response missing refresh token. Please contact backend team.');
    }

    saveAuthTokens(tokens);

    try {
      const profileResponse = await getMyProfile();
      const profile = profileResponse?.data && typeof profileResponse.data === 'object'
        ? profileResponse.data
        : profileResponse;
      setUserName(profile?.first_name || '');

      const activeUserId = Number(profile?.user_id || 0);
      const normalizedCurrentUserId = activeUserId > 0 ? activeUserId : null;
      setCurrentUserId(normalizedCurrentUserId);

      const linkedProfilesResponse = await getMyProfiles();
      const linkedProfiles = Array.isArray(linkedProfilesResponse?.data)
        ? linkedProfilesResponse.data
        : Array.isArray(linkedProfilesResponse)
          ? linkedProfilesResponse
          : [];

      const normalizedLinkedAccounts = linkedProfiles
        .map((item) => {
          const accountId = Number(item?.user_id || item?.id || 0);
          if (accountId <= 0) {
            return null;
          }

          const firstName = String(item?.first_name || '').trim();
          const lastName = String(item?.last_name || '').trim();
          const relationship = String(item?.relationship || '').trim();
          const relationshipLabel = relationship
            ? relationship.charAt(0).toUpperCase() + relationship.slice(1)
            : accountId === normalizedCurrentUserId
              ? 'Primary Account'
              : 'Linked Account';

          return {
            id: accountId,
            name: [firstName, lastName].filter(Boolean).join(' ') || 'User',
            relationshipLabel,
            gender: item?.gender || '',
            isPrimary: relationship.toLowerCase() === 'primary account' || accountId === normalizedCurrentUserId,
          };
        })
        .filter(Boolean);

      const hasCurrentInLinked = normalizedLinkedAccounts.some(
        (account) => Number(account.id) === Number(normalizedCurrentUserId)
      );

      const currentAccount = normalizedCurrentUserId
        ? {
            id: normalizedCurrentUserId,
            name: [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'User',
            relationshipLabel: 'Primary Account',
            gender: profile?.gender || '',
            isPrimary: true,
          }
        : null;

      const normalizedAccounts = hasCurrentInLinked || !currentAccount
        ? normalizedLinkedAccounts
        : [currentAccount, ...normalizedLinkedAccounts];

      setLinkedAccounts(normalizedAccounts);
      setSelectedAccountId(normalizedCurrentUserId || normalizedAccounts[0]?.id || null);

      if (normalizedAccounts.length > 1) {
        setCurrentPage('account-selection');
        return;
      }
    } catch (profileError) {
      console.error('Failed to fetch user profile:', profileError);
    }

    setCurrentPage('health-insights');
  };

  const handleAccountSelectionStart = async (targetAccountId) => {
    const parsedTargetId = Number(targetAccountId || 0);
    if (parsedTargetId <= 0) {
      setCurrentPage('home');
      return;
    }

    const shouldSwitch = currentUserId && parsedTargetId !== Number(currentUserId);

    try {
      if (shouldSwitch) {
        const switchResponse = await switchAccount(parsedTargetId);
        const tokens = extractTokensFromResponse(switchResponse);
        saveAuthTokens(tokens);
      }

      const profileResponse = await getMyProfile();
      const profile = profileResponse?.data && typeof profileResponse.data === 'object'
        ? profileResponse.data
        : profileResponse;

      setUserName(profile?.first_name || '');
      const refreshedUserId = Number(profile?.user_id || 0);
      setCurrentUserId(refreshedUserId > 0 ? refreshedUserId : null);
      setSelectedAccountId(parsedTargetId);
    } catch (error) {
      console.error('Failed to enter selected account:', error);
    }

    setCurrentPage('home');
  };

  const handleLogout = async () => {
    const refreshTokenValue = getRefreshToken();

    await logout(refreshTokenValue);

    clearAuthTokens();
    setPhoneNumber('');
    setQuestionnaireSteps([]);
    setQuestionnaireQuestionsByCategoryId({});
    setQuestionnaireProgress(0);
    setExpandedQuestionnaireStep(null);
    setCurrentPage('login');
  };

  return (
    <div className="app-root">
      <div className="app-background" aria-hidden="true" />
      {/* PWA Install Prompt Banner - Fixed outside scroll container */}
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
      <div className="app-scroll" ref={appScrollRef}>
      {currentPage === 'login' && (
        <LoginPage 
          onSuccess={handleSendOtp}
          onSignup={() => setCurrentPage('signup')}
        />
      )}

      {currentPage === 'signup' && (
        <SignupPage 
          onSuccess={handleSignup}
          onLogin={() => setCurrentPage('login')}
        />
      )}

      {currentPage === 'otp' && (
        <OTPPage 
          phoneNumber={phoneNumber}
          onVerifyOtp={handleVerifyOtp}
          onResendOtp={handleSendOtp}
          onBack={() => setCurrentPage('login')}
        />
      )}

      {currentPage === 'health-insights' && (
        <HealthInsightsPage 
          userName={userName}
          onGetStarted={() => {
            console.log('Get Started clicked');
            setCurrentPage('home');
          }}
        />
      )}

      {currentPage === 'account-selection' && (
        <AccountSelectionPage
          accounts={linkedAccounts}
          selectedAccountId={selectedAccountId}
          currentUserId={currentUserId}
          onSelectAccount={(accountId) => setSelectedAccountId(accountId)}
          onGetStarted={handleAccountSelectionStart}
        />
      )}

      {currentPage === 'home' && (
        <HomePage 
          userName={userName}
          onNavigateToHealthScan={() => {
            console.log('Navigate to Health Scan Index');
            setSelectedHealthScanTab(0);
            setCurrentPage('health-scan-index');
          }}
          onNavigateToHealthScanTab={(tabIndex) => {
            console.log('Navigate to Health Scan Index tab:', tabIndex);
            setSelectedHealthScanTab(tabIndex);
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
          onOpenHealthAssessment={() => {
            setCurrentPage('health-assessment');
            initializeQuestionnaire();
          }}
          onNavigateToBloodMarkers={() => {
            console.log('Navigate to Blood Markers');
            setCurrentPage('blood-markers');
          }}
          onNavigateToPackages={() => {
            console.log('Navigate to Packages');
            setCurrentPage('packages');
          }}
        />
      )}

      {currentPage === 'packages' && (
        <PackagesPage
          onNavigateHome={() => {
            console.log('Back to Home');
            setCurrentPage('home');
          }}
          onOpenPackageDetails={() => {
            console.log('Navigate to Package Details');
            setCurrentPage('package-details');
          }}
          onOpenCreateCustomPackage={() => {
            console.log('Navigate to Create Custom Package');
            setCurrentPage('create-custom-package');
          }}
        />
      )}

      {currentPage === 'package-details' && (
        <PackageDetailsPage
          onBack={() => {
            console.log('Back to Packages');
            setCurrentPage('packages');
          }}
        />
      )}

      {currentPage === 'create-custom-package' && (
        <CreateCustomPackagePage
          onBack={() => {
            console.log('Back to Packages');
            setCurrentPage('packages');
          }}
          onCreatePackage={() => {
            console.log('Navigate to Review Package');
            setCurrentPage('review-package');
          }}
        />
      )}

      {currentPage === 'review-package' && (
        <PackageDetailsPage
          variant="custom-review"
          profileName={userName}
          onBack={() => {
            console.log('Back to Create Custom Package');
            setCurrentPage('create-custom-package');
          }}
        />
      )}

      {currentPage === 'blood-markers' && (
        <BloodMarkersPage
          onBack={() => {
            console.log('Back to Home');
            setCurrentPage('home');
          }}
        />
      )}

      {currentPage === 'health-assessment' && (
        <HealthAssessmentPage
          steps={questionnaireSteps}
          progress={questionnaireProgress}
          expandedStep={expandedQuestionnaireStep}
          onExpandStep={(stepIndex) => {
            setExpandedQuestionnaireStep(stepIndex);
          }}
          questionsByRouteId={{
            'anthropometry': getQuestionsByRoute('anthropometry'),
            'family-history': getQuestionsByRoute('family-history'),
            'lifestyle-habits': getQuestionsByRoute('lifestyle-habits'),
            'nutrition-log': getQuestionsByRoute('nutrition-log'),
            'vitals': getQuestionsByRoute('vitals'),
          }}
          onStepComplete={handleStepComplete}
          onNavigateHome={() => setCurrentPage('home')}
        />
      )}

      {currentPage === 'questionnaire-blank' && (
        <QuestionnaireBlankPage
          onBack={() => {
            setExpandedQuestionnaireStep(null);
            setCurrentPage('health-assessment');
          }}
        />
      )}

      {currentPage === 'health-scan-index' && (
        <HealthScanIndexPage 
          initialTab={selectedHealthScanTab}
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
          onOpenPermissions={() => {
            console.log('Navigate to Permissions');
            setCurrentPage('permissions');
          }}
          onOpenAllAppointments={() => {
            console.log('Navigate to All Appointments');
            setCurrentPage('all-appointments');
          }}
          onOpenAddAccount={() => {
            console.log('Navigate to Add Account');
            setCurrentPage('add-account');
          }}
          onOpenEditProfile={() => {
            console.log('Navigate to Edit Profile');
            setCurrentPage('edit-profile');
          }}
          onOpenFaq={() => {
            console.log("Navigate to FAQ's");
            setCurrentPage('faq');
          }}
          onOpenTerms={() => {
            console.log('Navigate to Terms & Conditions');
            setCurrentPage('terms');
          }}
          onLogout={handleLogout}
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

      {currentPage === 'permissions' && (
        <PermissionsPage
          onBack={() => {
            console.log('Back to Profile');
            setCurrentPage('profile');
          }}
        />
      )}

      {currentPage === 'all-appointments' && (
        <AllAppointmentsPage
          onBack={() => {
            console.log('Back to Profile');
            setCurrentPage('profile');
          }}
        />
      )}

      {currentPage === 'add-account' && (
        <AddAccountPage
          onBack={() => {
            console.log('Back to Profile');
            setCurrentPage('profile');
          }}
        />
      )}

      {currentPage === 'edit-profile' && (
        <EditProfilePage
          onBack={() => {
            console.log('Back to Profile');
            setCurrentPage('profile');
          }}
        />
      )}

      {currentPage === 'faq' && (
        <FAQPage
          onBack={() => {
            console.log('Back to Profile');
            setCurrentPage('profile');
          }}
        />
      )}

      {currentPage === 'terms' && (
        <TermsConditionsPage
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
          }}
          onLogin={() => setCurrentPage('login')}
          onSignup={() => setCurrentPage('signup')}
        />
      )}
      </div>
    </div>
  );
}

export default App;
