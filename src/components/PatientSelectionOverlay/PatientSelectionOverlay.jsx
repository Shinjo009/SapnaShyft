import React, { useEffect, useMemo, useRef, useState } from 'react';
import './PatientSelectionOverlay.css';
import maleAvatar from '../../images/male-avatar.png';
import femaleAvatar from '../../images/female-avatar.png';
import { getMyProfiles, createMySubProfile } from '../../services/usersService';
import { getMyProfile } from '../../services/profileService';
import { listDiagnosticPackages } from '../../services/diagnosticPackagesService';
import {
  loadRazorpayScript,
  createPackageRazorpayOrder,
  verifyPackageRazorpayPayment,
  getDefaultRazorpayKeyId,
} from '../../services/paymentService';
import { PAYMENT_DEMO_MODE, BACKEND_ENABLED } from '../../config/appConfig';

const PATIENTS = [];

const PACKAGE_FILTERS = ['Full Body', 'Diabetes', 'Women Health', 'Cancer', 'Kidney'];

const CUSTOM_TEST_FILTERS = ['General Health', 'Progressive Tests', 'Hormones', 'Vitamins', 'Cancer', 'Allergies'];

const CUSTOM_TEST_CARDS = [
  {
    id: 'thyroid-tests',
    title: 'Thyroid Tests',
    salePrice: 249,
    oldPrice: 449,
    tags: ['General Health'],
    tests: ['Bilirubin', 'Albumin', 'SGOT', 'SGPT', 'ALP'],
  },
  {
    id: 'liver-function',
    title: 'Liver Function',
    salePrice: 149,
    oldPrice: 349,
    tags: ['General Health'],
    tests: ['Bilirubin', 'Albumin', 'SGOT', 'SGPT', 'ALP'],
  },
  {
    id: 'liver-function-plus',
    title: 'Liver Function',
    salePrice: 349,
    oldPrice: 549,
    tags: ['General Health'],
    tests: ['Bilirubin', 'Albumin', 'SGOT', 'SGPT', 'ALP'],
  },
];

const PACKAGE_OPTIONS = [
  {
    id: 'advanced',
    name: 'Advanced Wellness Panel',
    currentPrice: 1999,
    oldPrice: 2999,
    offPercent: 33,
    parameters: '92 parameters',
    rating: '4.7 (12k)',
    recommended: 'Doctor Recommended',
    searchTags: ['full body', 'wellness', 'doctor', 'health goals'],
  },
  {
    id: 'basic',
    name: 'Basic Health Checkup',
    currentPrice: 999,
    oldPrice: 1499,
    offPercent: 33,
    parameters: '45 parameters',
    rating: '4.5 (8k)',
    recommended: '',
    searchTags: ['full body', 'basic', 'health'],
  },
  {
    id: 'diabetes-care',
    name: 'Diabetes Care Panel',
    currentPrice: 1499,
    oldPrice: 2299,
    offPercent: 35,
    parameters: '68 parameters',
    rating: '4.6 (9k)',
    recommended: 'Doctor Recommended',
    searchTags: ['diabetes', 'sugar', 'hba1c', 'health goals'],
  },
  {
    id: 'kidney-plus',
    name: 'Kidney Plus Profile',
    currentPrice: 1799,
    oldPrice: 2699,
    offPercent: 33,
    parameters: '74 parameters',
    rating: '4.8 (6k)',
    recommended: 'Doctor Recommended',
    searchTags: ['kidney', 'renal', 'creatinine', 'full body'],
  },
];

const MISSING_VALUE = '-';

const mapDiagnosticPackageToOverlayCard = (pkg, index) => {
  const id = String(pkg?.diagnostic_package_id || pkg?.id || `pkg-${index}`).trim();
  const name = String(pkg?.package_name || '').trim() || MISSING_VALUE;
  const currentPrice = Number(pkg?.price || 0);
  const oldPrice = Number(pkg?.original_price || 0);
  const offPercent = pkg?.discount_percent ? Math.round(Number(pkg.discount_percent)) : (oldPrice > 0 && currentPrice < oldPrice ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100) : 0);
  const testsCount = Number(pkg?.tests_count || pkg?.parameters_count || 0);
  const parameters = testsCount > 0 ? `${testsCount} parameters` : MISSING_VALUE;
  const rating = MISSING_VALUE;
  const recommended = pkg?.is_most_popular ? 'Most Popular' : '';
  
  const tagLabels = Array.isArray(pkg?.tags)
    ? pkg.tags.map((tag) => {
        if (typeof tag === 'string') return tag.toLowerCase();
        return String(tag?.tag_name || tag?.name || '').toLowerCase();
      }).filter(Boolean).slice(0, 3)
    : [];
  
  const searchTags = [name.toLowerCase(), ...tagLabels];

  return {
    id,
    name,
    currentPrice: currentPrice > 0 ? currentPrice : 0,
    oldPrice: oldPrice > 0 ? oldPrice : currentPrice,
    offPercent,
    parameters,
    rating,
    recommended,
    searchTags,
    apiData: pkg,
  };
};

const MaleIcon = () => <img src={maleAvatar} alt="" aria-hidden="true" className="patient-select-overlay__avatar-image" />;

const FemaleIcon = () => <img src={femaleAvatar} alt="" aria-hidden="true" className="patient-select-overlay__avatar-image" />;

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M16.3767 4.40976C17.2936 3.49312 17.2938 2.00455 16.3771 1.08768C15.4605 0.170807 13.9719 0.170621 13.0551 1.08726L1.93339 12.2114C1.73991 12.4043 1.59682 12.6419 1.51673 12.9031L0.415893 16.5298C0.372015 16.6766 0.412276 16.8357 0.520724 16.9439C0.629172 17.0522 0.788301 17.0922 0.93506 17.0481L4.56256 15.9481C4.82353 15.8687 5.06104 15.7265 5.25423 15.5339L16.3767 4.40976M11.2317 2.89976L14.5651 6.23309" stroke="white" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UncheckedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none" aria-hidden="true">
    <path d="M14.5 0.5H4.5C2.29086 0.5 0.5 2.29086 0.5 4.5V14.5C0.5 16.7091 2.29086 18.5 4.5 18.5H14.5C16.7091 18.5 18.5 16.7091 18.5 14.5V4.5C18.5 2.29086 16.7091 0.5 14.5 0.5Z" stroke="#CCCCCC" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="9" viewBox="0 0 12 9" fill="none" aria-hidden="true">
    <path d="M0.75 4.75L4.25 8.25L11.25 0.75" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect width="24" height="24" rx="12" fill="white" fillOpacity="0.1"/>
    <path d="M8.34687 12.875L13.2469 17.775L12 19L5 12L12 5L13.2469 6.225L8.34687 11.125H19V12.875H8.34687Z" fill="#9A9A9A"/>
  </svg>
);

const DownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect width="24" height="24" rx="12" fill="white" fillOpacity="0.1"/>
    <path d="M12 15L7 10H17L12 15Z" fill="#9A9A9A"/>
  </svg>
);

const UseSameCheckboxIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M3.33333 2C2.97971 2 2.64057 2.14048 2.39052 2.39052C2.14048 2.64057 2 2.97971 2 3.33333V12.6667C2 13.0203 2.14048 13.3594 2.39052 13.6095C2.64057 13.8595 2.97971 14 3.33333 14H12.6667C13.0203 14 13.3594 13.8595 13.6095 13.6095C13.8595 13.3594 14 13.0203 14 12.6667V3.33333C14 2.97971 13.8595 2.64057 13.6095 2.39052C13.3594 2.14048 13.0203 2 12.6667 2H3.33333ZM3.33333 3.33333H12.6667V12.6667H3.33333V3.33333ZM11.3 6.53C11.3637 6.4685 11.4145 6.39494 11.4494 6.3136C11.4843 6.23227 11.5027 6.14479 11.5035 6.05627C11.5043 5.96775 11.4874 5.87996 11.4539 5.79803C11.4204 5.7161 11.3709 5.64166 11.3083 5.57907C11.2457 5.51647 11.1712 5.46697 11.0893 5.43345C11.0074 5.39993 10.9196 5.38306 10.8311 5.38383C10.7425 5.3846 10.6551 5.40299 10.5737 5.43793C10.4924 5.47287 10.4188 5.52366 10.3573 5.58733L7.05733 8.88733L5.64333 7.47333C5.58144 7.41139 5.50795 7.36225 5.42706 7.32871C5.34617 7.29517 5.25947 7.2779 5.1719 7.27787C4.99506 7.2778 4.82543 7.34799 4.70033 7.473C4.57524 7.59801 4.50493 7.76758 4.50487 7.94443C4.5048 8.12128 4.57499 8.29091 4.7 8.416L6.53867 10.2547C6.60677 10.3228 6.68763 10.3768 6.77662 10.4137C6.86561 10.4506 6.961 10.4696 7.05733 10.4696C7.15367 10.4696 7.24905 10.4506 7.33805 10.4137C7.42704 10.3768 7.5079 10.3228 7.576 10.2547L11.3 6.53Z" fill="#9A9A9A"/>
  </svg>
);

const PackagePulseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="14" viewBox="0 0 16 14" fill="none" aria-hidden="true">
    <path d="M14.418 6.854H12.713C12.0955 6.85282 11.5528 7.22226 11.3861 7.75738L9.77047 12.9301C9.74908 12.9961 9.68186 13.0415 9.60547 13.0415C9.52908 13.0415 9.46186 12.9961 9.44047 12.9301L5.64547 0.777879C5.62408 0.711879 5.55686 0.666504 5.48047 0.666504C5.40408 0.666504 5.33686 0.711879 5.31547 0.777879L3.69984 5.95063C3.53381 6.48353 2.9948 6.85242 2.37984 6.854H0.667969" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SelectedRowPackageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path d="M14.0013 7.33317H12.348C11.7492 7.33189 11.223 7.72995 11.0613 8.3065L9.49464 13.8798C9.47389 13.9509 9.40871 13.9998 9.33464 13.9998C9.26056 13.9998 9.19538 13.9509 9.17464 13.8798L5.49464 0.786504C5.47389 0.715393 5.40871 0.666504 5.33464 0.666504C5.26056 0.666504 5.19538 0.715393 5.17464 0.786504L3.60797 6.35984C3.44696 6.93401 2.92429 7.33146 2.32797 7.33317H0.667969" stroke="#C4C4C4" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PackageSearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M15.7511 15.7501L12.4961 12.4951" stroke="#8B9496" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.25 8.25C2.25 11.5615 4.93851 14.25 8.25 14.25C11.5615 14.25 14.25 11.5615 14.25 8.25C14.25 4.93851 11.5615 2.25 8.25 2.25C4.93851 2.25 2.25 4.93851 2.25 8.25V8.25" stroke="#8B9496" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PackageTickIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="8" viewBox="0 0 11 8" fill="none" aria-hidden="true">
    <path d="M9.91536 0.583496L3.4987 7.00016L0.582031 4.0835" stroke="#8B9496" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PackageStarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
    <path d="M6.13934 0.755517C6.19149 0.650163 6.29887 0.583496 6.41642 0.583496C6.53398 0.583496 6.64136 0.650163 6.69351 0.755517L8.04101 3.48493C8.22096 3.8498 8.56886 4.10282 8.97142 4.1616L11.9849 4.6026C12.1014 4.61948 12.1982 4.70103 12.2346 4.81295C12.271 4.92488 12.2407 5.04777 12.1564 5.12993L9.97709 7.2521C9.68507 7.53625 9.55175 7.94602 9.62067 8.3476L10.1352 11.3459C10.1557 11.4624 10.1081 11.5804 10.0124 11.6498C9.91673 11.7193 9.7898 11.7282 9.68542 11.6726L6.99159 10.2563C6.63133 10.0669 6.20094 10.0669 5.84067 10.2563L3.14742 11.6726C3.04309 11.7278 2.9164 11.7188 2.82093 11.6494C2.72545 11.58 2.67786 11.4622 2.69826 11.3459L3.21217 8.34818C3.2813 7.94641 3.14797 7.53638 2.85576 7.2521L0.676424 5.13052C0.591439 5.04843 0.560668 4.92509 0.597136 4.81271C0.633605 4.70033 0.730936 4.61856 0.847924 4.60202L3.86084 4.1616C4.26384 4.10318 4.61224 3.85011 4.79242 3.48493L6.13934 0.755517" stroke="#8B9496" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PackageDoctorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
    <path d="M5.83203 0.583496V1.75016M2.33203 0.583496V1.75016M2.33203 1.16683H1.7487C1.1048 1.16683 0.582031 1.6896 0.582031 2.3335V4.66683C0.582031 6.59853 2.15033 8.16683 4.08203 8.16683C6.01373 8.16683 7.58203 6.59853 7.58203 4.66683V2.3335C7.58203 1.6896 7.05927 1.16683 6.41536 1.16683H5.83203" stroke="#8B9496" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PackageOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M5.83203 5.8335H14.1654V14.1668M5.83203 14.1668L14.1654 5.8335" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TestChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M7 10L12 15L17 10" stroke="#E8ECEC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TestChevronUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M17 14L12 9L7 14" stroke="#90DF9E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PreferredDateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M6.66797 1.66699V5.00033M13.3346 1.66699V5.00033" stroke="#9A9A9A" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M4.16667 3.3335H15.8333C16.7538 3.3335 17.5 4.07969 17.5 5.00016V16.6668C17.5 17.5873 16.7538 18.3335 15.8333 18.3335H4.16667C3.24619 18.3335 2.5 17.5873 2.5 16.6668V5.00016C2.5 4.07969 3.24619 3.3335 4.16667 3.3335V3.3335" stroke="#9A9A9A" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M2.5 8.3335H17.5" stroke="#9A9A9A" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
);

const PreferredTimeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="19" viewBox="0 0 20 19" fill="none" aria-hidden="true">
    <path d="M10 0C15.523 0 20 4.1045 20 9.16798C20 14.2315 15.523 18.336 10 18.336C4.477 18.336 0 14.2315 0 9.16798C0 4.1045 4.477 0 10 0ZM10 1.8336C7.87827 1.8336 5.84344 2.60632 4.34315 3.98179C2.84285 5.35725 2 7.22278 2 9.16798C2 11.1132 2.84285 12.9787 4.34315 14.3542C5.84344 15.7296 7.87827 16.5024 10 16.5024C12.1217 16.5024 14.1566 15.7296 15.6569 14.3542C17.1571 12.9787 18 11.1132 18 9.16798C18 7.22278 17.1571 5.35725 15.6569 3.98179C14.1566 2.60632 12.1217 1.8336 10 1.8336ZM10 3.66719C10.2449 3.66722 10.4813 3.74966 10.6644 3.89888C10.8474 4.0481 10.9643 4.25371 10.993 4.47672L11 4.58399V8.78842L13.707 11.2702C13.8863 11.4352 13.9905 11.6566 13.9982 11.8894C14.006 12.1222 13.9168 12.349 13.7488 12.5237C13.5807 12.6984 13.3464 12.8079 13.0935 12.83C12.8406 12.8521 12.588 12.7851 12.387 12.6426L12.293 12.5665L9.293 9.81615C9.13758 9.67354 9.03776 9.48794 9.009 9.28808L9 9.16798V4.58399C9 4.34084 9.10536 4.10765 9.29289 3.93571C9.48043 3.76378 9.73478 3.66719 10 3.66719Z" fill="#9A9A9A"/>
  </svg>
);

const DetailEditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path d="M8.82118 2.83842C9.27961 2.38011 9.2797 1.63582 8.82138 1.17738C8.36306 0.718949 7.61878 0.718855 7.16034 1.17717L1.59951 6.73926C1.50277 6.83572 1.43122 6.95448 1.39118 7.08509L0.840759 8.89843C0.81882 8.97184 0.83895 9.05137 0.893174 9.10551C0.947398 9.15965 1.02696 9.17965 1.10034 9.15759L2.91409 8.60759C3.04458 8.5679 3.16333 8.4968 3.25993 8.40051L8.82118 2.83842M6.24868 2.08342L7.91534 3.75009" stroke="white" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DetailLocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden="true">
    <path d="M8.4987 1.4165C5.38203 1.4165 2.83203 3.9665 2.83203 7.08317C2.83203 10.9082 7.79036 15.229 8.00286 15.4415C8.14453 15.5123 8.35703 15.5832 8.4987 15.5832C8.64036 15.5832 8.85286 15.5123 8.99453 15.4415C9.20703 15.229 14.1654 10.9082 14.1654 7.08317C14.1654 3.9665 11.6154 1.4165 8.4987 1.4165ZM8.4987 13.954C7.0112 12.5373 4.2487 9.4915 4.2487 7.08317C4.2487 4.74567 6.1612 2.83317 8.4987 2.83317C10.8362 2.83317 12.7487 4.74567 12.7487 7.08317C12.7487 9.42067 9.9862 12.5373 8.4987 13.954ZM8.4987 4.24984C6.94036 4.24984 5.66536 5.52484 5.66536 7.08317C5.66536 8.6415 6.94036 9.9165 8.4987 9.9165C10.057 9.9165 11.332 8.6415 11.332 7.08317C11.332 5.52484 10.057 4.24984 8.4987 4.24984ZM8.4987 8.49984C7.71953 8.49984 7.08203 7.86234 7.08203 7.08317C7.08203 6.304 7.71953 5.6665 8.4987 5.6665C9.27786 5.6665 9.91536 6.304 9.91536 7.08317C9.91536 7.86234 9.27786 8.49984 8.4987 8.49984Z" fill="#CCCCCC"/>
  </svg>
);

const DetailCityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M14.3013 7.4847H13.3746C13.2535 6.22441 12.6977 5.04553 11.8024 4.15027C10.9071 3.25501 9.72826 2.69915 8.46797 2.57803V1.65137C8.46797 1.51876 8.41529 1.39158 8.32152 1.29781C8.22775 1.20405 8.10058 1.15137 7.96797 1.15137C7.83536 1.15137 7.70818 1.20405 7.61442 1.29781C7.52065 1.39158 7.46797 1.51876 7.46797 1.65137V2.57803C6.2132 2.7052 5.04144 3.26388 4.15268 4.15872C3.26392 5.05355 2.71325 6.22909 2.59464 7.4847H1.66797C1.60231 7.4847 1.53729 7.49763 1.47663 7.52276C1.41596 7.54789 1.36084 7.58472 1.31442 7.63115C1.26799 7.67758 1.23116 7.7327 1.20603 7.79336C1.1809 7.85402 1.16797 7.91904 1.16797 7.9847C1.16797 8.05036 1.1809 8.11538 1.20603 8.17604C1.23116 8.2367 1.26799 8.29182 1.31442 8.33825C1.36084 8.38468 1.41596 8.42151 1.47663 8.44664C1.53729 8.47177 1.60231 8.4847 1.66797 8.4847H2.59464C2.71575 9.74499 3.27161 10.9239 4.16687 11.8191C5.06214 12.7144 6.24101 13.2703 7.5013 13.3914V14.318C7.5013 14.4506 7.55398 14.5778 7.64775 14.6716C7.74152 14.7654 7.86869 14.818 8.0013 14.818C8.13391 14.818 8.26109 14.7654 8.35486 14.6716C8.44862 14.5778 8.5013 14.4506 8.5013 14.318V13.3914C9.76113 13.269 10.9393 12.7128 11.8343 11.8177C12.7294 10.9227 13.2856 9.74453 13.408 8.4847H14.3346C14.4003 8.4847 14.4653 8.47177 14.526 8.44664C14.5866 8.42151 14.6418 8.38468 14.6882 8.33825C14.7346 8.29182 14.7714 8.2367 14.7966 8.17604C14.8217 8.11538 14.8346 8.05036 14.8346 7.9847C14.8346 7.91904 14.8217 7.85402 14.7966 7.79336C14.7714 7.7327 14.7346 7.67758 14.6882 7.63115C14.6418 7.58472 14.5866 7.54789 14.526 7.52276C14.4653 7.49763 14.4003 7.4847 14.3346 7.4847H14.3013ZM7.96797 12.4114C7.09246 12.4114 6.23661 12.1517 5.50865 11.6653C4.78068 11.1789 4.21331 10.4876 3.87826 9.67871C3.54322 8.86984 3.45556 7.97979 3.62636 7.1211C3.79716 6.26241 4.21876 5.47365 4.83784 4.85457C5.45692 4.23549 6.24568 3.81389 7.10437 3.64309C7.96306 3.47229 8.85311 3.55995 9.66198 3.89499C10.4708 4.23004 11.1622 4.79741 11.6486 5.52538C12.135 6.25334 12.3946 7.10919 12.3946 7.9847C12.3946 9.15934 11.9285 10.286 11.0985 11.1172C10.2685 11.9484 9.14261 12.4163 7.96797 12.418V12.4114Z" fill="#CCCCCC"/>
    <path d="M10.9869 7.99152C10.9869 8.59042 10.8092 9.17586 10.4764 9.67373C10.1435 10.1716 9.67041 10.5595 9.11697 10.7884C8.56353 11.0173 7.95463 11.0769 7.36733 10.9595C6.78004 10.8422 6.24075 10.5533 5.81773 10.1293C5.39471 9.70537 5.10697 9.16545 4.99094 8.57789C4.87491 7.99034 4.9358 7.38157 5.1659 6.82864C5.39601 6.2757 5.78498 5.80346 6.28359 5.47169C6.7822 5.13992 7.36803 4.96353 7.96693 4.96485C8.36408 4.96485 8.75734 5.04319 9.12417 5.19537C9.49101 5.34756 9.82423 5.5706 10.1048 5.85174C10.3853 6.13288 10.6076 6.46659 10.759 6.83377C10.9103 7.20094 10.9878 7.59437 10.9869 7.99152Z" fill="#CCCCCC"/>
  </svg>
);

const DetailCalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M8 4V6M13 4V6" stroke="#CCCCCC" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.22222 5H14.7778C15.4528 5 16 5.49746 16 6.11111V13.8889C16 14.5025 15.4528 15 14.7778 15H6.22222C5.54721 15 5 14.5025 5 13.8889V6.11111C5 5.49746 5.54721 5 6.22222 5V5" stroke="#CCCCCC" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 8H16" stroke="#CCCCCC" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DetailClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M1.19922 6.0002C1.19922 8.64939 3.35003 10.8002 5.99922 10.8002C8.64841 10.8002 10.7992 8.64939 10.7992 6.0002C10.7992 3.351 8.64841 1.2002 5.99922 1.2002C3.35003 1.2002 1.19922 3.351 1.19922 6.0002Z" stroke="#CCCCCC" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 3V6L8 7" stroke="#CCCCCC" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ConfirmTickIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="18" viewBox="0 0 25 18" fill="none" aria-hidden="true">
    <path d="M23.0013 1.6665L8.33463 16.3332L1.66797 9.6665" stroke="#90DF9E" strokeWidth="3.33333" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SCHEDULE_DATES = [
  { id: 'mon-12', day: 'Mon', date: '12' },
  { id: 'tue-13', day: 'Tue', date: '13' },
  { id: 'wed-14', day: 'Wed', date: '14' },
  { id: 'thu-15', day: 'Thu', date: '15' },
];

const SCHEDULE_TIME_SLOTS = [
  ['06:00 AM', '06:30 AM', '07:00 AM'],
  ['07:30 AM', '08:00 AM', '08:30 AM'],
  ['09:00 AM', '09:30 AM', '10:00 AM'],
  ['10:30 AM', '11:00 AM', '11:30 AM'],
  ['12:00 PM', '12:30 PM', '01:00 PM'],
];

const DEFAULT_FORM_DATA = {
  firstName: 'Ramesh',
  lastName: 'Ramesh',
  relation: 'Spouse',
  age: '23',
  gender: 'Male',
  phone: '9987254209',
  email: 'abc.de@example.com',
};

const DEFAULT_ADDRESS_DATA = {
  house: '',
  area: '',
  landmark: '',
  city: '',
  pincode: '',
};

const getAgeFromProfile = (profile) => {
  if (typeof profile?.age === 'number' && profile.age > 0) {
    return String(profile.age);
  }

  if (!profile?.date_of_birth) {
    return '--';
  }

  const dob = new Date(profile.date_of_birth);
  if (Number.isNaN(dob.getTime())) {
    return '--';
  }

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }

  return age > 0 ? String(age) : '--';
};

const normalizeGenderType = (genderValue) => {
  const normalizedGender = String(genderValue || '').trim().toLowerCase();
  return normalizedGender.startsWith('f') ? 'female' : 'male';
};

const getRelationshipLabel = (value, fallback = 'Primary') => {
  const relationship = String(value || '').trim();
  if (!relationship) {
    return fallback;
  }

  return relationship.charAt(0).toUpperCase() + relationship.slice(1);
};

const mapProfileToPatient = (profile, relationshipFallback = 'Primary') => {
  const userId = Number(profile?.user_id || profile?.id || 0);
  if (userId <= 0) {
    return null;
  }

  const firstName = String(profile?.first_name || '').trim();
  const lastName = String(profile?.last_name || '').trim();
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'User';
  const age = getAgeFromProfile(profile);
  const genderType = normalizeGenderType(profile?.gender);
  const genderCode = genderType === 'female' ? 'F' : 'M';
  const relationship = getRelationshipLabel(profile?.relationship, relationshipFallback);

  return {
    id: `profile-${userId}`,
    name: fullName,
    meta: `${genderCode}, ${age}  |  ${relationship}`,
    gender: genderType,
  };
};

const buildAddressFromProfile = (profile) => {
  const addressText = String(profile?.address || '').trim();
  const addressParts = addressText
    ? addressText.split(',').map((part) => part.trim()).filter(Boolean)
    : [];
  const city = String(profile?.city || profile?.state || '').trim();
  const pincodeFromProfile = String(profile?.pincode || profile?.postal_code || '').trim();
  const pincodeFromAddress = addressText.match(/\b\d{6}\b/)?.[0] || '';

  return {
    house: addressParts[0] || '',
    area: addressParts[1] || '',
    landmark: addressParts[2] || '',
    city,
    pincode: pincodeFromProfile || pincodeFromAddress,
  };
};

