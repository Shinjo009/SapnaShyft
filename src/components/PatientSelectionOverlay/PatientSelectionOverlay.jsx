import React, { useEffect, useMemo, useState } from 'react';
import './PatientSelectionOverlay.css';

const PATIENTS = [
  {
    id: 'harshili',
    name: 'Harshili Gada',
    meta: 'F, 29  |  Primary',
    gender: 'female',
  },
  {
    id: 'harsh',
    name: 'Harsh',
    meta: 'M, 25  |  Spouse',
    gender: 'male',
  },
];

const PACKAGE_FILTERS = ['Full Body', 'Diabetes', 'Women Health', 'Cancer', 'Kidney'];

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

const MaleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="16" viewBox="0 0 18 16" fill="none" aria-hidden="true">
    <path d="M0.185458 15.99C0.249491 16.0067 0.317521 15.9975 0.374801 15.9643C0.43208 15.9312 0.473994 15.8768 0.491458 15.813C1.00646 13.8915 3.09946 13.3935 4.35046 13.0955C4.66396 13.021 4.91146 12.962 5.07246 12.8925C6.49746 12.274 6.96196 11.279 7.10096 10.553C7.10922 10.5098 7.10595 10.4652 7.09146 10.4237C7.07698 10.3821 7.0518 10.3452 7.01846 10.3165C6.27646 9.676 5.65046 8.7145 5.25546 7.6085C5.24421 7.57683 5.2267 7.54775 5.20396 7.523C4.68146 6.955 4.38146 6.3545 4.38146 5.876C4.38146 5.5965 4.48696 5.409 4.72446 5.2675C4.76003 5.24623 4.78976 5.21645 4.81097 5.18084C4.83218 5.14523 4.8442 5.10491 4.84596 5.0635C4.95646 2.5165 6.77046 0.5115 8.99546 0.4985L9.04896 0.502C11.285 0.533 13.0875 2.581 13.152 5.164C13.1529 5.19929 13.1614 5.23398 13.1767 5.26578C13.192 5.29758 13.2139 5.32578 13.241 5.3485C13.3975 5.481 13.4705 5.649 13.4705 5.877C13.4705 6.2775 13.257 6.77 12.87 7.263C12.8513 7.28659 12.8371 7.31336 12.828 7.342C12.428 8.61 11.71 9.7295 10.859 10.4145C10.8236 10.4429 10.7967 10.4804 10.781 10.5229C10.7653 10.5655 10.7615 10.6115 10.77 10.656C10.909 11.3815 11.3735 12.376 12.7985 12.9955C12.967 13.0685 13.2285 13.1255 13.56 13.197C14.7985 13.465 16.871 13.9145 17.3795 15.813C17.388 15.8447 17.4027 15.8744 17.4227 15.9005C17.4427 15.9265 17.4677 15.9483 17.4962 15.9647C17.5246 15.9811 17.556 15.9917 17.5886 15.996C17.6212 16.0002 17.6542 15.998 17.686 15.9895C17.7177 15.981 17.7474 15.9663 17.7734 15.9462C17.7995 15.9262 17.8213 15.9013 17.8377 15.8728C17.8541 15.8443 17.8647 15.8129 17.8689 15.7804C17.8732 15.7478 17.871 15.7147 17.8625 15.683C17.275 13.4895 14.927 12.981 13.666 12.708C13.3735 12.6445 13.121 12.59 12.998 12.536C12.068 12.132 11.495 11.5165 11.2925 10.7035C12.156 9.962 12.8785 8.818 13.2915 7.535C13.73 6.965 13.971 6.378 13.971 5.8765C13.971 5.542 13.863 5.263 13.649 5.045C13.53 2.243 11.5305 0.0365 9.04896 0.001L8.97446 0C6.53796 0.013 4.52996 2.1615 4.35446 4.915C4.04146 5.145 3.88246 5.4675 3.88246 5.877C3.88246 6.4685 4.21696 7.176 4.80246 7.825C5.20696 8.9365 5.83396 9.913 6.58046 10.5965C6.37896 11.4125 5.80546 12.03 4.87346 12.4345C4.75296 12.487 4.51296 12.5445 4.23496 12.6105C2.96446 12.9125 0.600458 13.475 0.00845779 15.684C-0.00863897 15.748 0.000403151 15.8163 0.0335957 15.8737C0.0667882 15.931 0.121413 15.9729 0.185458 15.99Z" fill="white"/>
  </svg>
);

const FemaleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="16" viewBox="0 0 18 16" fill="none" aria-hidden="true">
    <path d="M11.046 10.362C11.007 10.3569 10.9673 10.3613 10.9303 10.3748C10.8933 10.3882 10.8601 10.4105 10.8335 10.4395C10.8066 10.4682 10.7869 10.5029 10.776 10.5407C10.765 10.5785 10.7632 10.6183 10.7705 10.657C10.9085 11.382 11.373 12.377 12.799 12.9965C12.968 13.0695 13.229 13.1265 13.56 13.198C14.799 13.466 16.871 13.915 17.38 15.814C17.3886 15.8457 17.4033 15.8755 17.4233 15.9016C17.4433 15.9276 17.4683 15.9495 17.4968 15.9659C17.5253 15.9823 17.5567 15.993 17.5893 15.9972C17.6219 16.0015 17.655 15.9993 17.6868 15.9907C17.7185 15.9822 17.7483 15.9675 17.7743 15.9475C17.8004 15.9274 17.8223 15.9025 17.8387 15.874C17.8551 15.8455 17.8657 15.8141 17.87 15.7815C17.8743 15.7489 17.8721 15.7157 17.8635 15.684C17.275 13.4905 14.9275 12.982 13.666 12.709C13.374 12.6455 13.1215 12.591 12.998 12.537C12.141 12.165 11.5875 11.613 11.3475 10.894C13.7285 11.071 14.8065 10.1225 14.854 10.0795C14.8833 10.053 14.9059 10.0199 14.9199 9.98296C14.9339 9.94603 14.939 9.9063 14.9347 9.86702C14.9304 9.82775 14.9169 9.79005 14.8952 9.75702C14.8735 9.72399 14.8443 9.69657 14.81 9.677C13.436 8.892 13.436 6.1795 13.436 5.158C13.436 2.3015 11.512 0.037 9.04552 0.0015L8.97502 0C6.47252 0.014 4.43602 2.281 4.43602 5.054C4.43602 6.0755 4.43602 8.7885 3.06202 9.573C3.0266 9.59357 2.99674 9.62248 2.97504 9.65722C2.95334 9.69196 2.94045 9.73147 2.93749 9.77232C2.93454 9.81318 2.9416 9.85413 2.95808 9.89163C2.97455 9.92913 2.99993 9.96204 3.03202 9.9875C3.10102 10.041 4.62602 11.208 6.50252 10.8535C6.25152 11.5425 5.70552 12.0725 4.87352 12.434C4.75302 12.4865 4.51302 12.544 4.23502 12.61C2.96502 12.912 0.600521 13.4745 0.00852111 15.6835C1.80174e-05 15.7152 -0.00214876 15.7484 0.00214449 15.7809C0.00643773 15.8135 0.0171069 15.8449 0.0335429 15.8734C0.0667368 15.9309 0.121405 15.9728 0.185521 15.99C0.249637 16.0072 0.317949 15.9982 0.375429 15.965C0.432909 15.9318 0.474848 15.8771 0.492021 15.813C1.00652 13.891 3.10052 13.3935 4.35102 13.0955C4.66452 13.021 4.91202 12.962 5.07302 12.8925C6.49902 12.273 6.96302 11.278 7.10152 10.553C7.10959 10.5105 7.10651 10.4667 7.09257 10.4258C7.07864 10.3848 7.05433 10.3482 7.02202 10.3195C6.98977 10.2907 6.95061 10.2708 6.90838 10.2617C6.86614 10.2526 6.82226 10.2546 6.78102 10.2675C5.42752 10.6935 4.17702 10.1075 3.63052 9.7825C4.93602 8.6895 4.93602 6.174 4.93602 5.054C4.93602 2.5555 6.74902 0.5125 8.99602 0.499L9.04902 0.502C11.265 0.5335 12.936 2.535 12.936 5.158C12.936 6.2785 12.936 8.7995 14.247 9.8925C13.7955 10.1505 12.766 10.568 11.046 10.362Z" fill="white"/>
  </svg>
);

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

