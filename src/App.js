import './App.css';
import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import SplashScreen from './pages/SplashScreen';
import LoginPage from './pages/LoginPage';
import { getSuperClubLikedSportIds } from './pages/SuperClubPage/superClubStorage';
import { getSuperClubSportsByIds } from './pages/SuperClubPage/superClubSportImages';
import { sendOtp, verifyOtp, refreshToken, logout, switchAccount } from './services/authService';
import { createUser, getMyProfiles, invalidateMyProfilesCache } from './services/usersService';
import { getMyProfile, invalidateMyProfileCache } from './services/profileService';
import { loadQuestionnaireContext, submitQuestionnaireResponses, submitAssessment } from './services/questionnaireService';
import {
  fetchLatestAssessmentReport,
  clearReportRequestCache,
  clearStoredLatestAssessmentId,
} from './services/reportService';
import {
  saveAuthTokens,
  getRefreshToken,
  clearAuthTokens,
  extractTokensFromResponse,
} from './utils/authStorage';
import { trackAppScreen } from './analytics/googleAnalytics';
import AppTooltipTour from './components/AppTooltipTour/AppTooltipTour';
import { prefetchNavbarRoutes } from './utils/routePrefetch';

// Same asset as Profile logout modal (`/public/BG-1.png`).
const questionnaireSuccessModalBg = `${process.env.PUBLIC_URL || ''}/BG-1.png`;