const PatientSelectionOverlay = ({ open, onClose, customFlow = false }) => {
  const [view, setView] = useState('select');
  const [patients, setPatients] = useState(PATIENTS);
  const [profileData, setProfileData] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Full Body');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedPackageId, setSelectedPackageId] = useState('advanced');
  const [draftPackageId, setDraftPackageId] = useState('advanced');
  const [packageViewReturn, setPackageViewReturn] = useState('select');
  const [packageTargetName, setPackageTargetName] = useState('User');
  const [phoneSame, setPhoneSame] = useState(true);
  const [emailSame, setEmailSame] = useState(true);
  const [activeField, setActiveField] = useState('firstName');
  const [activeAddressField, setActiveAddressField] = useState('house');
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [addressData, setAddressData] = useState(DEFAULT_ADDRESS_DATA);
  const [savingPatient, setSavingPatient] = useState(false);
  const [selectedDateId, setSelectedDateId] = useState('mon-12');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('06:00 AM');
  const [customActiveFilter, setCustomActiveFilter] = useState('General Health');
  const [customSearchQuery, setCustomSearchQuery] = useState('');
  const [customExpandedIds, setCustomExpandedIds] = useState(() => new Set(['thyroid-tests', 'liver-function']));
  const [customSelectedIds, setCustomSelectedIds] = useState(() => new Set(['thyroid-tests', 'liver-function']));
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [confirmedBookingId, setConfirmedBookingId] = useState(null);
  const [packageCardsFromApi, setPackageCardsFromApi] = useState([]);
  const paymentSuccessRef = useRef(false);

  useEffect(() => {
    if (!open) {
      setView('select');
      setSelectedIds([]);
      setPaymentError(null);
      setPaymentSubmitting(false);
      setConfirmedBookingId(null);
      paymentSuccessRef.current = false;
    }
  }, [open]);

  useEffect(() => {
    if (view === 'payment') {
      setPaymentError(null);
    }
  }, [view]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let mounted = true;

    const loadPackagesData = async () => {
      try {
        if (BACKEND_ENABLED) {
          const packages = await listDiagnosticPackages();
          if (mounted && Array.isArray(packages)) {
            const transformedPackages = packages.map((pkg, idx) => mapDiagnosticPackageToOverlayCard(pkg, idx));
            setPackageCardsFromApi(transformedPackages);
          }
        }
      } catch (err) {
        setPackageCardsFromApi([]);
      }
    };

    const loadOverlayData = async () => {
      try {
        const [profileResponse, linkedProfilesResponse] = await Promise.all([getMyProfile(), getMyProfiles()]);

        const profile = profileResponse?.data && typeof profileResponse.data === 'object'
          ? profileResponse.data
          : profileResponse;
        const linkedProfiles = Array.isArray(linkedProfilesResponse?.data)
          ? linkedProfilesResponse.data
          : Array.isArray(linkedProfilesResponse)
            ? linkedProfilesResponse
            : [];

        if (!mounted) {
          return;
        }

        setProfileData(profile || null);

        const patientItems = [];
        const uniqueUserIds = new Set();
        const primaryPatient = mapProfileToPatient(profile, 'Primary');
        if (primaryPatient) {
          uniqueUserIds.add(primaryPatient.id);
          patientItems.push(primaryPatient);
        }

        linkedProfiles.forEach((item) => {
          const mapped = mapProfileToPatient(item, 'Member');
          if (!mapped || uniqueUserIds.has(mapped.id)) {
            return;
          }

          uniqueUserIds.add(mapped.id);
          patientItems.push(mapped);
        });

        setPatients(patientItems);

        const defaultAddress = buildAddressFromProfile(profile);
        await loadPackagesData();

        setAddressData((prev) => ({
          ...prev,
          ...defaultAddress,
        }));

        const phone = String(profile?.phone || '').trim();
        const email = String(profile?.email || '').trim();
        setFormData((prev) => ({
          ...prev,
          phone: phone || prev.phone,
          email: email || prev.email,
        }));
      } catch (error) {
        if (mounted) {
          setPatients([]);
        }
      }
    };

    loadOverlayData();

    return () => {
      mounted = false;
    };
  }, [open]);

  useEffect(() => {
    const { body, documentElement } = document;
    const appScroll = document.querySelector('.app-scroll');
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyWidth = body.style.width;
    const previousBodyTouchAction = body.style.touchAction;
    const previousHtmlOverflow = documentElement.style.overflow;
    const previousHtmlTouchAction = documentElement.style.touchAction;
    const previousAppScrollOverflow = appScroll ? appScroll.style.overflow : '';
    const previousAppScrollTouchAction = appScroll ? appScroll.style.touchAction : '';
    const previousAppScrollOverscroll = appScroll ? appScroll.style.overscrollBehavior : '';
    const scrollY = window.scrollY;

    if (open) {
      documentElement.style.overflow = 'hidden';
      documentElement.style.touchAction = 'none';
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.width = '100%';
      body.style.touchAction = 'none';

      if (appScroll) {
        appScroll.style.overflow = 'hidden';
        appScroll.style.touchAction = 'none';
        appScroll.style.overscrollBehavior = 'none';
      }
    }

    return () => {
      documentElement.style.overflow = previousHtmlOverflow;
      documentElement.style.touchAction = previousHtmlTouchAction;
      body.style.overflow = previousBodyOverflow;
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.width = previousBodyWidth;
      body.style.touchAction = previousBodyTouchAction;

      if (appScroll) {
        appScroll.style.overflow = previousAppScrollOverflow;
        appScroll.style.touchAction = previousAppScrollTouchAction;
        appScroll.style.overscrollBehavior = previousAppScrollOverscroll;
      }

      if (open) {
        window.scrollTo(0, scrollY);
      }
    };
  }, [open]);

  const selectedPackage = useMemo(
    () => PACKAGE_OPTIONS.find((item) => item.id === selectedPackageId) || PACKAGE_OPTIONS[0],
    [selectedPackageId],
  );
  const customPackageDisplayName = useMemo(() => {
    const profileName = [profileData?.first_name, profileData?.last_name]
      .map((value) => String(value || '').trim())
      .filter(Boolean)
      .join(' ')
      .trim();

    const displayName = profileName || 'User';
    const possessive = displayName.toLowerCase().endsWith('s') ? `${displayName}'` : `${displayName}'s`;
    return `${possessive} Custom Package`;
  }, [profileData]);

  const draftPackage = useMemo(
    () => PACKAGE_OPTIONS.find((item) => item.id === draftPackageId) || PACKAGE_OPTIONS[0],
    [draftPackageId],
  );

  const sourcePackages = packageCardsFromApi.length > 0 ? packageCardsFromApi : PACKAGE_OPTIONS;

  const filteredPackages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return sourcePackages;
    }

    return sourcePackages.filter((item) => {
      const inName = item.name.toLowerCase().includes(q);
      const inTags = item.searchTags.some((tag) => tag.toLowerCase().includes(q));
      return inName || inTags;
    });
  }, [searchQuery, sourcePackages]);

  const selectedCount = selectedIds.length;
  const canContinue = selectedCount > 0;

  const customSelectedCards = useMemo(
    () => CUSTOM_TEST_CARDS.filter((item) => customSelectedIds.has(item.id)),
    [customSelectedIds],
  );

  const selectedText = useMemo(() => {
    if (selectedCount === 1) {
      return '1 patient selected';
    }
    return `${selectedCount} patients selected`;
  }, [selectedCount]);

  const customPackagePrice = useMemo(() => {
    const current = customSelectedCards.reduce((sum, item) => sum + item.salePrice, 0);
    const old = customSelectedCards.reduce((sum, item) => sum + item.oldPrice, 0);
    const off = old > 0 ? Math.round(((old - current) / old) * 100) : 0;

    return { current, old, off };
  }, [customSelectedCards]);

  const pricing = useMemo(() => {
    if (selectedCount <= 0) {
      return null;
    }

    if (customFlow) {
      return {
        current: customPackagePrice.current * selectedCount,
        old: customPackagePrice.old * selectedCount,
        off: customPackagePrice.off,
      };
    }

    if (selectedCount === 1) {
      return {
        current: selectedPackage.currentPrice,
        old: selectedPackage.oldPrice,
        off: selectedPackage.offPercent,
      };
    }

    return {
      current: selectedPackage.currentPrice * selectedCount,
      old: selectedPackage.oldPrice * selectedCount,
      off: selectedPackage.offPercent,
    };
  }, [selectedCount, selectedPackage, customFlow, customPackagePrice]);

  const paymentBreakdown = useMemo(() => {
    const current = pricing?.current ?? 0;
    const old = pricing?.old ?? 0;
    const discount = Math.max(old - current, 0);

    return {
      totalMrp: old,
      platformDiscount: discount,
      subtotal: current,
      totalOld: old,
      totalNew: current,
    };
  }, [pricing]);

  const formatPrice = (value) => `₹ ${value.toLocaleString('en-IN')}`;

  const selectedPatients = useMemo(() => {
    if (selectedIds.length <= 0) {
      return patients.slice(0, 2);
    }

    const patientMap = new Map(patients.map((item) => [item.id, item]));
    return selectedIds.map((id) => patientMap.get(id)).filter(Boolean);
  }, [patients, selectedIds]);

  const normalizedCustomQuery = customSearchQuery.trim().toLowerCase();

  const filteredCustomCards = useMemo(() => {
    return CUSTOM_TEST_CARDS.filter((item) => {
      const inTag = customActiveFilter === 'General Health'
        ? true
        : item.tags.some((tag) => tag.toLowerCase() === customActiveFilter.toLowerCase());

      if (!inTag) {
        return false;
      }

      if (!normalizedCustomQuery) {
        return true;
      }

      const testsText = item.tests.join(' ').toLowerCase();
      return item.title.toLowerCase().includes(normalizedCustomQuery) || testsText.includes(normalizedCustomQuery);
    });
  }, [customActiveFilter, normalizedCustomQuery]);

  const customSelectedNames = useMemo(
    () => customSelectedCards.map((item) => item.title.split(' ')[0]).join(', '),
    [customSelectedCards],
  );

  const getTimeRange = () => {
    if (!selectedTimeSlot) {
      return '';
    }

    const [timeValue, meridiem] = selectedTimeSlot.split(' ');
    const [hourText, minuteText] = timeValue.split(':');
    let hour24 = Number(hourText);

    if (meridiem === 'PM' && hour24 !== 12) {
      hour24 += 12;
    }
    if (meridiem === 'AM' && hour24 === 12) {
      hour24 = 0;
    }

    const startDate = new Date(2000, 0, 1, hour24, Number(minuteText), 0, 0);
    const endDate = new Date(startDate.getTime() + (60 * 60 * 1000));
    const endHour = endDate.getHours().toString().padStart(2, '0');
    const endMinute = endDate.getMinutes().toString().padStart(2, '0');
    const endSuffix = endDate.getHours() >= 12 ? 'PM' : 'AM';
    let endDisplayHour = Number(endHour) % 12;
    if (endDisplayHour === 0) {
      endDisplayHour = 12;
    }

    return `${selectedTimeSlot} - ${String(endDisplayHour).padStart(2, '0')}:${endMinute} ${endSuffix}`;
  };

  const getAppointmentDate = () => {
    const selectedDate = SCHEDULE_DATES.find((item) => item.id === selectedDateId);
    if (!selectedDate) {
      return '';
    }
    return `${selectedDate.day}, ${selectedDate.date}th Feb`;
  };

  const formatScheduleSummary = () => {
    const selectedDate = SCHEDULE_DATES.find((item) => item.id === selectedDateId);
    if (!selectedDate || !selectedTimeSlot) {
      return '';
    }

    const [timeValue, meridiem] = selectedTimeSlot.split(' ');
    const [hourText, minuteText] = timeValue.split(':');
    let hour24 = Number(hourText);

    if (meridiem === 'PM' && hour24 !== 12) {
      hour24 += 12;
    }
    if (meridiem === 'AM' && hour24 === 12) {
      hour24 = 0;
    }

    const startDate = new Date(2000, 0, 1, hour24, Number(minuteText), 0, 0);
    const endDate = new Date(startDate.getTime() + (60 * 60 * 1000));

    const format12 = (value) => {
      let h = value.getHours();
      const m = value.getMinutes().toString().padStart(2, '0');
      h %= 12;
      if (h === 0) {
        h = 12;
      }
      return `${h}:${m}`;
    };

    const dayWithSuffix = `${selectedDate.date}th`;
    return `${dayWithSuffix} Feb | ${format12(startDate)} - ${format12(endDate)} ${endDate.getHours() >= 12 ? 'PM' : 'AM'}`;
  };

  const handlePayWithRazorpay = async () => {
    setPaymentError(null);
    paymentSuccessRef.current = false;
    setPaymentSubmitting(true);
    try {
      const apptDateRow = SCHEDULE_DATES.find((item) => item.id === selectedDateId);
      const dateLabel = apptDateRow ? `${apptDateRow.day}, ${apptDateRow.date}th Feb` : '';

      const bookingDraft = {
        customFlow,
        packageId: customFlow ? null : selectedPackage.id,
        customTestIds: customFlow ? Array.from(customSelectedIds) : [],
        packageName: customFlow ? customPackageDisplayName : selectedPackage.name,
        patientIds: selectedPatients.map((p) => p.id),
        patients: selectedPatients.map((p) => ({ id: p.id, name: p.name, meta: p.meta })),
        address: { ...addressData },
        appointment: {
          dateId: selectedDateId,
          dateLabel,
          timeSlot: selectedTimeSlot,
          timeRange: getTimeRange(),
        },
        pricing: { ...paymentBreakdown, currency: 'INR' },
      };

      if (PAYMENT_DEMO_MODE && !BACKEND_ENABLED) {
        const r = await verifyPackageRazorpayPayment({});
        setConfirmedBookingId(r.bookingId || 'DEMO');
        paymentSuccessRef.current = true;
        setView('confirmed');
        return;
      }

      await loadRazorpayScript();
      const amountPaise = Math.max(100, Math.round(Number(paymentBreakdown.totalNew) * 100));
      const order = await createPackageRazorpayOrder({
        amount: amountPaise,
        currency: 'INR',
        receipt: `pkg_${Date.now()}`.slice(0, 40),
        notes: {
          packageId: String(bookingDraft.packageId || 'custom'),
          patientCount: String(selectedPatients.length),
        },
        bookingDraft,
      });

      const key = order.keyId || getDefaultRazorpayKeyId();
      if (!key) {
        throw new Error('Set REACT_APP_RAZORPAY_KEY_ID or return keyId from your create-order API.');
      }

      const options = {
        key,
        amount: order.amount,
        currency: order.currency || 'INR',
        order_id: order.orderId,
        name: 'Sapna Shyft',
        description: bookingDraft.packageName,
        theme: { color: '#296359' },
        prefill: {
          name: [formData.firstName, formData.lastName].filter(Boolean).join(' ') || undefined,
          email: formData.email || undefined,
          contact: (formData.phone || '').replace(/\D/g, '').slice(-10) || undefined,
        },
        handler(response) {
          void (async () => {
            try {
              const r = await verifyPackageRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingDraft,
              });
              paymentSuccessRef.current = true;
              setConfirmedBookingId(r.bookingId || r.paymentId || '—');
              setPaymentError(null);
              setView('confirmed');
            } catch (err) {
              setPaymentError(err.message || 'Verification failed. If you were charged, contact support.');
            }
          })();
        },
        modal: {
          ondismiss() {
            if (!paymentSuccessRef.current) {
              setPaymentError('Payment was cancelled or could not be completed.');
            }
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setPaymentError(err.message || 'Could not start payment.');
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const togglePatient = (patientId) => {
    setSelectedIds((prev) => {
      if (prev.includes(patientId)) {
        return prev.filter((id) => id !== patientId);
      }
      return [...prev, patientId];
    });
  };

  if (!open) {
    return null;
  }

  const handleClose = () => {
    setView('select');
    onClose();
  };

  const openPackageSelector = (returnView, nameHint) => {
    setDraftPackageId(selectedPackageId);
    setPackageViewReturn(returnView);
    setPackageTargetName(nameHint || 'User');
    setView('package');
  };

  const handleConfirmPackage = () => {
    setSelectedPackageId(draftPackageId);
    setView(packageViewReturn);
  };

  const handleToggleCustomExpanded = (id) => {
    setCustomExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleCustomSelected = (id) => {
    setCustomSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderInputField = (key, label, options = {}) => {
    const fieldClass = `patient-add__field${activeField === key ? ' is-focused' : ''}${options.half ? ' patient-add__field--half' : ''}`;
    const isDropdown = options.dropdown;

    return (
      <label className={fieldClass} htmlFor={`patient-${key}`}>
        <span className="patient-add__label-chip">{label}</span>

        <div className="patient-add__field-inner">
          <input
            id={`patient-${key}`}
            value={formData[key]}
            onFocus={() => setActiveField(key)}
            onChange={(event) => setFormData((prev) => ({ ...prev, [key]: event.target.value }))}
            className="patient-add__input"
            readOnly={isDropdown}
          />

          {isDropdown ? (
            <button type="button" className="patient-add__dropdown-btn" aria-label={`Open ${label} dropdown`}>
              <DownIcon />
            </button>
          ) : null}
        </div>
      </label>
    );
  };

  const renderAddressField = (key, label, options = {}) => {
    const fieldClass = `patient-address__field${activeAddressField === key ? ' is-focused' : ''}${options.half ? ' patient-address__field--half' : ''}`;
    return (
      <label className={fieldClass} htmlFor={`address-${key}`}>
        <span className="patient-add__label-chip">{label}</span>
        <div className="patient-address__field-inner">
          <input
            id={`address-${key}`}
            value={addressData[key]}
            onFocus={() => setActiveAddressField(key)}
            onChange={(event) => setAddressData((prev) => ({ ...prev, [key]: event.target.value }))}
            className="patient-address__input"
          />
        </div>
      </label>
    );
  };

  const handleSavePatient = async () => {
    try {
      const firstName = formData.firstName.trim();
      if (!firstName) {
        throw new Error('First name is required.');
      }

      const lastName = formData.lastName.trim();
      if (!lastName) {
        throw new Error('Last name is required.');
      }

      const age = Number.parseInt(formData.age, 10);
      if (Number.isNaN(age) || age < 1 || age > 120) {
        throw new Error('Age must be between 1 and 120.');
      }

      setSavingPatient(true);

      await createMySubProfile({
        firstName,
        lastName,
        age: formData.age,
        phone: formData.phone || '',
        email: formData.email || '',
        city: addressData.city || '',
        organization: '',
        gender: formData.gender || 'Female',
        relation: formData.relation || 'Sibling',
      });

      const refreshedProfilesResponse = await getMyProfiles();
      const refreshedProfiles = Array.isArray(refreshedProfilesResponse?.data)
        ? refreshedProfilesResponse.data
        : Array.isArray(refreshedProfilesResponse)
          ? refreshedProfilesResponse
          : [];

      const refreshedPatients = [];
      const uniqueUserIds = new Set();
      const primaryPatient = mapProfileToPatient(profileData, 'Primary');
      if (primaryPatient) {
        uniqueUserIds.add(primaryPatient.id);
        refreshedPatients.push(primaryPatient);
      }

      refreshedProfiles.forEach((item) => {
        const mapped = mapProfileToPatient(item, 'Member');
        if (!mapped || uniqueUserIds.has(mapped.id)) {
          return;
        }

        uniqueUserIds.add(mapped.id);
        refreshedPatients.push(mapped);
      });

      setPatients(refreshedPatients);

      const createdPatient = [...refreshedPatients].reverse().find((item) => {
        const name = item.name.toLowerCase();
        return name.startsWith(firstName.toLowerCase()) && name.includes(lastName.toLowerCase());
      });

      if (createdPatient) {
        setSelectedIds((prev) => {
          if (prev.includes(createdPatient.id)) {
            return prev;
          }
          return [...prev, createdPatient.id];
        });
      }

      setView('select');
    } catch (error) {
      window.alert(error?.message || 'Failed to add account. Please try again.');
    } finally {
      setSavingPatient(false);
    }
  };

  return (
    <div className="patient-select-overlay" role="dialog" aria-modal="true" aria-label="Select Patients">
      <button type="button" className="patient-select-overlay__close" aria-label="Close" onClick={handleClose}>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect width="32" height="32" rx="16" fill="#063533"/>
          <path d="M23.1992 8.75C23.2127 8.75003 23.2258 8.75513 23.2354 8.76465C23.2449 8.77417 23.25 8.78732 23.25 8.80078C23.25 8.81422 23.2448 8.82738 23.2354 8.83691L16.6006 15.4697L16.0703 16L16.6006 16.5303L23.2354 23.1631C23.2448 23.1726 23.25 23.1858 23.25 23.1992C23.25 23.2127 23.2449 23.2258 23.2354 23.2354C23.2258 23.2449 23.2127 23.25 23.1992 23.25C23.1858 23.25 23.1726 23.2448 23.1631 23.2354L16.5303 16.6006L16 16.0703L15.4697 16.6006L8.83691 23.2354C8.82738 23.2448 8.81422 23.25 8.80078 23.25C8.78732 23.25 8.77417 23.2449 8.76465 23.2354C8.75513 23.2258 8.75003 23.2127 8.75 23.1992C8.75 23.1858 8.75518 23.1726 8.76465 23.1631L15.3994 16.5303L15.9297 16L15.3994 15.4697L8.76465 8.83691C8.75998 8.83221 8.75644 8.82643 8.75391 8.82031C8.75136 8.81415 8.75 8.80745 8.75 8.80078C8.75002 8.79414 8.75136 8.78739 8.75391 8.78125C8.75646 8.77514 8.75996 8.76933 8.76465 8.76465C8.76933 8.75996 8.77514 8.75646 8.78125 8.75391C8.78739 8.75136 8.79414 8.75002 8.80078 8.75C8.80745 8.75 8.81415 8.75136 8.82031 8.75391C8.82643 8.75644 8.83221 8.75998 8.83691 8.76465L15.4697 15.3994L16 15.9297L16.5303 15.3994L23.1631 8.76465C23.1726 8.75518 23.1858 8.75 23.1992 8.75Z" fill="white" stroke="white" strokeWidth="1.5"/>
        </svg>
      </button>

      <div className={`patient-select-overlay__sheet${view === 'add' ? ' is-add' : ''}${view === 'package' ? ' is-package' : ''}${view === 'address' ? ' is-address' : ''}${view === 'schedule' ? ' is-schedule' : ''}${view === 'details' ? ' is-details' : ''}${view === 'payment' ? ' is-payment' : ''}${view === 'confirmed' ? ' is-confirmed' : ''}${view === 'package' && customFlow ? ' is-custom-package' : ''}`}>
        {view === 'select' ? (
          <>
            <h3 className="patient-select-overlay__title">Select members</h3>

            <div className="patient-select-overlay__list">
              {patients.map((patient) => {
                const selected = selectedIds.includes(patient.id);
                return (
                  <div key={patient.id}>
                    <div className="patient-select-overlay__row">
                      <div className="patient-select-overlay__left">
                        <div className="patient-select-overlay__avatar">
                          {patient.gender === 'male' ? <MaleIcon /> : <FemaleIcon />}
                        </div>

                        <div className="patient-select-overlay__details">
                          <p className="patient-select-overlay__name">{patient.name}</p>
                          <p className="patient-select-overlay__meta">{patient.meta}</p>
                        </div>
                      </div>

                      <div className="patient-select-overlay__actions">
                        <button type="button" className="patient-select-overlay__icon-btn" aria-label={`Edit ${patient.name}`}>
                          <EditIcon />
                        </button>

                        <button
                          type="button"
                          className="patient-select-overlay__icon-btn patient-select-overlay__check-btn"
                          aria-label={selected ? `Unselect ${patient.name}` : `Select ${patient.name}`}
                          onClick={() => togglePatient(patient.id)}
                        >
                          <UncheckedIcon />
                          {selected ? <span className="patient-select-overlay__checkmark"><CheckedIcon /></span> : null}
                        </button>
                      </div>
                    </div>

                    {selected ? (
                      <div className="patient-select-overlay__selected-package">
                        <div className="patient-select-overlay__selected-package-left">
                          <SelectedRowPackageIcon />
                          <span>{customFlow ? customPackageDisplayName : selectedPackage.name}</span>
                        </div>
                        <button
                          type="button"
                          className={`patient-select-overlay__selected-package-change${customFlow ? ' is-custom' : ''}`}
                          onClick={() => openPackageSelector('select', patient.name.split(' ')[0] || 'User')}
                        >
                          {customFlow ? 'Add tests' : 'Change'}
                        </button>
                      </div>
                    ) : null}

                    <div className="patient-select-overlay__divider" />
                  </div>
                );
              })}
            </div>

            <button type="button" className="patient-select-overlay__add-btn" onClick={() => setView('add')}>+ Add new patient</button>

            <div className="patient-select-overlay__footer">
              <div className="patient-select-overlay__footer-left">
                <span className="patient-select-overlay__selected-count">{selectedText}</span>
                {pricing ? (
                  <div className="patient-select-overlay__selected-price-row">
                    <span className="patient-select-overlay__selected-price-now">{formatPrice(pricing.current)}</span>
                    <span className="patient-select-overlay__selected-price-old">{formatPrice(pricing.old)}</span>
                    <span className="patient-select-overlay__selected-price-off">{pricing.off}% OFF</span>
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                className={`patient-select-overlay__continue${canContinue ? ' is-active' : ''}`}
                disabled={!canContinue}
                onClick={() => {
                  if (canContinue) {
                    setView('address');
                  }
                }}
              >
                Continue
              </button>
            </div>
          </>
        ) : view === 'add' ? (
          <>
            <div className="patient-add__header-row">
              <button type="button" className="patient-add__back" aria-label="Back to select patients" onClick={() => setView('select')}>
                <BackIcon />
              </button>
              <h3 className="patient-select-overlay__title">Add a new patient</h3>
            </div>

            <div className="patient-add__body">
              <div className="patient-add__split-row">
                {renderInputField('firstName', 'First Name', { half: true })}
                {renderInputField('lastName', 'Last Name', { half: true })}
              </div>

              {renderInputField('relation', 'Relation', { dropdown: true })}

              <div className="patient-add__split-row">
                {renderInputField('age', 'Age', { half: true })}
                {renderInputField('gender', 'Gender', { half: true, dropdown: true })}
              </div>

              <div className="patient-add__same-row">
                <span>Use same</span>
                <button type="button" className="patient-add__same-checkbox" onClick={() => setPhoneSame((prev) => !prev)}>
                  {phoneSame ? <UseSameCheckboxIcon /> : <span className="patient-add__same-checkbox-empty" />}
                </button>
              </div>
              {renderInputField('phone', 'Phone')}

              <div className="patient-add__same-row">
                <span>Use same</span>
                <button type="button" className="patient-add__same-checkbox" onClick={() => setEmailSame((prev) => !prev)}>
                  {emailSame ? <UseSameCheckboxIcon /> : <span className="patient-add__same-checkbox-empty" />}
                </button>
              </div>
              {renderInputField('email', 'Email')}

              <div className="patient-add__package-row">
                <div className="patient-add__package-left">
                  <PackagePulseIcon />
                  <div>
                    <p className="patient-add__package-title">{customFlow ? customPackageDisplayName : selectedPackage.name}</p>
                    <p className="patient-add__package-subtitle">Current Package</p>
                  </div>
                </div>

                <button
                  type="button"
                  className={`patient-add__change-btn${customFlow ? ' is-custom' : ''}`}
                  onClick={() => openPackageSelector('add', formData.firstName || 'User')}
                >
                  {customFlow ? 'Add tests' : 'Change'}
                </button>
              </div>

              <button type="button" className="patient-add__save-btn" onClick={handleSavePatient} disabled={savingPatient}>
                {savingPatient ? 'Saving...' : 'Save'}
              </button>
            </div>
          </>
        ) : view === 'package' ? (
          <>
            <h3 className="patient-select-overlay__title">{customFlow ? 'Add tests' : 'Select Package'}</h3>

            {customFlow ? (
              <div className="patient-custom-tests">
                <div className="patient-package__search">
                  <PackageSearchIcon />
                  <input
                    type="text"
                    value={customSearchQuery}
                    onChange={(event) => setCustomSearchQuery(event.target.value)}
                    placeholder="Search tests or health goals"
                    className="patient-package__search-input"
                  />
                </div>

                <div className="patient-package__tabs" aria-label="Test categories">
                  {CUSTOM_TEST_FILTERS.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      className={`patient-package__tab${customActiveFilter === tab ? ' is-active' : ''}`}
                      onClick={() => setCustomActiveFilter(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="patient-custom-tests__cards-scroll">
                  {filteredCustomCards.map((item) => {
                    const selectedCard = customSelectedIds.has(item.id);
                    const expanded = customExpandedIds.has(item.id);
                    const discount = Math.round(((item.oldPrice - item.salePrice) / item.oldPrice) * 100);

                    return (
                      <article key={item.id} className={`patient-custom-tests__card${selectedCard ? ' is-selected' : ''}`}>
                        <div className="patient-custom-tests__top-row">
                          <button
                            type="button"
                            className={`patient-custom-tests__checkbox${selectedCard ? ' is-selected' : ''}`}
                            onClick={() => handleToggleCustomSelected(item.id)}
                            aria-label={`Select ${item.title}`}
                          >
                            {selectedCard ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="11" viewBox="0 0 15 11" fill="none" aria-hidden="true">
                                <path d="M13.9154 0.583374L4.7487 9.75004L0.582031 5.58337" stroke="#90DF9E" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            ) : null}
                          </button>

                          <div className="patient-custom-tests__title-col">
                            <h4>{item.title}</h4>
                            <div className="patient-custom-tests__price-row">
                              <span className="patient-custom-tests__price-now">Rs. {item.salePrice}</span>
                              <span className="patient-custom-tests__price-old">Rs. {item.oldPrice}</span>
                              <span className="patient-custom-tests__price-off">{discount}% off</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="patient-custom-tests__expand-btn"
                            onClick={() => handleToggleCustomExpanded(item.id)}
                            aria-label={`Toggle details for ${item.title}`}
                          >
                            {expanded ? <TestChevronUpIcon /> : <TestChevronDownIcon />}
                          </button>
                        </div>

                        {expanded ? (
                          <>
                            <div className="patient-custom-tests__divider" />
                            <div className="patient-custom-tests__tests-grid">
                              {item.tests.map((test) => (
                                <span key={`${item.id}-${test}`} className="patient-custom-tests__test-item">
                                  <span className="patient-custom-tests__dot" aria-hidden="true" />
                                  {test}
                                </span>
                              ))}
                            </div>
                          </>
                        ) : null}
                      </article>
                    );
                  })}
                </div>

                <div className="patient-package__bottom-bar">
                  <div className="patient-package__bottom-left">
                    <span>SELECTED TESTS</span>
                    <p>{customSelectedNames || 'None'}</p>
                  </div>
                  <button type="button" className="patient-package__confirm-btn patient-package__confirm-btn--compact" onClick={() => setView(packageViewReturn)}>
                    Add All
                  </button>
                </div>
              </div>
            ) : (
              <div className="patient-package">
                <div className="patient-package__search">
                  <PackageSearchIcon />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search tests or health goals"
                    className="patient-package__search-input"
                  />
                </div>

                <div className="patient-package__tabs" aria-label="Package categories">
                  {PACKAGE_FILTERS.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      className={`patient-package__tab${activeFilter === tab ? ' is-active' : ''}`}
                      onClick={() => setActiveFilter(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="patient-package__cards-scroll">
                  {filteredPackages.map((item) => {
                    const selectedCard = draftPackageId === item.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        className={`patient-package__card${selectedCard ? ' is-selected' : ''}`}
                        onClick={() => setDraftPackageId(item.id)}
                      >
                        <div className="patient-package__card-main">
                          <h4>{item.name}</h4>

                          <div className="patient-package__price-row">
                            <span className="patient-package__price-now">{formatPrice(item.currentPrice)}</span>
                            <span className="patient-package__price-old">{formatPrice(item.oldPrice)}</span>
                            <span className="patient-package__off-pill">{item.offPercent}% OFF</span>
                          </div>

                          <div className="patient-package__meta-row">
                            <span className="patient-package__meta-item"><PackageTickIcon />{item.parameters}</span>
                            <span className="patient-package__meta-item"><PackageStarIcon />{item.rating}</span>
                          </div>

                          {item.recommended ? (
                            <div className="patient-package__doctor-row">
                              <PackageDoctorIcon />
                              <span>{item.recommended}</span>
                            </div>
                          ) : null}
                        </div>

                        <span className="patient-package__open-icon"><PackageOpenIcon /></span>
                      </button>
                    );
                  })}
                </div>

                <div className="patient-package__bottom-bar">
                  <div className="patient-package__bottom-left">
                    <span>SELECTED PACKAGE</span>
                    <p>{draftPackage.name.replace(' Panel', '').replace(' Checkup', '')}</p>
                  </div>
                  <button type="button" className="patient-package__confirm-btn" onClick={handleConfirmPackage}>
                    {`Confirm for ${packageTargetName}`}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : view === 'address' ? (
          <>
            <div className="patient-add__header-row">
              <button type="button" className="patient-add__back" aria-label="Back to select patients" onClick={() => setView('select')}>
                <BackIcon />
              </button>
              <h3 className="patient-select-overlay__title">Add Address</h3>
            </div>

            <div className="patient-address__body">
              {renderAddressField('house', 'House/ Flat No.')}
              {renderAddressField('area', 'Building/ Area')}
              {renderAddressField('landmark', 'Landmark')}

              <div className="patient-address__split-row">
                {renderAddressField('city', 'City', { half: true })}
                {renderAddressField('pincode', 'Pincode', { half: true })}
              </div>

              <button type="button" className="patient-address__continue-btn" onClick={() => setView('schedule')}>Continue</button>
            </div>
          </>
        ) : view === 'schedule' ? (
          <>
            <div className="patient-add__header-row">
              <button type="button" className="patient-add__back" aria-label="Back to add address" onClick={() => setView('address')}>
                <BackIcon />
              </button>
              <h3 className="patient-select-overlay__title">Schedule Collection</h3>
            </div>

            <div className="patient-schedule">
              <div className="patient-schedule__section-title-row">
                <PreferredDateIcon />
                <span>Preferred Date</span>
              </div>

              <div className="patient-schedule__dates">
                {SCHEDULE_DATES.map((item) => {
                  const isSelected = item.id === selectedDateId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`patient-schedule__date-card${isSelected ? ' is-selected' : ''}`}
                      onClick={() => setSelectedDateId(item.id)}
                    >
                      <span className="patient-schedule__date-day">{item.day}</span>
                      <span className="patient-schedule__date-number">{item.date}</span>
                    </button>
                  );
                })}
              </div>

              <div className="patient-schedule__time-head">
                <div className="patient-schedule__section-title-row">
                  <PreferredTimeIcon />
                  <span>Preferred Time Slot</span>
                </div>
                <p className="patient-schedule__time-subtitle">Collection window is of 1 hour</p>
              </div>

              <div className="patient-schedule__slots-wrap">
                {SCHEDULE_TIME_SLOTS.map((row, index) => (
                  <div key={`row-${index}`} className="patient-schedule__slot-row">
                    {row.map((slot) => {
                      const isSelected = slot === selectedTimeSlot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          className={`patient-schedule__slot-pill${isSelected ? ' is-selected' : ''}`}
                          onClick={() => setSelectedTimeSlot(slot)}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="patient-schedule__footer">
                <div className="patient-schedule__footer-left">
                  <span className="patient-schedule__slot-label">Slot selected</span>
                  <p className="patient-schedule__slot-value">{formatScheduleSummary()}</p>
                </div>
                <button
                  type="button"
                  className={`patient-select-overlay__continue${selectedTimeSlot ? ' is-active' : ''}`}
                  onClick={() => setView('details')}
                >
                  Continue
                </button>
              </div>
            </div>
          </>
        ) : view === 'details' ? (
          <>
            <h3 className="patient-select-overlay__title">Patient Details</h3>

            <div className="patient-confirm">
              <div className="patient-confirm__patients">
                {selectedPatients.map((patient) => (
                  <div key={patient.id} className="patient-confirm__patient-card">
                    <div className="patient-confirm__patient-top">
                      <div className="patient-confirm__patient-main">
                        <div className="patient-select-overlay__avatar">
                          {patient.gender === 'male' ? <MaleIcon /> : <FemaleIcon />}
                        </div>
                        <div className="patient-select-overlay__details">
                          <p className="patient-select-overlay__name">{patient.name}</p>
                          <p className="patient-select-overlay__meta">{patient.meta}</p>
                        </div>
                      </div>
                      <button type="button" className="patient-confirm__edit-btn" aria-label={`Edit ${patient.name}`}>
                        <DetailEditIcon />
                      </button>
                    </div>

                    <div className="patient-confirm__divider" />

                    <div className="patient-confirm__patient-price-row">
                      <div className="patient-confirm__patient-package">
                        <SelectedRowPackageIcon />
                        <span>{customFlow ? customPackageDisplayName : selectedPackage.name}</span>
                      </div>

                      <div className="patient-confirm__price-group">
                        <span className="patient-confirm__price-old">{formatPrice(customFlow ? customPackagePrice.old : selectedPackage.oldPrice)}/-</span>
                        <span className="patient-confirm__price-now">{formatPrice(customFlow ? customPackagePrice.current : selectedPackage.currentPrice)}/-</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="patient-confirm__section-head">
                <h4>Address Details</h4>
                <button
                  type="button"
                  className="patient-confirm__edit-btn"
                  aria-label="Edit address details"
                  onClick={() => setView('address')}
                >
                  <DetailEditIcon />
                </button>
              </div>

              <div className="patient-confirm__info-card">
                <div className="patient-confirm__info-row">
                  <span className="patient-confirm__info-icon"><DetailLocationIcon /></span>
                  <div className="patient-confirm__info-text-wrap">
                    <p className="patient-confirm__info-label">Address</p>
                    <p className="patient-confirm__info-value">{`${addressData.house}, ${addressData.area}, ${addressData.landmark}`}</p>
                  </div>
                </div>

                <div className="patient-confirm__divider" />

                <div className="patient-confirm__info-row">
                  <span className="patient-confirm__info-icon is-city"><DetailCityIcon /></span>
                  <div className="patient-confirm__info-text-wrap">
                    <p className="patient-confirm__info-label">City</p>
                    <p className="patient-confirm__info-value">{`${addressData.city}, ${addressData.pincode}`}</p>
                  </div>
                </div>
              </div>

              <div className="patient-confirm__section-head">
                <h4>Appointment Details</h4>
                <button
                  type="button"
                  className="patient-confirm__edit-btn"
                  aria-label="Edit appointment details"
                  onClick={() => setView('schedule')}
                >
                  <DetailEditIcon />
                </button>
              </div>

              <div className="patient-confirm__info-card patient-confirm__info-card--appointment">
                <div className="patient-confirm__info-row">
                  <span className="patient-confirm__info-icon"><DetailCalendarIcon /></span>
                  <div className="patient-confirm__info-text-wrap">
                    <p className="patient-confirm__info-label">Date</p>
                    <p className="patient-confirm__info-value">{getAppointmentDate()}</p>
                  </div>
                </div>

                <div className="patient-confirm__divider" />

                <div className="patient-confirm__info-row">
                  <span className="patient-confirm__info-icon is-city"><DetailClockIcon /></span>
                  <div className="patient-confirm__info-text-wrap">
                    <p className="patient-confirm__info-label">Time Slot</p>
                    <p className="patient-confirm__info-value">{getTimeRange()}</p>
                  </div>
                </div>
              </div>

              <button type="button" className="patient-confirm__continue" onClick={() => setView('payment')}>Continue</button>
            </div>
          </>
        ) : view === 'payment' ? (
          <>
            <h3 className="patient-select-overlay__title">Payment Breakdown</h3>

            <div className="patient-payment">
              <div className="patient-payment__box">
                <div className="patient-payment__row">
                  <span className="patient-payment__label">Total MRP</span>
                  <span className="patient-payment__value">{formatPrice(paymentBreakdown.totalMrp)}</span>
                </div>

                <div className="patient-payment__row">
                  <span className="patient-payment__label">Platform Discount</span>
                  <span className="patient-payment__value patient-payment__value--discount">- {formatPrice(paymentBreakdown.platformDiscount)}</span>
                </div>

                <div className="patient-payment__divider" />

                <div className="patient-payment__row">
                  <span className="patient-payment__label">Subtotal</span>
                  <span className="patient-payment__value patient-payment__value--subtotal">{formatPrice(paymentBreakdown.subtotal)}</span>
                </div>
              </div>

              <div className="patient-payment__total-row">
                <span className="patient-payment__total-label">Total Amount</span>
                <div className="patient-payment__total-right">
                  <span className="patient-payment__total-old">{formatPrice(paymentBreakdown.totalOld)}/-</span>
                  <span className="patient-payment__total-new">{formatPrice(paymentBreakdown.totalNew)}</span>
                </div>
              </div>

              {paymentError ? (
                <p className="patient-payment__error" role="alert">
                  {paymentError}
                </p>
              ) : null}

              <p className="patient-payment__hint">
                You will complete payment on Razorpay. Booking is confirmed only after payment succeeds and our server verifies it.
              </p>

              <button
                type="button"
                className="patient-payment__continue"
                onClick={handlePayWithRazorpay}
                disabled={paymentSubmitting}
              >
                {paymentSubmitting ? 'Please wait…' : 'Pay securely'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="patient-final">
              <div className="patient-final__status-icon">
                <ConfirmTickIcon />
              </div>

              <p className="patient-final__status-text">Booking Confirmed</p>

              <div className="patient-final__booking-id">
                <span>Booking ID</span>
                <i>|</i>
                <strong>{confirmedBookingId || '—'}</strong>
              </div>

              <h4 className="patient-final__section-title">Patient Details</h4>
              <div className="patient-final__patients-box">
                {selectedPatients.map((patient, index) => (
                  <React.Fragment key={patient.id}>
                    <div className="patient-final__patient-row">
                      <div className="patient-select-overlay__left">
                        <div className="patient-select-overlay__avatar">
                          {patient.gender === 'male' ? <MaleIcon /> : <FemaleIcon />}
                        </div>
                        <div className="patient-select-overlay__details">
                          <p className="patient-select-overlay__name">{patient.name}</p>
                          <p className="patient-select-overlay__meta">{patient.meta}</p>
                        </div>
                      </div>

                      <div className="patient-final__patient-package">
                        <span>Package</span>
                        <p>{customFlow ? customPackageDisplayName : selectedPackage.name}</p>
                      </div>
                    </div>

                    {index < selectedPatients.length - 1 ? <div className="patient-confirm__divider" /> : null}
                  </React.Fragment>
                ))}
              </div>

              <h4 className="patient-final__section-title">Address Details</h4>
              <div className="patient-confirm__info-card patient-final__info-card">
                <div className="patient-confirm__info-row">
                  <span className="patient-confirm__info-icon"><DetailLocationIcon /></span>
                  <div className="patient-confirm__info-text-wrap">
                    <p className="patient-confirm__info-label">Address</p>
                    <p className="patient-confirm__info-value">{`${addressData.house}, ${addressData.area}, ${addressData.landmark}`}</p>
                  </div>
                </div>

                <div className="patient-confirm__divider" />

                <div className="patient-confirm__info-row">
                  <span className="patient-confirm__info-icon is-city"><DetailCityIcon /></span>
                  <div className="patient-confirm__info-text-wrap">
                    <p className="patient-confirm__info-label">City</p>
                    <p className="patient-confirm__info-value">{`${addressData.city}, ${addressData.pincode}`}</p>
                  </div>
                </div>
              </div>

              <h4 className="patient-final__section-title">Appointment Details</h4>
              <div className="patient-confirm__info-card patient-confirm__info-card--appointment patient-final__info-card">
                <div className="patient-confirm__info-row">
                  <span className="patient-confirm__info-icon"><DetailCalendarIcon /></span>
                  <div className="patient-confirm__info-text-wrap">
                    <p className="patient-confirm__info-label">Date</p>
                    <p className="patient-confirm__info-value">{getAppointmentDate()}</p>
                  </div>
                </div>

                <div className="patient-confirm__divider" />

                <div className="patient-confirm__info-row">
                  <span className="patient-confirm__info-icon is-city"><DetailClockIcon /></span>
                  <div className="patient-confirm__info-text-wrap">
                    <p className="patient-confirm__info-label">Time Slot</p>
                    <p className="patient-confirm__info-value">{getTimeRange()}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="patient-select-overlay__grip" aria-hidden="true" />
      </div>
    </div>
  );
};

export default PatientSelectionOverlay;