const PatientSelectionOverlay = ({ open, onClose }) => {
  const [view, setView] = useState('select');
  const [patients, setPatients] = useState(PATIENTS);
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
  const [formData, setFormData] = useState({
    firstName: 'Ramesh',
    lastName: 'Ramesh',
    relation: 'Spouse',
    age: '23',
    gender: 'Male',
    phone: '9987254209',
    email: 'abc.de@example.com',
  });
  const [addressData, setAddressData] = useState({
    house: '2403',
    area: 'Vasant Blossoms, Marol Naka',
    landmark: 'Marol Naka Metro Station',
    city: 'Mumbai',
    pincode: '400280',
  });
  const [selectedDateId, setSelectedDateId] = useState('mon-12');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('06:00 AM');

  useEffect(() => {
    if (!open) {
      setView('select');
    }
  }, [open]);

  const selectedPackage = useMemo(
    () => PACKAGE_OPTIONS.find((item) => item.id === selectedPackageId) || PACKAGE_OPTIONS[0],
    [selectedPackageId],
  );

  const draftPackage = useMemo(
    () => PACKAGE_OPTIONS.find((item) => item.id === draftPackageId) || PACKAGE_OPTIONS[0],
    [draftPackageId],
  );

  const filteredPackages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return PACKAGE_OPTIONS;
    }

    return PACKAGE_OPTIONS.filter((item) => {
      const inName = item.name.toLowerCase().includes(q);
      const inTags = item.searchTags.some((tag) => tag.toLowerCase().includes(q));
      return inName || inTags;
    });
  }, [searchQuery]);

  const selectedCount = selectedIds.length;
  const canContinue = selectedCount > 0;

  const selectedText = useMemo(() => {
    if (selectedCount === 1) {
      return '1 patient selected';
    }
    return `${selectedCount} patients selected`;
  }, [selectedCount]);

  const pricing = useMemo(() => {
    if (selectedCount <= 0) {
      return null;
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
  }, [selectedCount, selectedPackage]);

  const formatPrice = (value) => `₹ ${value.toLocaleString('en-IN')}`;

  const selectedPatients = useMemo(() => {
    if (selectedIds.length <= 0) {
      return patients.slice(0, 2);
    }

    const patientMap = new Map(patients.map((item) => [item.id, item]));
    return selectedIds.map((id) => patientMap.get(id)).filter(Boolean);
  }, [patients, selectedIds]);

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

  const handleSavePatient = () => {
    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();

    if (!firstName) {
      return;
    }

    const fullName = `${firstName}${lastName ? ` ${lastName}` : ''}`;
    const normalizedGender = formData.gender.trim().toLowerCase();
    const genderCode = normalizedGender.startsWith('f') ? 'F' : 'M';
    const genderType = normalizedGender.startsWith('f') ? 'female' : 'male';
    const age = formData.age.trim() || '--';
    const relation = formData.relation.trim() || 'Primary';
    const newId = `patient-${Date.now()}`;

    setPatients((prev) => ([
      ...prev,
      {
        id: newId,
        name: fullName,
        meta: `${genderCode}, ${age}  |  ${relation}`,
        gender: genderType,
      },
    ]));

    setSelectedIds((prev) => [...prev, newId]);
    setView('select');
  };

  return (
    <div className="patient-select-overlay" role="dialog" aria-modal="true" aria-label="Select Patients">
      <button type="button" className="patient-select-overlay__close" aria-label="Close" onClick={handleClose}>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect width="32" height="32" rx="16" fill="#063533"/>
          <path d="M23.1992 8.75C23.2127 8.75003 23.2258 8.75513 23.2354 8.76465C23.2449 8.77417 23.25 8.78732 23.25 8.80078C23.25 8.81422 23.2448 8.82738 23.2354 8.83691L16.6006 15.4697L16.0703 16L16.6006 16.5303L23.2354 23.1631C23.2448 23.1726 23.25 23.1858 23.25 23.1992C23.25 23.2127 23.2449 23.2258 23.2354 23.2354C23.2258 23.2449 23.2127 23.25 23.1992 23.25C23.1858 23.25 23.1726 23.2448 23.1631 23.2354L16.5303 16.6006L16 16.0703L15.4697 16.6006L8.83691 23.2354C8.82738 23.2448 8.81422 23.25 8.80078 23.25C8.78732 23.25 8.77417 23.2449 8.76465 23.2354C8.75513 23.2258 8.75003 23.2127 8.75 23.1992C8.75 23.1858 8.75518 23.1726 8.76465 23.1631L15.3994 16.5303L15.9297 16L15.3994 15.4697L8.76465 8.83691C8.75998 8.83221 8.75644 8.82643 8.75391 8.82031C8.75136 8.81415 8.75 8.80745 8.75 8.80078C8.75002 8.79414 8.75136 8.78739 8.75391 8.78125C8.75646 8.77514 8.75996 8.76933 8.76465 8.76465C8.76933 8.75996 8.77514 8.75646 8.78125 8.75391C8.78739 8.75136 8.79414 8.75002 8.80078 8.75C8.80745 8.75 8.81415 8.75136 8.82031 8.75391C8.82643 8.75644 8.83221 8.75998 8.83691 8.76465L15.4697 15.3994L16 15.9297L16.5303 15.3994L23.1631 8.76465C23.1726 8.75518 23.1858 8.75 23.1992 8.75Z" fill="white" stroke="white" strokeWidth="1.5"/>
        </svg>
      </button>

      <div className={`patient-select-overlay__sheet${view === 'add' ? ' is-add' : ''}${view === 'package' ? ' is-package' : ''}${view === 'address' ? ' is-address' : ''}${view === 'schedule' ? ' is-schedule' : ''}${view === 'details' ? ' is-details' : ''}${view === 'payment' ? ' is-payment' : ''}${view === 'confirmed' ? ' is-confirmed' : ''}`}>
        {view === 'select' ? (
          <>
            <h3 className="patient-select-overlay__title">Select patients</h3>

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
                          <span>{selectedPackage.name}</span>
                        </div>
                        <button
                          type="button"
                          className="patient-select-overlay__selected-package-change"
                          onClick={() => openPackageSelector('select', patient.name.split(' ')[0] || 'User')}
                        >
                          Change
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
                    <p className="patient-add__package-title">{selectedPackage.name}</p>
                    <p className="patient-add__package-subtitle">Current Package</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="patient-add__change-btn"
                  onClick={() => openPackageSelector('add', formData.firstName || 'User')}
                >
                  Change
                </button>
              </div>

              <button type="button" className="patient-add__save-btn" onClick={handleSavePatient}>Save</button>
            </div>
          </>
        ) : view === 'package' ? (
          <>
            <h3 className="patient-select-overlay__title">Select Package</h3>

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
                  Confirm for {packageTargetName}
                </button>
              </div>
            </div>
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
                        <span>{selectedPackage.name}</span>
                      </div>

                      <div className="patient-confirm__price-group">
                        <span className="patient-confirm__price-old">{formatPrice(selectedPackage.oldPrice)}/-</span>
                        <span className="patient-confirm__price-now">{formatPrice(selectedPackage.currentPrice)}/-</span>
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
                  <span className="patient-payment__value">Rs. 3,998</span>
                </div>

                <div className="patient-payment__row">
                  <span className="patient-payment__label">Platform Discount</span>
                  <span className="patient-payment__value patient-payment__value--discount">- Rs. 1,499</span>
                </div>

                <div className="patient-payment__divider" />

                <div className="patient-payment__row">
                  <span className="patient-payment__label">Subtotal</span>
                  <span className="patient-payment__value patient-payment__value--subtotal">Rs. 2,499</span>
                </div>
              </div>

              <div className="patient-payment__total-row">
                <span className="patient-payment__total-label">Total Amount</span>
                <div className="patient-payment__total-right">
                  <span className="patient-payment__total-old">Rs. 3,998/-</span>
                  <span className="patient-payment__total-new">Rs. 2,499</span>
                </div>
              </div>

              <button type="button" className="patient-payment__continue" onClick={() => setView('confirmed')}>Continue</button>
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
                <strong>XYZ123</strong>
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
                        <p>Full Body Checkup</p>
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