// Route-level code splitting: every non-entry page loads its own JS/CSS chunk on demand.
// Splash + Login stay eager because they're the first paint; everything else is deferred
// so the initial main bundle stays small (~172 KiB of unused JS audit finding).
const OTPPage = lazy(() => import('./pages/OTPPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const HealthInsightsPage = lazy(() => import('./pages/HealthInsightsPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const HealthScanIndexPage = lazy(() => import('./pages/HealthScanIndexPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AllAppointmentsPage = lazy(() => import('./pages/AllAppointmentsPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const NutritionPage = lazy(() => import('./pages/NutritionPage'));
const CustomerSupportPage = lazy(() => import('./pages/CustomerSupportPage'));
const PermissionsPage = lazy(() => import('./pages/PermissionsPage'));
const AddAccountPage = lazy(() => import('./pages/AddAccountPage'));
const EditProfilePage = lazy(() => import('./pages/EditProfilePage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const TermsConditionsPage = lazy(() => import('./pages/TermsConditionsPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const HealthAssessmentPage = lazy(() => import('./pages/HealthAssessmentPage'));
const QuestionnaireBlankPage = lazy(() => import('./pages/QuestionnaireBlankPage'));
const BloodMarkersPage = lazy(() => import('./pages/BloodMarkersPage/BloodMarkersPage'));
const PackagesPage = lazy(() => import('./pages/PackagesPage'));
const PackageDetailsPage = lazy(() => import('./pages/PackageDetailsPage'));
const CreateCustomPackagePage = lazy(() => import('./pages/CreateCustomPackagePage/CreateCustomPackagePage'));
const AccountSelectionPage = lazy(() => import('./pages/AccountSelectionPage'));
const DoctorsPage = lazy(() => import('./pages/DoctorsPage'));
const ExpertDetailsPage = lazy(() => import('./pages/ExpertDetailsPage'));
const IntegratedHealthProgramPage = lazy(() => import('./pages/IntegratedHealthProgramPage'));
const SuperClubPage = lazy(() => import('./pages/SuperClubPage/SuperClubPage'));
const SuperClubPlaylistPage = lazy(() => import('./pages/SuperClubPage/SuperClubPlaylistPage'));
const SuperClubPage2 = lazy(() => import('./pages/SuperClubPage/SuperClubPage2'));
const DiseaseRiskAnalysisPage = lazy(() => import('./pages/DiseaseRiskAnalysisPage'));
const DiseaseDetailPage = lazy(() => import('./pages/DiseaseDetailPage'));

const SWIPE_BACK_BLOCKED_PAGES = new Set([
  'home',
  'login',
  'signup',
  'otp',
  'splash',
  'health-insights',
  'account-selection',
]);

const EDGE_SWIPE_TRIGGER_PX = 70;
const EDGE_SWIPE_VERTICAL_TOLERANCE_PX = 80;
const EDGE_SWIPE_START_ZONE_PX = 28;

const normalizeRedirectTarget = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) {
    return '';
  }

  const compact = normalized
    .replace(/^\/+|\/+$/g, '')
    .replace(/\s+/g, '-')
    .replace(/_/g, '-');

  if (compact === 'blood-markers' || compact === 'bloodmarkers') {
    return 'blood-markers';
  }

  return '';
};

const resolvePostLoginRedirectPage = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    const searchParams = new URLSearchParams(window.location.search || '');
    const fromQuery = normalizeRedirectTarget(
      searchParams.get('redirect')
      || searchParams.get('target')
      || searchParams.get('goto')
    );

    if (fromQuery) {
      return fromQuery;
    }

    const path = String(window.location.pathname || '').toLowerCase();
    const pathSegments = path.split('/').filter(Boolean);
    const lastSegment = normalizeRedirectTarget(pathSegments[pathSegments.length - 1] || '');

    if (lastSegment) {
      return lastSegment;
    }
  } catch (error) {
    console.error('Failed to resolve post-login redirect page:', error);
  }

  return '';
};

const resolveOverviewPayload = (payload) => {
  if (!payload || typeof payload !== 'object') return null;
  if (payload.data && typeof payload.data === 'object') return payload.data;
  if (payload.result && typeof payload.result === 'object') return payload.result;
  if (payload.item && typeof payload.item === 'object') return payload.item;
  return payload;
};

const deriveEmployerOrganizerName = (profile) => {
  const raw = profile?.referred_by
    || profile?.organization_name
    || profile?.employer_name
    || profile?.camp_organizer
    || profile?.corporate_partner_name;
  return String(raw || '').trim();
};

const normalizeAssessmentStatus = (status) => String(status || '').trim().toLowerCase();

const isActiveIncompleteAssessment = (assessment) => {
  const status = normalizeAssessmentStatus(assessment?.status);
  const normalizedCompletedAt = assessment?.completed_at || assessment?.completedAt || null;
  const isCompleteFlag = Boolean(assessment?.is_completed ?? assessment?.isComplete ?? false);
  const activeStatuses = new Set(['active', 'in_progress', 'in-progress', 'assigned', 'pending']);
  return activeStatuses.has(status) && !normalizedCompletedAt && !isCompleteFlag;
};

function App() {
  const [currentPage, setCurrentPage] = useState('splash'); // Start with splash screen
  const [isBootstrappingSession, setIsBootstrappingSession] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userName, setUserName] = useState('');
  const [employerOrganizerName, setEmployerOrganizerName] = useState('');
  const [userAge, setUserAge] = useState(null);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [questionnaireProgress, setQuestionnaireProgress] = useState(0);
  const [expandedQuestionnaireStep, setExpandedQuestionnaireStep] = useState(null);
  const [questionnaireSteps, setQuestionnaireSteps] = useState([]);
  const [questionnaireCurrentAssessment, setQuestionnaireCurrentAssessment] = useState(null);
  const [questionnaireAssessments, setQuestionnaireAssessments] = useState([]);
  const [questionnaireQuestionsByCategoryId, setQuestionnaireQuestionsByCategoryId] = useState({});
  const [questionnaireDraftResponsesByRoute, setQuestionnaireDraftResponsesByRoute] = useState({});
  const [questionnaireSuccessMessage, setQuestionnaireSuccessMessage] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIosInstallFlow, setIsIosInstallFlow] = useState(false);
  const [selectedHealthScanTab, setSelectedHealthScanTab] = useState(0);
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [customPackageCard, setCustomPackageCard] = useState(null);
  const [pendingCustomPackagePayload, setPendingCustomPackagePayload] = useState(null);
  const [selectedPackageCard, setSelectedPackageCard] = useState(null);
  const [canSwipeBack, setCanSwipeBack] = useState(false);
  const [preloadedHomeData, setPreloadedHomeData] = useState(null);
  const [forceHomeApiRefresh, setForceHomeApiRefresh] = useState(false);
  const [superClubLikedSportIds, setSuperClubLikedSportIds] = useState(() => getSuperClubLikedSportIds());
  const [isB2bQuestionnaireFlow, setIsB2bQuestionnaireFlow] = useState(false);
  const [healthAssessmentBackPage, setHealthAssessmentBackPage] = useState('home');
  // const [superClubOnboardingDone, setSuperClubOnboardingDone] = useState(() =>
  //   isSuperClubOnboardingComplete(),
  // );
  const appScrollRef = useRef(null);
  const pageHistoryRef = useRef([]);
  const previousPageRef = useRef(null);
  const skipHistoryForNextPageRef = useRef(false);
  const postLoginRedirectPageRef = useRef(resolvePostLoginRedirectPage());
  const edgeSwipeStateRef = useRef({
    tracking: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
  });

  const isSwipeBackAllowedPage = (page) => !SWIPE_BACK_BLOCKED_PAGES.has(page);

  useEffect(() => {
    if (appScrollRef.current) {
      appScrollRef.current.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentPage]);

  useEffect(() => {
    trackAppScreen(currentPage);

    const previousPage = previousPageRef.current;

    if (previousPage && previousPage !== currentPage && !skipHistoryForNextPageRef.current) {
      pageHistoryRef.current.push(previousPage);
    }

    skipHistoryForNextPageRef.current = false;
    previousPageRef.current = currentPage;

    setCanSwipeBack(isSwipeBackAllowedPage(currentPage) && pageHistoryRef.current.length > 0);
  }, [currentPage]);

  useEffect(() => {
    if (currentPage !== 'home' || !forceHomeApiRefresh) {
      return;
    }

    const timer = window.setTimeout(() => {
      setForceHomeApiRefresh(false);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [currentPage, forceHomeApiRefresh]);

  const goBackBySwipe = () => {
    if (!isSwipeBackAllowedPage(currentPage)) {
      return false;
    }

    while (pageHistoryRef.current.length > 0) {
      const targetPage = pageHistoryRef.current.pop();
      if (!targetPage || targetPage === currentPage) {
        continue;
      }

      skipHistoryForNextPageRef.current = true;
      setCurrentPage(targetPage);
      return true;
    }

    return false;
  };

  const handleEdgeSwipeStart = (event) => {
    if (!canSwipeBack) {
      return;
    }

    const touch = event.touches?.[0];
    if (!touch) {
      return;
    }

    if (touch.clientX > EDGE_SWIPE_START_ZONE_PX) {
      return;
    }

    edgeSwipeStateRef.current = {
      tracking: true,
      startX: touch.clientX,
      startY: touch.clientY,
      lastX: touch.clientX,
      lastY: touch.clientY,
    };
  };

  const handleEdgeSwipeMove = (event) => {
    const swipeState = edgeSwipeStateRef.current;
    if (!swipeState.tracking) {
      return;
    }

    const touch = event.touches?.[0];
    if (!touch) {
      return;
    }

    swipeState.lastX = touch.clientX;
    swipeState.lastY = touch.clientY;

    const deltaX = swipeState.lastX - swipeState.startX;
    const deltaY = swipeState.lastY - swipeState.startY;

    if (Math.abs(deltaY) > EDGE_SWIPE_VERTICAL_TOLERANCE_PX || deltaX < -10) {
      swipeState.tracking = false;
      return;
    }

    if (deltaX > 10) {
      event.preventDefault();
    }
  };

  const handleEdgeSwipeEnd = () => {
    const swipeState = edgeSwipeStateRef.current;
    if (!swipeState.tracking) {
      return;
    }

    const deltaX = swipeState.lastX - swipeState.startX;
    const deltaY = swipeState.lastY - swipeState.startY;
    swipeState.tracking = false;

    if (deltaX >= EDGE_SWIPE_TRIGGER_PX && Math.abs(deltaY) <= EDGE_SWIPE_VERTICAL_TOLERANCE_PX) {
      goBackBySwipe();
    }
  };

  const handleEdgeSwipeCancel = () => {
    edgeSwipeStateRef.current.tracking = false;
  };

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

  const getAgeFromProfile = (profile) => {
    if (typeof profile?.age === 'number' && profile.age > 0) {
      return Math.floor(profile.age);
    }

    if (!profile?.date_of_birth) {
      return null;
    }

    const dob = new Date(profile.date_of_birth);
    if (Number.isNaN(dob.getTime())) {
      return null;
    }

    const today = new Date();
    let calculatedAge = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      calculatedAge -= 1;
    }

    return calculatedAge > 0 ? calculatedAge : null;
  };

  const getQuestionsByRoute = (routeId) => {
    const category = getCategoryByRoute(routeId);
    if (!category) {
      return [];
    }

    return questionnaireQuestionsByCategoryId[String(category.category_id)] || [];
  };

  const getDraftResponsesByRouteFromContext = (categories = [], responsesByCategoryId = {}) => {
    if (!Array.isArray(categories) || !responsesByCategoryId || typeof responsesByCategoryId !== 'object') {
      return {};
    }

    return categories.reduce((acc, category) => {
      const routeId = String(category?.routeId || '');
      if (!routeId) {
        return acc;
      }

      const responses = responsesByCategoryId[String(category?.category_id)] || [];
      if (!Array.isArray(responses) || responses.length === 0) {
        return acc;
      }

      acc[routeId] = responses;
      return acc;
    }, {});
  };

  const getAssessmentSourceIdsForTarget = (targetAssessmentInstanceId) => {
    const targetId = Number(targetAssessmentInstanceId || 0);
    if (targetId <= 0 || !Array.isArray(questionnaireAssessments)) {
      return targetId > 0 ? [targetId] : [];
    }

    const targetAssessment = questionnaireAssessments.find((assessment) => {
      return Number(assessment?.assessment_instance_id || assessment?.assessment_id || assessment?.id || 0) === targetId;
    });

    const engagementId = Number(targetAssessment?.engagement_id || 0);
    const sourceIds = questionnaireAssessments
      .filter((assessment) => {
        const assessmentId = Number(assessment?.assessment_instance_id || assessment?.assessment_id || assessment?.id || 0);
        if (assessmentId <= 0) {
          return false;
        }

        // Submit with only currently active/incomplete instances in the same engagement.
        // This avoids sending stale historical IDs when multiple assessments exist.
        const sameEngagement = Number(assessment?.engagement_id || 0) === engagementId;
        return sameEngagement && isActiveIncompleteAssessment(assessment);
      })
      .map((assessment) => Number(assessment?.assessment_instance_id || assessment?.assessment_id || assessment?.id || 0))
      .filter((id) => id > 0);

    const uniqueSortedIds = Array.from(new Set(sourceIds)).sort((a, b) => a - b);
    return uniqueSortedIds.length > 0 ? uniqueSortedIds : [targetId];
  };

  const handleStepComplete = async (routeId, responses = []) => {
    const routeProgressMap = {
      'anthropometry': 1,
      'family-history': 2,
      'lifestyle-habits': 3,
      'nutrition-log': 4,
      'vitals': 5,
    };

    const normalizedResponses = Array.isArray(responses) ? responses : [];
    const nextDraftResponses = {
      ...questionnaireDraftResponsesByRoute,
      [routeId]: normalizedResponses,
    };

    setQuestionnaireDraftResponsesByRoute(nextDraftResponses);

    const persistRoute = async (route) => {
      const targetCategory = getCategoryByRoute(route);
      const categoryId = Number(targetCategory?.category_id || 0);
      const assessmentInstanceId = Number(targetCategory?.assessment_instance_id || 0);
      const routeResponses = Array.isArray(nextDraftResponses[route]) ? nextDraftResponses[route] : [];

      if (categoryId <= 0 || assessmentInstanceId <= 0 || routeResponses.length === 0) {
        return;
      }

      try {
        await submitQuestionnaireResponses(assessmentInstanceId, categoryId, routeResponses);
      } catch (error) {
        console.error(`Failed to submit questionnaire responses for ${route}:`, error);
      }
    };

    // Persist this step immediately so answers are not lost if the user drops off before vitals
    // or if a later batch step fails silently.
    if (normalizedResponses.length > 0) {
      await persistRoute(routeId);
    }

    if (routeId === 'vitals') {
      const submissionOrder = ['anthropometry', 'family-history', 'lifestyle-habits', 'nutrition-log', 'vitals'];

      for (const route of submissionOrder) {
        await persistRoute(route);
      }
    }

    const progressValue = routeProgressMap[routeId] || 0;
    setQuestionnaireProgress((prev) => Math.max(prev, progressValue));
    setExpandedQuestionnaireStep(null);
  };

  const handleStepDraftSave = async (routeId, responses = []) => {
    const normalizedResponses = Array.isArray(responses) ? responses : [];

    setQuestionnaireDraftResponsesByRoute((prev) => ({
      ...prev,
      [routeId]: normalizedResponses,
    }));

    const targetCategory = getCategoryByRoute(routeId);
    const categoryId = Number(targetCategory?.category_id || 0);
    const assessmentInstanceId = Number(targetCategory?.assessment_instance_id || 0);

    if (categoryId <= 0 || assessmentInstanceId <= 0 || normalizedResponses.length === 0) {
      return;
    }

    try {
      await submitQuestionnaireResponses(assessmentInstanceId, categoryId, normalizedResponses);
    } catch (error) {
      console.error(`Failed to autosave questionnaire responses for ${routeId}:`, error);
    }
  };

  const initializeQuestionnaire = async () => {
    try {
      const context = await loadQuestionnaireContext();
      const categories = context?.categories || [];
      const draftResponsesByRoute = getDraftResponsesByRouteFromContext(
        categories,
        context?.responsesByCategoryId || {}
      );

      setQuestionnaireCurrentAssessment(context?.assessment || null);
      setQuestionnaireAssessments(Array.isArray(context?.assessments) ? context.assessments : []);
      setQuestionnaireSteps(categories);
      setQuestionnaireQuestionsByCategoryId(context?.questionsByCategoryId || {});
      setQuestionnaireDraftResponsesByRoute(draftResponsesByRoute);

      const completedProgress = getProgressFromCategories(categories);
      setQuestionnaireProgress(completedProgress);
      setExpandedQuestionnaireStep(null);
    } catch (error) {
      setQuestionnaireSteps([]);
      setQuestionnaireCurrentAssessment(null);
      setQuestionnaireAssessments([]);
      setQuestionnaireQuestionsByCategoryId({});
      setQuestionnaireProgress(0);
      setQuestionnaireDraftResponsesByRoute({});
      console.error('Failed to load questionnaire context:', error);
    }
  };

  const handleOpenB2bHealthAssessment = () => {
    try {
      sessionStorage.setItem('ss_b2b_opened_questionnaire', '1');
    } catch {
      // private mode / disabled storage
    }
    setHealthAssessmentBackPage('home');
    setCurrentPage('health-assessment');
    setIsB2bQuestionnaireFlow(true);
    initializeQuestionnaire();
  };

  useEffect(() => {
    const trySessionRestore = async () => {
      const refreshTokenValue = getRefreshToken();

      if (!refreshTokenValue) {
        setCurrentPage('splash');
        setIsBootstrappingSession(false);
        return;
      }

      try {
        const refreshResponse = await refreshToken(refreshTokenValue);
        const tokens = extractTokensFromResponse(refreshResponse, refreshTokenValue);
        saveAuthTokens(tokens);
      } catch (error) {
        console.error('Token refresh failed:', error);
        clearAuthTokens();
        setCurrentPage('login');
        setIsBootstrappingSession(false);
        return;
      }

      try {
        const profileResponse = await getMyProfile({ forceRefresh: true });
        const profile = profileResponse?.data && typeof profileResponse.data === 'object'
          ? profileResponse.data
          : profileResponse;
        setUserName(profile?.first_name || '');
        setEmployerOrganizerName(deriveEmployerOrganizerName(profile));
        setUserAge(getAgeFromProfile(profile));

        const activeUserId = Number(profile?.user_id || 0);
        const normalizedCurrentUserId = activeUserId > 0 ? activeUserId : null;
        setCurrentUserId(normalizedCurrentUserId);

        const linkedProfilesResponse = await getMyProfiles({ forceRefresh: true });
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
          setIsBootstrappingSession(false);
          return;
        }

        if (postLoginRedirectPageRef.current) {
          const targetPage = postLoginRedirectPageRef.current;
          postLoginRedirectPageRef.current = '';
          setCurrentPage(targetPage);
          setIsBootstrappingSession(false);
          return;
        }
      } catch (bootstrapError) {
        console.error('Session bootstrap fallback due to non-auth error:', bootstrapError);
      }

      await preloadHomeScreenData();
      setCurrentPage('health-insights');
      setIsBootstrappingSession(false);
    };

    trySessionRestore();
  }, []);

  // Warm up the four NavBar destination chunks at idle so the first tap after
  // app load doesn't pay the code-split fetch cost. React.lazy() shares the
  // module cache with these manual import() calls, so navigation becomes
  // effectively instant.
  useEffect(() => {
    const requestIdle = window.requestIdleCallback
      || ((cb) => window.setTimeout(cb, 300));
    const cancelIdle = window.cancelIdleCallback || window.clearTimeout;

    const handle = requestIdle(() => {
      prefetchNavbarRoutes();
    });

    return () => {
      if (handle != null) {
        cancelIdle(handle);
      }
    };
  }, []);

  useEffect(() => {
    const userAgent = window.navigator.userAgent || '';
    const isIosDevice = /iPhone|iPad|iPod/i.test(userAgent)
      || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    const isStandalone = (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches)
      || window.navigator.standalone === true;

    if (!isStandalone) {
      setIsIosInstallFlow(isIosDevice);
      setShowInstallPrompt(true);
    } else {
      setIsIosInstallFlow(false);
      setShowInstallPrompt(false);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsIosInstallFlow(false);
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
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response: ${outcome}`);

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismissInstall = () => {
    setShowInstallPrompt(false);
  };

  const handleInstallGotIt = async () => {
    if (!isIosInstallFlow && deferredPrompt) {
      await handleInstallClick();
      return;
    }
    handleDismissInstall();
  };

  const handleQuestionnaireSuccessOk = () => {
    try {
      if (isB2bQuestionnaireFlow) {
        localStorage.setItem('ss_b2b_questionnaire_submitted', '1');
        sessionStorage.setItem('ss_b2b_post_submit_redirect', '1');
      }
      sessionStorage.removeItem('ss_b2b_opened_questionnaire');
    } catch {
      // ignore storage issues and continue navigation
    }
    setIsB2bQuestionnaireFlow(false);
    setQuestionnaireSuccessMessage(null);
    setCurrentPage('home');
    setForceHomeApiRefresh(true);
  };

  const preloadHomeScreenData = async () => {
    setPreloadedHomeData(null);

    try {
      const { response } = await fetchLatestAssessmentReport(
        (assessmentId) => `/reports/${assessmentId}/overview`
      );
      const overview = resolveOverviewPayload(response);

      if (overview && typeof overview === 'object') {
        const metabolicAge = Number(overview?.metabolic_age);
        const metabolicAgeDisplay = Number.isFinite(metabolicAge) ? String(Math.round(metabolicAge)) : '-';
        
        setPreloadedHomeData({
          metabolicAgeValue: metabolicAgeDisplay,
          positiveWinsData: overview?.positive_wins && typeof overview.positive_wins === 'object' ? overview.positive_wins : null,
          riskAnalysisData: Array.isArray(overview?.risk_analysis) ? overview.risk_analysis : [],
        });
        return true;
      } else {
        setPreloadedHomeData(null);
        return false;
      }
    } catch (err) {
      console.error('Failed to preload home screen data:', err);
      setPreloadedHomeData(null);
      return false;
    }
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
      setEmployerOrganizerName(deriveEmployerOrganizerName(profile));
      setUserAge(getAgeFromProfile(profile));

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

      if (postLoginRedirectPageRef.current) {
        const targetPage = postLoginRedirectPageRef.current;
        postLoginRedirectPageRef.current = '';
        setCurrentPage(targetPage);
        return;
      }
    } catch (profileError) {
      console.error('Failed to fetch user profile:', profileError);
    }

    await preloadHomeScreenData();
    setCurrentPage('health-insights');
  };

  const handleAccountSelectionStart = async (targetAccountId) => {
    const parsedTargetId = Number(targetAccountId || 0);
    if (parsedTargetId <= 0) {
      await preloadHomeScreenData();
      setCurrentPage('health-insights');
      return;
    }

    const shouldSwitch = currentUserId && parsedTargetId !== Number(currentUserId);

    try {
      if (shouldSwitch) {
        const switchResponse = await switchAccount(parsedTargetId);
        const tokens = extractTokensFromResponse(switchResponse);
        saveAuthTokens(tokens);
        invalidateMyProfileCache();
        invalidateMyProfilesCache();
        clearReportRequestCache();
        clearStoredLatestAssessmentId();
      }

      const profileResponse = await getMyProfile({ forceRefresh: true });
      const profile = profileResponse?.data && typeof profileResponse.data === 'object'
        ? profileResponse.data
        : profileResponse;

      setUserName(profile?.first_name || '');
      setEmployerOrganizerName(deriveEmployerOrganizerName(profile));
      setUserAge(getAgeFromProfile(profile));
      const refreshedUserId = Number(profile?.user_id || 0);
      setCurrentUserId(refreshedUserId > 0 ? refreshedUserId : null);
      setSelectedAccountId(parsedTargetId);
    } catch (error) {
      console.error('Failed to enter selected account:', error);
    }

    if (postLoginRedirectPageRef.current) {
      const targetPage = postLoginRedirectPageRef.current;
      postLoginRedirectPageRef.current = '';
      setCurrentPage(targetPage);
      return;
    }

    await preloadHomeScreenData();
    setCurrentPage('health-insights');
  };

  const handleLogout = async () => {
    const refreshTokenValue = getRefreshToken();

    await logout(refreshTokenValue);

    clearAuthTokens();
    clearReportRequestCache();
    clearStoredLatestAssessmentId();
    setPhoneNumber('');
    setUserAge(null);
    setQuestionnaireSteps([]);
    setQuestionnaireCurrentAssessment(null);
    setQuestionnaireAssessments([]);
    setQuestionnaireQuestionsByCategoryId({});
    setQuestionnaireProgress(0);
    setExpandedQuestionnaireStep(null);
    setQuestionnaireDraftResponsesByRoute({});
    setPreloadedHomeData(null);
    setUserName('');
    setEmployerOrganizerName('');
    try {
      sessionStorage.removeItem('ss_b2b_opened_questionnaire');
    } catch {
      // ignore
    }
    setCurrentPage('login');
  };

  const getPossessiveLabel = (name) => {
    const trimmed = String(name || '').trim();
    if (!trimmed) {
      return 'Your';
    }
    return trimmed.toLowerCase().endsWith('s') ? `${trimmed}'` : `${trimmed}'s`;
  };

  const handleCreateCustomPackage = (payload = {}) => {
    setPendingCustomPackagePayload({
      selectedCount: Number(payload.selectedCount || 0),
      selectedParameters: Number(payload.selectedParameters || 0),
      selectedTests: Array.isArray(payload.selectedTests) ? payload.selectedTests.filter(Boolean) : [],
      totalSale: Number(payload.totalSale || 0),
      totalOld: Number(payload.totalOld || 0),
      offText: String(payload.offText || ''),
    });

    setCurrentPage('review-package');
  };

  const handleCustomPackageBookingConfirmed = () => {
    const payload = pendingCustomPackagePayload || {};
    const selectedTests = Array.isArray(payload.selectedTests)
      ? payload.selectedTests.filter(Boolean)
      : [];

    setCustomPackageCard({
      id: `custom-${Date.now()}`,
      theme: 'custom',
      badges: ['Custom Built', 'Male', 'Female'],
      title: `${getPossessiveLabel(userName)} Custom Package`,
      chips: selectedTests.length > 0 ? selectedTests.slice(0, 4) : ['General health', 'Progressive tests'],
      metrics: {
        parameters: String(Math.max(1, Number(payload.selectedParameters || 0))),
        reportsIn: '24-48 hrs',
        fasting: '10-12 hrs',
      },
      pricing: {
        now: Number(payload.totalSale || 0),
        old: Number(payload.totalOld || 0),
        off: payload.offText || '',
      },
    });

    setPendingCustomPackagePayload(null);
    setCurrentPage('packages');
  };

  const tooltipTourScopeKey = String(selectedAccountId || currentUserId || 'global');
  const isTooltipEligibleHome = Boolean(preloadedHomeData);
  const canDirectInstallPwa = Boolean(deferredPrompt) && !isIosInstallFlow;

  if (isBootstrappingSession) {
    return null;
  }

  return (
    <div
      className="app-root"
      onTouchStart={handleEdgeSwipeStart}
      onTouchMove={handleEdgeSwipeMove}
      onTouchEnd={handleEdgeSwipeEnd}
      onTouchCancel={handleEdgeSwipeCancel}
    >
      <div className="app-background" aria-hidden="true" />
      {/* PWA Install Prompt Banner - Fixed outside scroll container */}
      {showInstallPrompt && (
        <div className="app-install-popup-wrap" role="dialog" aria-live="polite" aria-label="Install app">
            <button
              type="button"
              className="app-install-popup-close"
              onClick={handleDismissInstall}
              aria-label="Close install popup"
            >
              ×
            </button>
            <div className="app-install-popup-card">
              <div className="app-install-popup-content">
                <div className="app-install-popup-title-row">
                  <span className="app-install-popup-title-icon" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 4v8M9 11l3 3 3-3M7 17h10"
                        stroke="currentColor"
                        strokeWidth="1.65"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <p className="app-install-popup-title">Install SuperShyft App</p>
                </div>
                <p className="app-install-popup-body">
                  {canDirectInstallPwa ? (
                    <>
                      Install SuperShyft on your device for a better experience with offline access and faster loading.
                    </>
                  ) : isIosInstallFlow ? (
                    <>
                      (Tap the <strong className="app-install-popup-share-word">Share</strong> button{' '}
                      <span className="app-install-popup-share-glyph" aria-hidden="true">
                        ⎋
                      </span>{' '}
                      at the bottom, then select &quot;Add to Home Screen&quot; to install SuperMom).
                    </>
                  ) : (
                    <>When your browser offers it, use Install or add this site to your home screen to install SuperShyft.</>
                  )}
                </p>
                <button
                  type="button"
                  className={`app-install-popup-got-it${canDirectInstallPwa ? ' app-install-popup-got-it--install' : ''}`}
                  onClick={handleInstallGotIt}
                >
                  {canDirectInstallPwa ? 'Install Now' : 'Got it'}
                </button>
              </div>
            </div>
        </div>
      )}
      <AppTooltipTour currentPage={currentPage} enabled={isTooltipEligibleHome} scopeKey={tooltipTourScopeKey} />
      <div className="app-scroll" ref={appScrollRef}>
      <Suspense fallback={null}>
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
          userAge={userAge}
          employerOrganizerFallback={employerOrganizerName}
          preloadedData={preloadedHomeData}
          forceRefreshFromProfile={forceHomeApiRefresh}
          onNavigateToHealthScan={() => {
            console.log('Navigate to Health Span Index');
            setSelectedHealthScanTab(0);
            setCurrentPage('health-scan-index');
          }}
          onNavigateToHealthScanTab={(tabIndex) => {
            console.log('Navigate to Health Span Index tab:', tabIndex);
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
            setIsB2bQuestionnaireFlow(false);
            setHealthAssessmentBackPage('home');
            setCurrentPage('health-assessment');
            initializeQuestionnaire();
          }}
          onOpenB2bHealthAssessment={handleOpenB2bHealthAssessment}
          onNavigateToBloodMarkers={() => {
            console.log('Navigate to Blood Markers');
            setCurrentPage('blood-markers');
          }}
          onNavigateToPackages={() => {
            console.log('Navigate to Packages');
            setCurrentPage('packages');
          }}
          onNavigateToDoctors={() => {
            console.log('Navigate to Doctors');
            setCurrentPage('doctors');
          }}
          onNavigateToSuperClub={() => {
            setCurrentPage('super-club');
          }}
        />
      )}

      {currentPage === 'super-club' && (
        <SuperClubPlaylistPage
          userName={userName}
          onMenuClick={() => {
            setCurrentPage('profile');
          }}
          onSearchClick={() => {
            setHealthAssessmentBackPage('super-club');
            setCurrentPage('health-assessment');
            initializeQuestionnaire();
          }}
          onNavigateHome={() => {
            setCurrentPage('home');
          }}
          onNavigateToDoctors={() => {
            setCurrentPage('doctors');
          }}
          onNavigateToPackages={() => {
            setCurrentPage('packages');
          }}
          onJoinEarly={() => {
            setCurrentPage('super-club-swipe');
          }}
        />
      )}

      {currentPage === 'super-club-swipe' && (
        <SuperClubPage
          userName={userName}
          onMenuClick={() => {
            setCurrentPage('profile');
          }}
          onSearchClick={() => {
            setHealthAssessmentBackPage('super-club-swipe');
            setCurrentPage('health-assessment');
            initializeQuestionnaire();
          }}
          onNavigateHome={() => {
            setCurrentPage('home');
          }}
          onNavigateToDoctors={() => {
            setCurrentPage('doctors');
          }}
          onNavigateToPackages={() => {
            setCurrentPage('packages');
          }}
          onOnboardingComplete={(likedIds) => {
            setSuperClubLikedSportIds(Array.isArray(likedIds) ? likedIds : []);
            setCurrentPage('super-club-2');
          }}
        />
      )}

      {currentPage === 'super-club-2' && (
        <SuperClubPage2
          userName={userName}
          likedSports={getSuperClubSportsByIds(superClubLikedSportIds)}
          onMenuClick={() => {
            setCurrentPage('profile');
          }}
          onSearchClick={() => {
            setHealthAssessmentBackPage('super-club-2');
            setCurrentPage('health-assessment');
            initializeQuestionnaire();
          }}
          onNavigateHome={() => {
            setCurrentPage('home');
          }}
          onNavigateToDoctors={() => {
            setCurrentPage('doctors');
          }}
          onNavigateToPackages={() => {
            setCurrentPage('packages');
          }}
          onStayUpdated={() => {
            setCurrentPage('home');
          }}
          onSelectSport={() => {}}
        />
      )}

      {currentPage === 'packages' && (
        <PackagesPage
          customPackageCard={customPackageCard}
          onNavigateHome={() => {
            console.log('Back to Home');
            setCurrentPage('home');
          }}
          onNavigateToSuperClub={() => {
            setCurrentPage('super-club');
          }}
          onNavigateToDoctors={() => {
            console.log('Navigate to Doctors');
            setCurrentPage('doctors');
          }}
          onOpenPackageDetails={(pkg) => {
            setSelectedPackageCard(pkg || null);
            console.log('Navigate to Package Details');
            setCurrentPage('package-details');
          }}
          onOpenCreateCustomPackage={() => {
            console.log('Navigate to Create Custom Package');
            setCurrentPage('create-custom-package');
          }}
        />
      )}

      {currentPage === 'doctors' && (
        <DoctorsPage
          onBack={() => {
            console.log('Back to Home');
            setCurrentPage('home');
          }}
          onNavigateToSuperClub={() => {
            setCurrentPage('super-club');
          }}
          onOpenPackages={() => {
            console.log('Navigate to Packages');
            setCurrentPage('packages');
          }}
          onOpenDoctorProfile={() => {
            console.log('Navigate to Doctor Expert Details');
            setCurrentPage('expert-details-doctor');
          }}
          onOpenNutritionistProfile={() => {
            console.log('Navigate to Nutritionist Expert Details');
            setCurrentPage('expert-details-nutritionist');
          }}
          onOpenIntegratedProfile={() => {
            console.log('Navigate to Integrated Health Program');
            setCurrentPage('integrated-health-program');
          }}
        />
      )}

      {currentPage === 'integrated-health-program' && (
        <IntegratedHealthProgramPage
          onBack={() => {
            console.log('Back to Doctors');
            setCurrentPage('doctors');
          }}
        />
      )}

      {currentPage === 'expert-details-doctor' && (
        <ExpertDetailsPage
          expertType="doctor"
          onBack={() => {
            console.log('Back to Doctors');
            setCurrentPage('doctors');
          }}
        />
      )}

      {currentPage === 'expert-details-nutritionist' && (
        <ExpertDetailsPage
          expertType="nutritionist"
          onBack={() => {
            console.log('Back to Doctors');
            setCurrentPage('doctors');
          }}
        />
      )}

      {currentPage === 'package-details' && (
        <PackageDetailsPage
          packageId={selectedPackageCard?.apiData?.diagnostic_package_id || selectedPackageCard?.id || null}
          packageCard={selectedPackageCard}
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
          onCreatePackage={handleCreateCustomPackage}
        />
      )}

      {currentPage === 'review-package' && (
        <PackageDetailsPage
          variant="custom-review"
          profileName={userName}
          onCustomBookingConfirmed={handleCustomPackageBookingConfirmed}
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
          initialResponsesByRoute={questionnaireDraftResponsesByRoute}
          onStepComplete={handleStepComplete}
          onStepDraftSave={handleStepDraftSave}
          onAssessmentSubmit={async () => {
            const targetAssessmentInstanceId = Number(
              questionnaireCurrentAssessment?.assessment_instance_id
              || questionnaireCurrentAssessment?.assessment_id
              || questionnaireCurrentAssessment?.id
              || 0
            );

            const sourceIds = getAssessmentSourceIdsForTarget(targetAssessmentInstanceId);

            try {
              if (targetAssessmentInstanceId > 0 && sourceIds.length > 0) {
                try {
                  await submitAssessment(targetAssessmentInstanceId, sourceIds);
                  try {
                    if (isB2bQuestionnaireFlow) {
                      localStorage.setItem('ss_b2b_questionnaire_submitted', '1');
                    }
                    sessionStorage.removeItem('ss_b2b_opened_questionnaire');
                  } catch {
                    // ignore
                  }
                  clearReportRequestCache();
                  clearStoredLatestAssessmentId();
                } catch (error) {
                  console.error('Assessment submit failed:', error);
                }
              }
            } finally {
              setQuestionnaireSuccessMessage('Submitted successfully!');
            }
          }}
          onNavigateHome={() => {
            setQuestionnaireSuccessMessage(null);
            setCurrentPage('home');
          }}
          onBack={() => {
            setCurrentPage(healthAssessmentBackPage || 'home');
          }}
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
          onAccountSwitched={(payload = {}) => {
            const switchedProfile = payload?.profile && typeof payload.profile === 'object'
              ? payload.profile
              : null;

            setUserName(switchedProfile?.first_name || '');
            setEmployerOrganizerName(deriveEmployerOrganizerName(switchedProfile));
            setUserAge(getAgeFromProfile(switchedProfile));

            const switchedUserId = Number(switchedProfile?.user_id || 0);
            const normalizedSwitchedUserId = switchedUserId > 0 ? switchedUserId : null;
            setCurrentUserId(normalizedSwitchedUserId);
            setSelectedAccountId(normalizedSwitchedUserId);

            const linkedProfiles = Array.isArray(payload?.linkedProfiles) ? payload.linkedProfiles : [];
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
                  : accountId === normalizedSwitchedUserId
                    ? 'Primary Account'
                    : 'Linked Account';

                return {
                  id: accountId,
                  name: [firstName, lastName].filter(Boolean).join(' ') || 'User',
                  relationshipLabel,
                  gender: item?.gender || '',
                  isPrimary: relationship.toLowerCase() === 'primary account' || accountId === normalizedSwitchedUserId,
                };
              })
              .filter(Boolean);

            setLinkedAccounts(normalizedLinkedAccounts);
            clearReportRequestCache();
            clearStoredLatestAssessmentId();
            setPreloadedHomeData(null);
            setForceHomeApiRefresh(true);
          }}
          onBack={() => {
            console.log('Back to Home');
            clearReportRequestCache();
            clearStoredLatestAssessmentId();
            setForceHomeApiRefresh(true);
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
          onOpenHealthAssessment={() => {
            console.log('Navigate to Health Assessment');
            setIsB2bQuestionnaireFlow(false);
            setHealthAssessmentBackPage('profile');
            setCurrentPage('health-assessment');
            initializeQuestionnaire();
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
          onOpenPrivacy={() => {
            console.log('Navigate to Privacy Policy');
            setCurrentPage('privacy-policy');
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
          currentUserId={currentUserId}
          linkedAccounts={linkedAccounts}
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

      {currentPage === 'privacy-policy' && (
        <PrivacyPolicyPage
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
      </Suspense>
      </div>
      {Boolean(questionnaireSuccessMessage) && (
        <div
          className="questionnaire-success-overlay"
          role="alertdialog"
          aria-modal="true"
          aria-live="polite"
          aria-labelledby="questionnaire-success-title"
          onClick={handleQuestionnaireSuccessOk}
        >
          <div
            className="questionnaire-success-modal"
            style={{
              backgroundImage: `url(${questionnaireSuccessModalBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="questionnaire-success-close"
              onClick={handleQuestionnaireSuccessOk}
              aria-label="Close"
            >
              ×
            </button>
            <h3 id="questionnaire-success-title" className="questionnaire-success-title">
              {questionnaireSuccessMessage}
            </h3>
            <p className="questionnaire-success-description">
              You can review your results from the home screen anytime.
            </p>
            <div className="questionnaire-success-actions">
              <button
                type="button"
                className="questionnaire-success-btn questionnaire-success-btn--ok"
                onClick={handleQuestionnaireSuccessOk}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
