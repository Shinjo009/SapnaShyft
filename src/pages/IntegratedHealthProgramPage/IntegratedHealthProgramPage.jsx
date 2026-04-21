import React, { useEffect, useMemo, useRef, useState } from 'react';
import './IntegratedHealthProgramPage.css';
import '../ExpertDetailsPage/ExpertDetailsPage.css';
import doctorAvatar from '../../images/doc.svg';
import nutritionistAvatar from '../../images/nutritionist.svg';
import sarahPhoto from '../../images/sarah.svg';
import lizzyPhoto from '../../images/sarah.svg';
import verifiedBadge from '../../images/verified.svg';
import nutritionSelectedIcon from '../../images/Cube/nutrition.svg';

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none" aria-hidden="true">
    <path d="M15.5 6.66663C16.8807 6.66663 18 5.54734 18 4.16663C18 2.78591 16.8807 1.66663 15.5 1.66663C14.1193 1.66663 13 2.78591 13 4.16663C13 5.54734 14.1193 6.66663 15.5 6.66663Z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5.5 12.4999C6.88071 12.4999 8 11.3806 8 9.99992C8 8.61921 6.88071 7.49992 5.5 7.49992C4.11929 7.49992 3 8.61921 3 9.99992C3 11.3806 4.11929 12.4999 5.5 12.4999Z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15.5 18.3334C16.8807 18.3334 18 17.2141 18 15.8334C18 14.4527 16.8807 13.3334 15.5 13.3334C14.1193 13.3334 13 14.4527 13 15.8334C13 17.2141 14.1193 18.3334 15.5 18.3334Z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.6582 8.7417L12.8507 5.75836" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.6582 11.2583L12.8507 14.2417" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M17 18C17.5304 18 18.0391 18.2107 18.4142 18.5858C18.7893 18.9609 19 19.4696 19 20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22C16.4696 22 15.9609 21.7893 15.5858 21.4142C15.2107 21.0391 15 20.5304 15 20C15 18.89 15.89 18 17 18ZM1 2H4.27L5.21 4H20C20.2652 4 20.5196 4.10536 20.7071 4.29289C20.8946 4.48043 21 4.73478 21 5C21 5.17 20.95 5.34 20.88 5.5L17.3 11.97C16.96 12.58 16.3 13 15.55 13H8.1L7.2 14.63L7.17 14.75C7.17 14.8163 7.19634 14.8799 7.24322 14.9268C7.29011 14.9737 7.3537 15 7.42 15H19V17H7C6.46957 17 5.96086 16.7893 5.58579 16.4142C5.21071 16.0391 5 15.5304 5 15C5 14.65 5.09 14.32 5.24 14.04L6.6 11.59L3 4H1V2ZM7 18C7.53043 18 8.03914 18.2107 8.41421 18.5858C8.78929 18.9609 9 19.4696 9 20C9 20.5304 8.78929 21.0391 8.41421 21.4142C8.03914 21.7893 7.53043 22 7 22C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20C5 18.89 5.89 18 7 18Z" fill="white" />
  </svg>
);

const RatingStarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M2.23125 11.0833L3.17917 6.98542L0 4.22917L4.2 3.86458L5.83333 0L7.46667 3.86458L11.6667 4.22917L8.4875 6.98542L9.43542 11.0833L5.83333 8.91042L2.23125 11.0833Z" fill="#90DF9E" />
  </svg>
);

const ViewDetailsArrowIcon = ({ isOpen = false }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="9"
    height="5"
    viewBox="0 0 9 5"
    fill="none"
    aria-hidden="true"
    className={`ihp-card__view-arrow${isOpen ? ' is-open' : ''}`}
  >
    <path d="M7.94 1.4782e-05L8.64667 0.707348L4.79533 4.56001C4.73362 4.62212 4.66024 4.6714 4.5794 4.70504C4.49857 4.73867 4.41188 4.75598 4.32433 4.75598C4.23678 4.75598 4.1501 4.73867 4.06926 4.70504C3.98843 4.6714 3.91505 4.62212 3.85333 4.56001L0 0.707348L0.706667 0.0006814L4.32333 3.61668L7.94 1.4782e-05Z" fill="#9A9A9A"/>
  </svg>
);

const ChangeArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="8" height="16" viewBox="0 0 8 16" fill="none" aria-hidden="true">
    <path d="M1.63466 4.38666L2.34199 3.67999L6.19466 7.53133C6.25676 7.59304 6.30605 7.66642 6.33968 7.74726C6.37331 7.82809 6.39063 7.91478 6.39063 8.00233C6.39063 8.08988 6.37331 8.17656 6.33968 8.2574C6.30605 8.33823 6.25676 8.41161 6.19466 8.47333L2.34199 12.3267L1.63532 11.62L5.25132 8.00333L1.63466 4.38666Z" fill="#9A9A9A"/>
  </svg>
);

const DoctorSelectedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path d="M5.5 7C4.83696 7 4.20107 6.73661 3.73223 6.26777C3.26339 5.79893 3 5.16304 3 4.5V2.5C3 2.36739 3.05268 2.24021 3.14645 2.14645C3.24021 2.05268 3.36739 2 3.5 2H4C4.13261 2 4.25979 1.94732 4.35355 1.85355C4.44732 1.75979 4.5 1.63261 4.5 1.5C4.5 1.36739 4.44732 1.24021 4.35355 1.14645C4.25979 1.05268 4.13261 1 4 1H3.5C3.10218 1 2.72064 1.15804 2.43934 1.43934C2.15804 1.72064 2 2.10218 2 2.5V4.5C2.00064 5.06487 2.13839 5.62114 2.4014 6.12104C2.66441 6.62094 3.04484 7.04953 3.51 7.37C3.95736 7.76364 4.32011 8.24404 4.57623 8.78208C4.83236 9.32012 4.97653 9.90457 5 10.5C5 11.4283 5.36875 12.3185 6.02513 12.9749C6.6815 13.6313 7.57174 14 8.5 14C9.42826 14 10.3185 13.6313 10.9749 12.9749C11.6313 12.3185 12 11.4283 12 10.5V9.93C12.4713 9.8083 12.8821 9.51889 13.1553 9.116C13.4285 8.71311 13.5454 8.22441 13.4841 7.7415C13.4227 7.25859 13.1874 6.81463 12.8221 6.49284C12.4569 6.17104 11.9868 5.99351 11.5 5.99351C11.0132 5.99351 10.5431 6.17104 10.1779 6.49284C9.81263 6.81463 9.57728 7.25859 9.51594 7.7415C9.4546 8.22441 9.57149 8.71311 9.8447 9.116C10.1179 9.51889 10.5287 9.8083 11 9.93V10.5C11 11.163 10.7366 11.7989 10.2678 12.2678C9.79893 12.7366 9.16304 13 8.5 13C7.83696 13 7.20107 12.7366 6.73223 12.2678C6.26339 11.7989 6 11.163 6 10.5C6.02473 9.90383 6.17046 9.31893 6.42833 8.78085C6.6862 8.24276 7.05081 7.76275 7.5 7.37C7.96331 7.04842 8.34179 6.61934 8.60303 6.11951C8.86426 5.61968 9.00048 5.06398 9 4.5V2.5C9 2.10218 8.84196 1.72064 8.56066 1.43934C8.27936 1.15804 7.89782 1 7.5 1H7C6.86739 1 6.74021 1.05268 6.64645 1.14645C6.55268 1.24021 6.5 1.36739 6.5 1.5C6.5 1.63261 6.55268 1.75979 6.64645 1.85355C6.74021 1.94732 6.86739 2 7 2H7.5C7.63261 2 7.75979 2.05268 7.85355 2.14645C7.94732 2.24021 8 2.36739 8 2.5V4.5C8 4.8283 7.93534 5.15339 7.8097 5.45671C7.68406 5.76002 7.49991 6.03562 7.26777 6.26777C7.03562 6.49991 6.76002 6.68406 6.45671 6.8097C6.15339 6.93534 5.8283 7 5.5 7ZM11.5 9C11.2348 9 10.9804 8.89464 10.7929 8.70711C10.6054 8.51957 10.5 8.26522 10.5 8C10.5 7.73478 10.6054 7.48043 10.7929 7.29289C10.9804 7.10536 11.2348 7 11.5 7C11.7652 7 12.0196 7.10536 12.2071 7.29289C12.3946 7.48043 12.5 7.73478 12.5 8C12.5 8.26522 12.3946 8.51957 12.2071 8.70711C12.0196 8.89464 11.7652 9 11.5 9Z" fill="white"/>
  </svg>
);

const ConsultationVideoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path d="M8.00027 6.39999C6.72723 6.39999 5.50634 6.90571 4.60616 7.80588C3.70599 8.70606 3.20027 9.92695 3.20027 11.2V14.8128C3.69371 14.4047 4.23023 14.0517 4.80027 13.76V11.2C4.80027 10.3513 5.13742 9.53737 5.73753 8.93725C6.33765 8.33714 7.15158 7.99999 8.00027 7.99999H16.0003C16.849 7.99999 17.6629 8.33714 18.263 8.93725C18.8631 9.53737 19.2003 10.3513 19.2003 11.2V20.8C19.2004 21.4099 19.0262 22.0071 18.6982 22.5213C18.3702 23.0355 17.9021 23.4453 17.3491 23.7024C17.188 24.3531 16.9603 24.9701 16.6659 25.5536C17.8124 25.3931 18.8623 24.8235 19.6221 23.95C20.3818 23.0764 20.8003 21.9577 20.8003 20.8V20.2864L25.6595 23.6416C25.9597 23.8488 26.3108 23.9699 26.6749 23.9919C27.039 24.0139 27.4022 23.9359 27.7251 23.7663C28.0481 23.5968 28.3185 23.3421 28.5072 23.03C28.6958 22.7178 28.7955 22.36 28.7955 21.9952V10.0032C28.7952 9.63857 28.6953 9.28095 28.5066 8.969C28.3178 8.65705 28.0473 8.40264 27.7244 8.23328C27.4015 8.06392 27.0385 7.98606 26.6745 8.00811C26.3106 8.03016 25.9596 8.15129 25.6595 8.35839L20.8003 11.712V11.2C20.8003 9.92695 20.2946 8.70606 19.3944 7.80588C18.4942 6.90571 17.2733 6.39999 16.0003 6.39999H8.00027ZM20.8003 13.6576L26.5683 9.67359C26.6283 9.63214 26.6986 9.60791 26.7714 9.60353C26.8443 9.59914 26.9169 9.61477 26.9815 9.64872C27.0461 9.68267 27.1002 9.73364 27.1379 9.79613C27.1756 9.85861 27.1955 9.93022 27.1955 10.0032V21.9952C27.1955 22.0682 27.1756 22.1398 27.1379 22.2023C27.1002 22.2647 27.0461 22.3157 26.9815 22.3497C26.9169 22.3836 26.8443 22.3992 26.7714 22.3949C26.6986 22.3905 26.6283 22.3662 26.5683 22.3248L20.8003 18.3408V13.6576ZM8.80027 28.8C10.3799 28.7999 11.9156 28.2803 13.1707 27.3213C14.4259 26.3623 15.3309 25.0172 15.7463 23.4932C16.1616 21.9692 16.0642 20.3509 15.4692 18.8877C14.8741 17.4244 13.8144 16.1975 12.4533 15.3959C11.0922 14.5944 9.50532 14.2626 7.9371 14.4518C6.36889 14.6411 4.90642 15.3408 3.77506 16.4431C2.6437 17.5454 1.90623 18.9892 1.67631 20.552C1.44638 22.1147 1.73675 23.7097 2.50267 25.0912L1.63067 27.9536C1.59691 28.0669 1.59441 28.1873 1.62342 28.3019C1.65244 28.4165 1.71189 28.5212 1.7955 28.6048C1.87911 28.6884 1.98376 28.7478 2.09839 28.7768C2.21302 28.8059 2.33335 28.8034 2.44667 28.7696L5.31067 27.8992C6.3787 28.4904 7.57952 28.8004 8.80027 28.8ZM4.80027 20C4.80027 19.7878 4.88456 19.5843 5.03459 19.4343C5.18462 19.2843 5.3881 19.2 5.60027 19.2H12.0003C12.2124 19.2 12.4159 19.2843 12.566 19.4343C12.716 19.5843 12.8003 19.7878 12.8003 20C12.8003 20.2122 12.716 20.4157 12.566 20.5657C12.4159 20.7157 12.2124 20.8 12.0003 20.8H5.60027C5.3881 20.8 5.18462 20.7157 5.03459 20.5657C4.88456 20.4157 4.80027 20.2122 4.80027 20ZM5.60027 24C5.3881 24 5.18462 23.9157 5.03459 23.7657C4.88456 23.6157 4.80027 23.4122 4.80027 23.2C4.80027 22.9878 4.88456 22.7843 5.03459 22.6343C5.18462 22.4843 5.3881 22.4 5.60027 22.4H8.80027C9.01245 22.4 9.21593 22.4843 9.36596 22.6343C9.51599 22.7843 9.60027 22.9878 9.60027 23.2C9.60027 23.4122 9.51599 23.6157 9.36596 23.7657C9.21593 23.9157 9.01245 24 8.80027 24H5.60027Z" fill="#CCCCCC"/>
  </svg>
);

const ConsultationLanguageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path d="M28.074 16H25.4073C25.0537 16 24.7145 16.1405 24.4645 16.3905C24.2144 16.6406 24.074 16.9797 24.074 17.3333C24.074 17.687 24.2144 18.0261 24.4645 18.2761C24.7145 18.5262 25.0537 18.6667 25.4073 18.6667V21.3333H23.826C23.9835 20.9062 24.0669 20.4553 24.0726 20C24.0726 19.1195 23.782 18.2636 23.246 17.5651C22.71 16.8665 21.9584 16.3644 21.1079 16.1365C20.2574 15.9086 19.3555 15.9677 18.542 16.3046C17.7285 16.6416 17.0489 17.2375 16.6086 18C16.5197 18.1517 16.4617 18.3195 16.4378 18.4937C16.414 18.6679 16.4249 18.8451 16.4698 19.0151C16.5148 19.1851 16.5929 19.3446 16.6997 19.4842C16.8065 19.6239 16.9399 19.7411 17.0922 19.829C17.2445 19.9169 17.4126 19.9739 17.587 19.9965C17.7614 20.0192 17.9385 20.0072 18.1082 19.9611C18.2779 19.915 18.4368 19.8358 18.5758 19.7281C18.7148 19.6204 18.8311 19.4862 18.918 19.3333C19.035 19.1307 19.2033 18.9623 19.406 18.8453C19.6087 18.7283 19.8386 18.6667 20.0726 18.6667C20.4262 18.6667 20.7654 18.8071 21.0154 19.0572C21.2655 19.3072 21.406 19.6464 21.406 20C21.406 20.3536 21.2655 20.6928 21.0154 20.9428C20.7654 21.1929 20.4262 21.3333 20.0726 21.3333C19.719 21.3333 19.3799 21.4738 19.1298 21.7239C18.8798 21.9739 18.7393 22.3131 18.7393 22.6667C18.7393 23.0203 18.8798 23.3594 19.1298 23.6095C19.3799 23.8595 19.719 24 20.0726 24C20.4262 24 20.7654 24.1405 21.0154 24.3905C21.2655 24.6406 21.406 24.9797 21.406 25.3333C21.406 25.687 21.2655 26.0261 21.0154 26.2762C20.7654 26.5262 20.4262 26.6667 20.0726 26.6667C19.8386 26.6667 19.6087 26.6051 19.406 26.488C19.2033 26.371 19.035 26.2027 18.918 26C18.8311 25.8471 18.7148 25.713 18.5758 25.6053C18.4368 25.4975 18.2779 25.4183 18.1082 25.3723C17.9385 25.3262 17.7614 25.3141 17.587 25.3368C17.4126 25.3595 17.2445 25.4164 17.0922 25.5043C16.9399 25.5922 16.8065 25.7094 16.6997 25.8491C16.5929 25.9888 16.5148 26.1482 16.4698 26.3182C16.4249 26.4882 16.414 26.6654 16.4378 26.8396C16.4617 27.0139 16.5197 27.1816 16.6086 27.3333C17.0489 28.0959 17.7285 28.6918 18.542 29.0287C19.3555 29.3657 20.2574 29.4248 21.1079 29.1969C21.9584 28.969 22.71 28.4668 23.246 27.7683C23.782 27.0697 24.0726 26.2138 24.0726 25.3333C24.0669 24.8781 23.9835 24.4272 23.826 24H25.406V28C25.406 28.3536 25.5464 28.6928 25.7965 28.9428C26.0465 29.1929 26.3857 29.3333 26.7393 29.3333C27.0929 29.3333 27.4321 29.1929 27.6821 28.9428C27.9322 28.6928 28.0726 28.3536 28.0726 28V18.6667C28.4262 18.6667 28.7654 18.5262 29.0154 18.2761C29.2655 18.0261 29.406 17.687 29.406 17.3333C29.406 16.9797 29.2655 16.6406 29.0154 16.3905C28.7654 16.1405 28.4276 16 28.074 16ZM12.1126 14.9907C12.1542 15.1616 12.2291 15.3226 12.3331 15.4645C12.4371 15.6063 12.5682 15.7261 12.7188 15.8171C12.8693 15.9081 13.0364 15.9683 13.2103 15.9945C13.3843 16.0206 13.5617 16.012 13.7323 15.9693C13.9029 15.9265 14.0634 15.8505 14.2045 15.7454C14.3456 15.6404 14.4645 15.5085 14.5544 15.3573C14.6443 15.2061 14.7033 15.0386 14.7282 14.8644C14.7531 14.6903 14.7433 14.513 14.6993 14.3427L12.3566 4.96934C12.1927 4.31092 11.8133 3.72625 11.2787 3.3084C10.7441 2.89056 10.0851 2.66357 9.40663 2.66357C8.72812 2.66357 8.06911 2.89056 7.53453 3.3084C6.99994 3.72625 6.6205 4.31092 6.45663 4.96934L4.11263 14.3427C4.06867 14.513 4.05884 14.6903 4.08371 14.8644C4.10858 15.0386 4.16766 15.2061 4.25755 15.3573C4.34743 15.5085 4.46635 15.6404 4.60744 15.7454C4.74853 15.8505 4.90901 15.9265 5.07964 15.9693C5.25026 16.012 5.42766 16.0206 5.60161 15.9945C5.77555 15.9683 5.94261 15.9081 6.09317 15.8171C6.24372 15.7261 6.37478 15.6063 6.47881 15.4645C6.58283 15.3226 6.65777 15.1616 6.69929 14.9907L7.44596 12H11.366L12.1126 14.9907ZM8.11396 9.33334L9.04329 5.61734C9.07132 5.54349 9.12115 5.47991 9.18617 5.43504C9.25118 5.39018 9.3283 5.36615 9.40729 5.36615C9.48628 5.36615 9.56341 5.39018 9.62842 5.43504C9.69344 5.47991 9.74326 5.54349 9.77129 5.61734L10.7006 9.33334H8.11396ZM18.7406 9.33334H20.074C20.4276 9.33334 20.7667 9.47382 21.0168 9.72386C21.2668 9.97391 21.4073 10.3131 21.4073 10.6667V12C21.4073 12.3536 21.5478 12.6928 21.7978 12.9428C22.0479 13.1929 22.387 13.3333 22.7406 13.3333C23.0942 13.3333 23.4334 13.1929 23.6834 12.9428C23.9335 12.6928 24.074 12.3536 24.074 12V10.6667C24.0729 9.60613 23.6511 8.58933 22.9012 7.83942C22.1513 7.0895 21.1345 6.66773 20.074 6.66667H18.7406C18.387 6.66667 18.0479 6.80715 17.7978 7.0572C17.5478 7.30725 17.4073 7.64638 17.4073 8.00001C17.4073 8.35363 17.5478 8.69277 17.7978 8.94282C18.0479 9.19286 18.387 9.33334 18.7406 9.33334ZM13.4073 21.3333H12.074C11.7203 21.3333 11.3812 21.1929 11.1312 20.9428C10.8811 20.6928 10.7406 20.3536 10.7406 20V18.6667C10.7406 18.3131 10.6002 17.9739 10.3501 17.7239C10.1001 17.4738 9.76092 17.3333 9.40729 17.3333C9.05367 17.3333 8.71453 17.4738 8.46448 17.7239C8.21444 17.9739 8.07396 18.3131 8.07396 18.6667V20C8.07502 21.0605 8.49679 22.0773 9.2467 22.8273C9.99662 23.5772 11.0134 23.9989 12.074 24H13.4073C13.7609 24 14.1001 23.8595 14.3501 23.6095C14.6002 23.3594 14.7406 23.0203 14.7406 22.6667C14.7406 22.3131 14.6002 21.9739 14.3501 21.7239C14.1001 21.4738 13.7609 21.3333 13.4073 21.3333Z" fill="#CCCCCC"/>
  </svg>
);

const ConsultationClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path d="M15.9993 2.66666C23.3633 2.66666 29.3327 8.63599 29.3327 16C29.3327 23.364 23.3633 29.3333 15.9993 29.3333C8.63535 29.3333 2.66602 23.364 2.66602 16C2.66602 8.63599 8.63535 2.66666 15.9993 2.66666ZM15.9993 5.33332C13.1704 5.33332 10.4573 6.45713 8.45688 8.45752C6.45649 10.4579 5.33268 13.171 5.33268 16C5.33268 18.829 6.45649 21.5421 8.45688 23.5425C10.4573 25.5428 13.1704 26.6667 15.9993 26.6667C18.8283 26.6667 21.5414 25.5428 23.5418 23.5425C25.5422 21.5421 26.666 18.829 26.666 16C26.666 13.171 25.5422 10.4579 23.5418 8.45752C21.5414 6.45713 18.8283 5.33332 15.9993 5.33332ZM15.9993 7.99999C16.3259 8.00003 16.6411 8.11993 16.8852 8.33694C17.1292 8.55396 17.2851 8.85299 17.3233 9.17732L17.3327 9.33332V15.448L20.942 19.0573C21.1811 19.2973 21.32 19.6192 21.3303 19.9578C21.3407 20.2964 21.2217 20.6263 20.9977 20.8804C20.7736 21.1344 20.4613 21.2937 20.124 21.3259C19.7868 21.358 19.45 21.2605 19.182 21.0533L19.0567 20.9427L15.0567 16.9427C14.8495 16.7353 14.7164 16.4653 14.678 16.1747L14.666 16V9.33332C14.666 8.9797 14.8065 8.64056 15.0565 8.39051C15.3066 8.14047 15.6457 7.99999 15.9993 7.99999Z" fill="#CCCCCC"/>
  </svg>
);

const OverlayCloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <rect width="32" height="32" rx="16" fill="#063533" />
    <path d="M23.1992 8.75C23.2127 8.75003 23.2258 8.75513 23.2354 8.76465C23.2449 8.77417 23.25 8.78732 23.25 8.80078C23.25 8.81422 23.2448 8.82738 23.2354 8.83691L16.6006 15.4697L16.0703 16L16.6006 16.5303L23.2354 23.1631C23.2448 23.1726 23.25 23.1858 23.25 23.1992C23.25 23.2127 23.2449 23.2258 23.2354 23.2354C23.2258 23.2449 23.2127 23.25 23.1992 23.25C23.1858 23.25 23.1726 23.2448 23.1631 23.2354L16.5303 16.6006L16 16.0703L15.4697 16.6006L8.83691 23.2354C8.82738 23.2448 8.81422 23.25 8.80078 23.25C8.78732 23.25 8.77417 23.2449 8.76465 23.2354C8.75513 23.2258 8.75003 23.2127 8.75 23.1992C8.75 23.1858 8.75518 23.1726 8.76465 23.1631L15.3994 16.5303L15.9297 16L15.3994 15.4697L8.76465 8.83691C8.75998 8.83221 8.75644 8.82643 8.75391 8.82031C8.75136 8.81415 8.75 8.80745 8.75 8.80078C8.75002 8.79414 8.75136 8.78739 8.75391 8.78125C8.75646 8.77514 8.75996 8.76933 8.76465 8.76465C8.76933 8.75996 8.77514 8.75646 8.78125 8.75391C8.78739 8.75136 8.79414 8.75002 8.80078 8.75C8.80745 8.75 8.81415 8.75136 8.82031 8.75391C8.82643 8.75644 8.83221 8.75998 8.83691 8.76465L15.4697 15.3994L16 15.9297L16.5303 15.3994L23.1631 8.76465C23.1726 8.75518 23.1858 8.75 23.1992 8.75Z" fill="white" stroke="white" strokeWidth="1.5" />
  </svg>
);

const AppointmentInfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M9 15H11V9H9V15ZM10 7C10.2833 7 10.5208 6.90417 10.7125 6.7125C10.9042 6.52083 11 6.28333 11 6C11 5.71667 10.9042 5.47917 10.7125 5.2875C10.5208 5.09583 10.2833 5 10 5C9.71667 5 9.47917 5.09583 9.2875 5.2875C9.09583 5.47917 9 5.71667 9 6C9 6.28333 9.09583 6.52083 9.2875 6.7125C9.47917 6.90417 9.71667 7 10 7ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20Z" fill="#90DF9E" />
  </svg>
);

const PreferredDateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M6.66797 1.66699V5.00033M13.3346 1.66699V5.00033" stroke="#9A9A9A" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.16667 3.3335H15.8333C16.7538 3.3335 17.5 4.07969 17.5 5.00016V16.6668C17.5 17.5873 16.7538 18.3335 15.8333 18.3335H4.16667C3.24619 18.3335 2.5 17.5873 2.5 16.6668V5.00016C2.5 4.07969 3.24619 3.3335 4.16667 3.3335V3.3335" stroke="#9A9A9A" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.5 8.3335H17.5" stroke="#9A9A9A" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PreferredTimeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="19" viewBox="0 0 20 19" fill="none" aria-hidden="true">
    <path d="M10 0C15.523 0 20 4.1045 20 9.16798C20 14.2315 15.523 18.336 10 18.336C4.477 18.336 0 14.2315 0 9.16798C0 4.1045 4.477 0 10 0ZM10 1.8336C7.87827 1.8336 5.84344 2.60632 4.34315 3.98179C2.84285 5.35725 2 7.22278 2 9.16798C2 11.1132 2.84285 12.9787 4.34315 14.3542C5.84344 15.7296 7.87827 16.5024 10 16.5024C12.1217 16.5024 14.1566 15.7296 15.6569 14.3542C17.1571 12.9787 18 11.1132 18 9.16798C18 7.22278 17.1571 5.35725 15.6569 3.98179C14.1566 2.60632 12.1217 1.8336 10 1.8336ZM10 3.66719C10.2449 3.66722 10.4813 3.74966 10.6644 3.89888C10.8474 4.0481 10.9643 4.25371 10.993 4.47672L11 4.58399V8.78842L13.707 11.2702C13.8863 11.4352 13.9905 11.6566 13.9982 11.8894C14.006 12.1222 13.9168 12.349 13.7488 12.5237C13.5807 12.6984 13.3464 12.8079 13.0935 12.83C12.8406 12.8521 12.588 12.7851 12.387 12.6426L12.293 12.5665L9.293 9.81615C9.13758 9.67354 9.03776 9.48794 9.009 9.28808L9 9.16798V4.58399C9 4.34084 9.10536 4.10765 9.29289 3.93571C9.48043 3.76378 9.73478 3.66719 10 3.66719Z" fill="#9A9A9A" />
  </svg>
);

const ReviewDateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" viewBox="0 0 18 20" fill="none" aria-hidden="true">
    <path d="M2 20C1.45 20 0.979167 19.8042 0.5875 19.4125C0.195833 19.0208 0 18.55 0 18V4C0 3.45 0.195833 2.97917 0.5875 2.5875C0.979167 2.19583 1.45 2 2 2H3V0H5V2H13V0H15V2H16C16.55 2 17.0208 2.19583 17.4125 2.5875C17.8042 2.97917 18 3.45 18 4V18C18 18.55 17.8042 19.0208 17.4125 19.4125C17.0208 19.8042 16.55 20 16 20H2ZM2 18H16V8H2V18ZM2 6H16V4H2V6ZM2 6V4V6Z" fill="#90DF9E" />
  </svg>
);

const ReviewTimeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M13.3 14.7L14.7 13.3L11 9.6V5H9V10.4L13.3 14.7ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20ZM10 18C12.2167 18 14.1042 17.2208 15.6625 15.6625C17.2208 14.1042 18 12.2167 18 10C18 7.78333 17.2208 5.89583 15.6625 4.3375C14.1042 2.77917 12.2167 2 10 2C7.78333 2 5.89583 2.77917 4.3375 4.3375C2.77917 5.89583 2 7.78333 2 10C2 12.2167 2.77917 14.1042 4.3375 15.6625C5.89583 17.2208 7.78333 18 10 18Z" fill="#90DF9E" />
  </svg>
);

const ReviewPaymentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M21 11.5V20.5H3V11.5H21Z" stroke="#9A9A9A" />
    <path d="M12 14.0004C12.5303 14.0004 13.039 14.2104 13.4141 14.5853C13.7891 14.9604 14 15.4699 14 16.0004C13.9999 16.5307 13.789 17.0394 13.4141 17.4144C13.039 17.7894 12.5303 18.0004 12 18.0004C11.4697 18.0004 10.961 17.7894 10.5859 17.4144C10.211 17.0394 10.0001 16.5307 10 16.0004C10 15.4699 10.2109 14.9604 10.5859 14.5853C10.961 14.2104 11.4697 14.0004 12 14.0004ZM16.7285 6.58142L16.9434 6.8822L17.2939 6.76501L18.6875 6.30017L20.125 10.5033H4.42871L14.0449 2.8197L16.7285 6.58142Z" stroke="#9A9A9A" />
    <path d="M21 11.003H20.824L19.001 5.66998L3.354 11.003L3 11M2.5 11.004H3L14.146 2.09998L16.963 6.04998" stroke="#9A9A9A" strokeLinecap="square" />
    <path d="M14.5 16C14.5 16.663 14.2366 17.2989 13.7678 17.7678C13.2989 18.2366 12.663 18.5 12 18.5C11.337 18.5 10.7011 18.2366 10.2322 17.7678C9.76339 17.2989 9.5 16.663 9.5 16C9.5 15.337 9.76339 14.7011 10.2322 14.2322C10.7011 13.7634 11.337 13.5 12 13.5C12.663 13.5 13.2989 13.7634 13.7678 14.2322C14.2366 14.7011 14.5 15.337 14.5 16Z" stroke="#9A9A9A" strokeLinecap="square" />
    <path d="M21.5 11V21H2.5V11H21.5Z" stroke="#9A9A9A" strokeLinecap="square" />
    <path d="M2.5 11H4.5C4.5 11.5304 4.28929 12.0391 3.91421 12.4142C3.53914 12.7893 3.03043 13 2.5 13V11ZM21.5 11H19.5C19.5 11.5304 19.7107 12.0391 20.0858 12.4142C20.4609 12.7893 20.9696 13 21.5 13V11ZM2.5 21H4.502C4.50226 20.737 4.45066 20.4766 4.35014 20.2336C4.24963 19.9905 4.10217 19.7697 3.91621 19.5838C3.73026 19.3978 3.50946 19.2504 3.26644 19.1499C3.02343 19.0493 2.76298 18.9977 2.5 18.998V21ZM21.5 21H19.5C19.5 20.4696 19.7107 19.9609 20.0858 19.5858C20.4609 19.2107 20.9696 19 21.5 19V21Z" stroke="#9A9A9A" strokeLinecap="square" />
  </svg>
);

const ReviewRefundIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" viewBox="0 0 16 20" fill="none" aria-hidden="true">
    <path d="M6.95 13.55L12.6 7.9L11.175 6.475L6.95 10.7L4.85 8.6L3.425 10.025L6.95 13.55ZM8 20C5.68333 19.4167 3.77083 18.0875 2.2625 16.0125C0.754167 13.9375 0 11.6333 0 9.1V3L8 0L16 3V9.1C16 11.6333 15.2458 13.9375 13.7375 16.0125C12.2292 18.0875 10.3167 19.4167 8 20Z" fill="#90DF9E" />
  </svg>
);

const ConfirmTickIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="18" viewBox="0 0 25 18" fill="none" aria-hidden="true">
    <path d="M23.0013 1.6665L8.33463 16.3332L1.66797 9.6665" stroke="#90DF9E" strokeWidth="3.33333" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const APPOINTMENT_DATES = [
  { id: 'mon-12', day: 'Mon', fullDay: 'Monday', date: '12', month: 'Feb' },
  { id: 'tue-13', day: 'Tue', fullDay: 'Tuesday', date: '13', month: 'Feb' },
  { id: 'wed-14', day: 'Wed', fullDay: 'Wednesday', date: '14', month: 'Feb' },
  { id: 'thu-15', day: 'Thu', fullDay: 'Thursday', date: '15', month: 'Feb' },
];

const APPOINTMENT_SLOT_ROWS = [
  ['09:00 - 11:00 AM', '11:00 - 01:00 PM'],
  ['01:00 - 03:00 PM', '03:00 - 05:00 PM'],
  ['05:00 - 07:00 PM'],
];

const getDayWithOrdinal = (dayValue) => {
  const dayNumber = Number(dayValue);
  if (!Number.isFinite(dayNumber) || dayNumber <= 0) return String(dayValue);

  const remainder = dayNumber % 10;
  const teenCheck = dayNumber % 100;
  if (teenCheck >= 11 && teenCheck <= 13) return `${dayNumber}th`;
  if (remainder === 1) return `${dayNumber}st`;
  if (remainder === 2) return `${dayNumber}nd`;
  if (remainder === 3) return `${dayNumber}rd`;
  return `${dayNumber}th`;
};

const DOCTOR_PROFILES = [
  {
    id: 'doc-sarah',
    name: 'Dr. Sarah Jenkins',
    feeNow: '₹ 499/-',
    feeOld: '₹ 999/-',
    role: 'General Physician',
    experienceText: '8+ years experience',
    image: sarahPhoto,
    rating: '4.9',
    reviewCount: '1.2k reviews',
    tags: ['Diabetes', 'Hypertension', 'Thyroid', '+ More'],
    availability: 'Mon- Fri',
    timings: '5 - 9 PM',
    appointment: '20 mins',
    category: 'GENERAL PHYSICIAN',
    stats: [
      { label: 'Experience', value: '6+ Years' },
      { label: 'Qualifications', value: 'MSc' },
      { label: 'Patients', value: '2.4k+' },
    ],
    expertise: ['Weight Loss', 'Muscle Gain', 'Thyroid', 'PCOS', 'Gut Health'],
    about: 'Dr. Julian Vance is a world-renowned specialist in preventative cardiology and cardiovascular imaging. With a patient-first philosophy, he integrates advanced diagnostic tech with personalized lifestyle strategies.',
    consultation: [
      { id: 'video', icon: <ConsultationVideoIcon />, label: 'Video / Chat' },
      { id: 'duration', icon: <ConsultationClockIcon />, label: '30 minutes' },
      { id: 'language', icon: <ConsultationLanguageIcon />, label: 'English / Hindi' },
    ],
    reviews: [
      {
        id: 'doc-r1',
        text: '"Dr. Sarah was incredibly attentive and practical. I left the consultation with a clear action plan."',
        author: 'Neha S.',
      },
      {
        id: 'doc-r2',
        text: '"Very thorough and easy to understand. The follow-up guidance was exactly what I needed."',
        author: 'Karan M.',
      },
    ],
  },
  {
    id: 'doc-arjun',
    name: 'Dr. Arjun Rao',
    feeNow: '₹ 499/-',
    feeOld: '₹ 999/-',
    role: 'General Physician',
    experienceText: '10+ years experience',
    image: sarahPhoto,
    rating: '4.8',
    reviewCount: '940 reviews',
    tags: ['Cardiac', 'BP', 'Stress', '+ More'],
    availability: 'Mon- Sat',
    timings: '10 AM - 4 PM',
    appointment: '25 mins',
    category: 'GENERAL PHYSICIAN',
    stats: [
      { label: 'Experience', value: '10 Years' },
      { label: 'Qualifications', value: 'MBBS, MD' },
      { label: 'Patients', value: '2.1k+' },
    ],
    expertise: ['Cardiac Risk', 'Diabetes', 'Hypertension', 'Lifestyle'],
    about: 'Dr. Arjun Rao focuses on preventive care and long-term metabolic health planning, helping patients build practical routines backed by diagnostics.',
    consultation: [
      { id: 'video', icon: <ConsultationVideoIcon />, label: 'Video / Chat' },
      { id: 'duration', icon: <ConsultationClockIcon />, label: '25 minutes' },
      { id: 'language', icon: <ConsultationLanguageIcon />, label: 'English / Hindi / Telugu' },
    ],
    reviews: [
      {
        id: 'doc-r3',
        text: '"Great consultation quality and very patient in explaining every concern."',
        author: 'Vikas P.',
      },
      {
        id: 'doc-r4',
        text: '"Structured, practical and reassuring. Highly recommend for preventive care."',
        author: 'Aditi G.',
      },
    ],
  },
];

const NUTRITIONIST_PROFILES = [
  {
    id: 'nut-anaya',
    name: 'Dr. Anaya Mehta',
    feeNow: '₹ 399/-',
    feeOld: '₹ 799/-',
    role: 'Nutritionist',
    experienceText: '7+ years experience',
    image: lizzyPhoto,
    rating: '4.9',
    reviewCount: '980 reviews',
    tags: ['Weight Loss', 'PCOS', 'Thyroid', '+ More'],
    availability: 'Mon- Sat',
    timings: '8 AM - 2 PM',
    appointment: '25 mins',
    category: 'NUTRITIONIST',
    stats: [
      { label: 'Experience', value: '7 Years' },
      { label: 'Qualifications', value: 'MSc Nutrition' },
      { label: 'Patients', value: '1.8k+' },
    ],
    expertise: ['Weight Loss', 'PCOS', 'Thyroid', 'Gut Health'],
    about: 'Dr. Anaya builds practical nutrition plans around your blood markers, food preferences, and daily routine for sustainable outcomes.',
    consultation: [
      { id: 'video', icon: <ConsultationVideoIcon />, label: 'Video / Chat' },
      { id: 'duration', icon: <ConsultationClockIcon />, label: '30 minutes' },
      { id: 'language', icon: <ConsultationLanguageIcon />, label: 'English / Hindi' },
    ],
    reviews: [
      {
        id: 'nut-r1',
        text: '"Simple, realistic meal plan and clear goals. I could actually follow it daily."',
        author: 'Priya R.',
      },
      {
        id: 'nut-r2',
        text: '"Very supportive and data-driven. My digestion and energy improved within weeks."',
        author: 'Aman T.',
      },
    ],
  },
  {
    id: 'nut-rhea',
    name: 'Rhea Kapoor',
    feeNow: '₹ 399/-',
    feeOld: '₹ 799/-',
    role: 'Nutritionist',
    experienceText: '6+ years experience',
    image: lizzyPhoto,
    rating: '4.8',
    reviewCount: '760 reviews',
    tags: ['Fat Loss', 'Gut Health', 'PCOS', '+ More'],
    availability: 'Tue- Sun',
    timings: '11 AM - 5 PM',
    appointment: '20 mins',
    category: 'NUTRITIONIST',
    stats: [
      { label: 'Experience', value: '6 Years' },
      { label: 'Qualifications', value: 'BSc, PG Dip' },
      { label: 'Patients', value: '1.3k+' },
    ],
    expertise: ['Gut Health', 'PCOS', 'Sports Nutrition', 'Metabolic Care'],
    about: 'Rhea helps you align nutrition with energy, hormones, and long-term goals using data-backed recommendations and easy meal systems.',
    consultation: [
      { id: 'video', icon: <ConsultationVideoIcon />, label: 'Video / Chat' },
      { id: 'duration', icon: <ConsultationClockIcon />, label: '20 minutes' },
      { id: 'language', icon: <ConsultationLanguageIcon />, label: 'English / Hindi' },
    ],
    reviews: [
      {
        id: 'nut-r3',
        text: '"Rhea gave me a plan that matched my routine perfectly. Super practical guidance."',
        author: 'Sneha V.',
      },
      {
        id: 'nut-r4',
        text: '"Clear macro and lifestyle recommendations. Easy to execute and effective."',
        author: 'Rahul D.',
      },
    ],
  },
];

const formatSelectedAppointment = (selectedDateId, selectedTimeSlot) => {
  const selectedDate = APPOINTMENT_DATES.find((item) => item.id === selectedDateId);
  if (!selectedDate || !selectedTimeSlot) return 'Select date and time';
  return `${getDayWithOrdinal(selectedDate.date)} ${selectedDate.month}  |  ${selectedTimeSlot}`;
};

const formatAmount = (amount) => {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) {
    return '0';
  }

  return Number.isInteger(numericAmount)
    ? numericAmount.toFixed(0)
    : numericAmount.toFixed(2);
};

const IntegratedHealthProgramPage = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('doctor');
  const [expandedByTab, setExpandedByTab] = useState({
    doctor: null,
    nutritionist: null,
  });
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [selectedNutritionistId, setSelectedNutritionistId] = useState(null);

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleStep, setScheduleStep] = useState('schedule');
  const [selectedDateId, setSelectedDateId] = useState('mon-12');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('09:00 - 11:00 AM');

  const detailsRef = useRef(null);
  const cardsRowRef = useRef(null);

  const currentProfiles = activeTab === 'doctor' ? DOCTOR_PROFILES : NUTRITIONIST_PROFILES;
  const activeExpandedId = expandedByTab[activeTab];

  const expandedProfile = useMemo(() => {
    const targetId = expandedByTab[activeTab];
    if (!targetId) {
      return null;
    }
    return currentProfiles.find((item) => item.id === targetId) || null;
  }, [activeTab, currentProfiles, expandedByTab]);

  const selectedDoctor = DOCTOR_PROFILES.find((item) => item.id === selectedDoctorId) || null;
  const selectedNutritionist = NUTRITIONIST_PROFILES.find((item) => item.id === selectedNutritionistId) || null;
  const canBook = Boolean(selectedDoctor && selectedNutritionist);

  const consultationFee = (selectedDoctor ? 320 : 0) + (selectedNutritionist ? 280 : 0);
  const taxRate = 0.05;
  const serviceTax = consultationFee * taxRate;
  const totalAmount = consultationFee + serviceTax;

  const selectedAppointmentText = useMemo(
    () => formatSelectedAppointment(selectedDateId, selectedTimeSlot),
    [selectedDateId, selectedTimeSlot],
  );

  const reviewDateText = useMemo(() => {
    const selectedDate = APPOINTMENT_DATES.find((item) => item.id === selectedDateId);
    if (!selectedDate) {
      return '--';
    }
    return `${selectedDate.month} ${getDayWithOrdinal(selectedDate.date)}, ${selectedDate.fullDay}`;
  }, [selectedDateId]);

  const confirmedDateText = useMemo(() => {
    const selectedDate = APPOINTMENT_DATES.find((item) => item.id === selectedDateId);
    if (!selectedDate) {
      return '--';
    }
    return `${selectedDate.month} ${selectedDate.date}, ${selectedDate.day}`;
  }, [selectedDateId]);

  useEffect(() => {
    if (!isScheduleOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isScheduleOpen]);

  const closeScheduleOverlay = () => {
    setIsScheduleOpen(false);
    setScheduleStep('schedule');
  };

  const handleBookClick = () => {
    if (!canBook) return;
    setScheduleStep('schedule');
    setIsScheduleOpen(true);
  };

  const centerCardInRow = (profileId) => {
    const row = cardsRowRef.current;
    if (!row) {
      return;
    }

    const targetCard = row.querySelector(`[data-profile-id="${profileId}"]`);
    if (!targetCard) {
      return;
    }

    const computedStyle = window.getComputedStyle(row);
    const paddingLeft = parseFloat(computedStyle.paddingLeft || '0') || 0;
    const maxScrollLeft = Math.max(0, row.scrollWidth - row.clientWidth);
    const centeredLeft = targetCard.offsetLeft - paddingLeft - ((row.clientWidth - targetCard.clientWidth) / 2);
    const nextScrollLeft = Math.min(maxScrollLeft, Math.max(0, centeredLeft));
    row.scrollTo({ left: nextScrollLeft, behavior: 'smooth' });
  };

  const openProfile = (profileId) => {
    const currentExpandedId = expandedByTab[activeTab];
    const nextId = currentExpandedId === profileId ? null : profileId;

    setExpandedByTab((prev) => ({ ...prev, [activeTab]: nextId }));

    if (!nextId) {
      return;
    }

    centerCardInRow(profileId);

    setTimeout(() => {
      detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const handleSelectCurrentExpert = () => {
    if (!expandedProfile) return;

    if (activeTab === 'doctor') {
      setSelectedDoctorId(expandedProfile.id);
      setActiveTab('nutritionist');
      return;
    }

    setSelectedNutritionistId(expandedProfile.id);
  };

  const handleFooterActionClick = () => {
    if (canBook) {
      handleBookClick();
      return;
    }

    if (expandedProfile) {
      handleSelectCurrentExpert();
      return;
    }

    if (!selectedDoctor) {
      setActiveTab('doctor');
      return;
    }

    if (!selectedNutritionist) {
      setActiveTab('nutritionist');
    }
  };

  const focusSelectedProfile = (tab, profileId) => {
    setActiveTab(tab);

    if (!profileId) {
      return;
    }

    setExpandedByTab((prev) => ({ ...prev, [tab]: profileId }));

    setTimeout(() => {
      centerCardInRow(profileId);
      detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const doctorAvatarImage = selectedDoctor?.image || doctorAvatar;
  const nutritionAvatarImage = selectedNutritionist?.image || nutritionistAvatar;
  const hasActiveSelectionCard = Boolean(expandedProfile) && !canBook;
  const footerButtonLabel = canBook
    ? 'BOOK'
    : expandedProfile
      ? (activeTab === 'doctor' ? 'Select Doctor' : 'Select Nutritionist')
      : 'Select';

  return (
    <div className="ihp-page">
      <header className="ihp-page__header">
        <div className="ihp-page__header-left">
          <button type="button" className="ihp-page__icon-btn" onClick={onBack} aria-label="Go back">
            <BackIcon />
          </button>
          <h1 className="ihp-page__title">Expert Details</h1>
        </div>

        <div className="ihp-page__header-actions">
          <button type="button" className="ihp-page__icon-btn" aria-label="Share profile">
            <ShareIcon />
          </button>
          <button type="button" className="ihp-page__icon-btn" aria-label="Open cart">
            <CartIcon />
          </button>
        </div>
      </header>

      <section className="ihp-page__hero">
        <div className="ihp-page__avatars-wrap">
          <div className="ihp-page__avatars">
            <img className="ihp-page__hero-avatar" src={doctorAvatarImage} alt="Selected doctor" />
            <img className="ihp-page__hero-avatar" src={nutritionAvatarImage} alt="Selected nutritionist" />
          </div>
          <span className="ihp-page__care-pill">Care Team</span>
        </div>

        <div className="ihp-page__hero-copy">
          <h2 className="ihp-page__hero-title">Integrated Health Program</h2>
          <p className="ihp-page__hero-text">
            A combined approach to diagnose, guide, and transform your health through expert medical and nutritional care.
          </p>
        </div>
      </section>

      <section className="ihp-page__meet-section">
        <h3 className="ihp-page__meet-title">Meet Your Experts</h3>

        <div className="ihp-page__tabs" role="tablist" aria-label="Expert type tabs">
          <button
            type="button"
            className={`ihp-page__tab ${activeTab === 'doctor' ? 'is-active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'doctor'}
            onClick={() => setActiveTab('doctor')}
          >
            Doctor
          </button>
          <button
            type="button"
            className={`ihp-page__tab ${activeTab === 'nutritionist' ? 'is-active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'nutritionist'}
            onClick={() => setActiveTab('nutritionist')}
          >
            Nutritionist
          </button>
        </div>

        <div className="ihp-page__divider" />

        <div ref={cardsRowRef} className="ihp-page__cards-row" aria-label="Expert cards">
          {currentProfiles.map((profile) => {
            const isOpen = expandedByTab[activeTab] === profile.id;
            return (
              <article key={profile.id} data-profile-id={profile.id} className={`ihp-card ${isOpen ? 'is-open' : ''}`}>
                <div className="ihp-card__top">
                  <div className="ihp-card__photo-wrap">
                    <img className="ihp-card__photo" src={profile.image} alt={profile.name} />
                    <img className="ihp-card__verified" src={verifiedBadge} alt="Verified" />
                  </div>

                  <div className="ihp-card__copy">
                    <h4 className="ihp-card__name">{profile.name}</h4>
                    <p className="ihp-card__role">{profile.role}</p>
                    <p className="ihp-card__exp">{profile.experienceText}</p>
                  </div>

                  <div className="ihp-card__rating">
                    <RatingStarIcon />
                    <span>{profile.rating}</span>
                  </div>
                </div>

                <div className="ihp-card__tags">
                  {profile.tags.map((tag) => (
                    <span key={`${profile.id}-${tag}`} className="ihp-card__tag">{tag}</span>
                  ))}
                </div>

                <div className="ihp-card__metrics">
                  <div className="ihp-card__metric">
                    <span className="ihp-card__metric-value">{profile.availability}</span>
                    <span className="ihp-card__metric-label">Available</span>
                  </div>
                  <div className="ihp-card__metric-separator" aria-hidden="true" />
                  <div className="ihp-card__metric">
                    <span className="ihp-card__metric-value">{profile.timings}</span>
                    <span className="ihp-card__metric-label">Timings</span>
                  </div>
                  <div className="ihp-card__metric-separator" aria-hidden="true" />
                  <div className="ihp-card__metric">
                    <span className="ihp-card__metric-value">{profile.appointment}</span>
                    <span className="ihp-card__metric-label">Appointment</span>
                  </div>
                </div>

                <button
                  type="button"
                  className={`ihp-card__view-btn ${isOpen ? 'is-open' : ''}`}
                  onClick={() => openProfile(profile.id)}
                >
                  <span>{isOpen ? 'Hide Details' : 'View Details'}</span>
                  <ViewDetailsArrowIcon isOpen={isOpen} />
                </button>
              </article>
            );
          })}
        </div>

        <div className="ihp-page__divider ihp-page__divider--below" />
      </section>

      {expandedProfile ? (
      <section className="ihp-page__details" ref={detailsRef}>
        <div className="expert-details-page__identity" aria-label="Expert identity">
          <div className="expert-details-page__photo-wrap">
            <div className="expert-details-page__photo-box">
              <img src={expandedProfile.image} alt={expandedProfile.name} className="expert-details-page__photo" />
            </div>
            <div className="expert-details-page__rating-box" aria-label={`Rating ${expandedProfile.rating}`}>
              <RatingStarIcon />
              <span className="expert-details-page__rating-text">{expandedProfile.rating}</span>
            </div>
          </div>

          <div className="expert-details-page__identity-content">
            <p className="expert-details-page__category">{expandedProfile.category}</p>
            <h2 className="expert-details-page__name">{expandedProfile.name}</h2>
          </div>
        </div>

        <section className="expert-details-page__stats" aria-label="Experience and details">
          {expandedProfile.stats.map((item) => (
            <article key={item.label} className="expert-details-page__stat-card">
              <p className="expert-details-page__stat-label">{item.label}</p>
              <p className="expert-details-page__stat-value">{item.value}</p>
            </article>
          ))}
        </section>

        <section className="expert-details-page__expertise" aria-label="Expertise">
          <h3 className="expert-details-page__section-title">Expertise</h3>
          <div className="expert-details-page__pills">
            {expandedProfile.expertise.map((item) => (
              <span key={`${expandedProfile.id}-${item}`} className="expert-details-page__pill">{item}</span>
            ))}
          </div>
        </section>

        <section className="expert-details-page__about" aria-label="About">
          <h3 className="expert-details-page__section-title">About</h3>
          <p className="expert-details-page__about-text">{expandedProfile.about}</p>
        </section>

        <section className="expert-details-page__consultation" aria-label="Consultation details">
          <h3 className="expert-details-page__section-title">Consultation Details</h3>
          <div className="expert-details-page__consultation-items">
            {expandedProfile.consultation.map((item) => (
              <article key={item.id} className="expert-details-page__consultation-item">
                <div className="expert-details-page__consultation-circle">{item.icon}</div>
                <p className="expert-details-page__consultation-text">{item.label}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="expert-details-page__reviews" aria-label="Reviews">
          <h3 className="expert-details-page__section-title">Reviews</h3>
          <div className="expert-details-page__reviews-viewport">
            <div className="expert-details-page__reviews-track">
              {[...(expandedProfile.reviews || []), ...(expandedProfile.reviews || [])].map((review, index) => (
                <article key={`${review.id}-${index}`} className="expert-details-page__review-card">
                  <div className="expert-details-page__review-stars" aria-hidden="true">
                    <RatingStarIcon />
                    <RatingStarIcon />
                    <RatingStarIcon />
                    <RatingStarIcon />
                    <RatingStarIcon />
                  </div>

                  <p className="expert-details-page__review-text">{review.text}</p>

                  <div className="expert-details-page__review-footer">
                    <span className="expert-details-page__review-author">{review.author}</span>
                    <span className="expert-details-page__verified-pill">
                      <span>Verified</span>
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className="ihp-page__select-wrap">
          <button type="button" className="ihp-page__select-btn" onClick={handleSelectCurrentExpert}>
            {activeTab === 'doctor' ? 'Select Doctor' : 'Select Nutritionist'}
          </button>
        </div>
      </section>
      ) : null}

      <footer className="ihp-page__footer-stack" aria-label="Selected expert and action">
        {selectedDoctor || selectedNutritionist ? (
          <div className="ihp-page__selected-panel">
            {selectedDoctor ? (
              <div className="ihp-page__selected-row">
                <div className="ihp-page__selected-left">
                  <div className="ihp-page__selected-icon-box" aria-hidden="true">
                    <DoctorSelectedIcon />
                  </div>

                  <div className="ihp-page__selected-copy">
                    <p className="ihp-page__selected-label">Doctor Selected</p>
                    <p className="ihp-page__selected-name">{selectedDoctor.name}</p>
                  </div>
                </div>

                <button type="button" className="ihp-page__change-btn" onClick={() => focusSelectedProfile('doctor', selectedDoctor.id)}>
                  <span>Change</span>
                  <ChangeArrowIcon />
                </button>
              </div>
            ) : null}

            {selectedNutritionist ? (
              <div className="ihp-page__selected-row">
                <div className="ihp-page__selected-left">
                  <div className="ihp-page__selected-icon-box" aria-hidden="true">
                    <img src={nutritionSelectedIcon} alt="" className="ihp-page__selected-icon-image" />
                  </div>

                  <div className="ihp-page__selected-copy">
                    <p className="ihp-page__selected-label">Nutritionist Selected</p>
                    <p className="ihp-page__selected-name">{selectedNutritionist.name}</p>
                  </div>
                </div>

                <button type="button" className="ihp-page__change-btn" onClick={() => focusSelectedProfile('nutritionist', selectedNutritionist.id)}>
                  <span>Change</span>
                  <ChangeArrowIcon />
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="ihp-page__selection-footer">
          {canBook ? (
            <div className="ihp-page__fee-block">
              <p className="ihp-page__fee-title">Appointment Fee</p>
              <p className="ihp-page__fee-team">Care Team</p>
              <div className="ihp-page__fee-row">
                <span className="ihp-page__fee-now">₹ 999/-</span>
                <span className="ihp-page__fee-old">₹ 1999/-</span>
              </div>
            </div>
          ) : expandedProfile ? (
            <div className="ihp-page__active-expert-block">
              <p className="ihp-page__active-expert-name">{expandedProfile.name}</p>
              <div className="ihp-page__active-expert-fee-row">
                <span className="ihp-page__active-expert-fee-now">{expandedProfile.feeNow}</span>
                <span className="ihp-page__active-expert-fee-old">{expandedProfile.feeOld}</span>
              </div>
            </div>
          ) : (
            <p className="ihp-page__selection-empty">
              {selectedDoctor ? 'No Nutritionist Selected' : selectedNutritionist ? 'No Doctor Selected' : 'No Doctor/ Nutritionist Selected'}
            </p>
          )}

          <button
            type="button"
            className={`ihp-page__selection-btn ${canBook ? 'is-book' : ''} ${hasActiveSelectionCard ? 'is-select-active' : ''}`}
            onClick={handleFooterActionClick}
          >
            {footerButtonLabel}
          </button>
        </div>
      </footer>

      {isScheduleOpen ? (
        <div className="expert-details-page__schedule-overlay" role="dialog" aria-modal="true" aria-label="Schedule appointment" onClick={closeScheduleOverlay}>
          <button
            type="button"
            className="expert-details-page__schedule-close"
            aria-label="Close schedule appointment"
            onClick={closeScheduleOverlay}
          >
            <OverlayCloseIcon />
          </button>

          <div className={`expert-details-page__schedule-sheet${scheduleStep === 'review' ? ' is-review' : ''}${scheduleStep === 'confirmed' ? ' is-confirmed' : ''}`} onClick={(event) => event.stopPropagation()}>
            {scheduleStep === 'schedule' ? (
              <>
                <h3 className="expert-details-page__schedule-title">Schedule Appointment</h3>

                <div className="expert-details-page__choose-box">
                  <div className="expert-details-page__choose-icon-wrap" aria-hidden="true">
                    <AppointmentInfoIcon />
                  </div>

                  <div className="expert-details-page__choose-copy">
                    <p className="expert-details-page__choose-title">Choose a 2-hour window.</p>
                    <p className="expert-details-page__choose-text">
                      Your doctor and nutritionist will connect in this period. Please keep your phone available.
                    </p>
                  </div>
                </div>

                <div className="expert-details-page__schedule-head-row">
                  <PreferredDateIcon />
                  <span>Preferred Date</span>
                </div>

                <div className="expert-details-page__schedule-dates">
                  {APPOINTMENT_DATES.map((item) => {
                    const isSelected = item.id === selectedDateId;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`expert-details-page__schedule-date-card${isSelected ? ' is-selected' : ''}`}
                        onClick={() => setSelectedDateId(item.id)}
                      >
                        <span className="expert-details-page__schedule-date-day">{item.day}</span>
                        <span className="expert-details-page__schedule-date-number">{item.date}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="expert-details-page__schedule-time-head">
                  <div className="expert-details-page__schedule-head-row">
                    <PreferredTimeIcon />
                    <span>Preferred Time Slot</span>
                  </div>
                  <p className="expert-details-page__schedule-time-subtitle">Choose a consultation time window</p>
                </div>

                <div className="expert-details-page__schedule-slots-wrap">
                  {APPOINTMENT_SLOT_ROWS.map((row, rowIndex) => (
                    <div key={`row-${rowIndex}`} className="expert-details-page__schedule-slot-row">
                      {row.map((slot) => {
                        const isSelected = slot === selectedTimeSlot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            className={`expert-details-page__schedule-slot-pill${isSelected ? ' is-selected' : ''}`}
                            onClick={() => setSelectedTimeSlot(slot)}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>

                <div className="expert-details-page__schedule-footer">
                  <div className="expert-details-page__schedule-footer-left">
                    <span className="expert-details-page__schedule-slot-label">Slot selected</span>
                    <p className="expert-details-page__schedule-slot-value">{selectedAppointmentText}</p>
                  </div>

                  <button type="button" className="expert-details-page__schedule-continue" onClick={() => setScheduleStep('review')}>Continue</button>
                </div>
              </>
            ) : scheduleStep === 'review' ? (
              <div className="expert-details-page__review-flow">
                <h3 className="expert-details-page__schedule-title">Review Appointment</h3>

                <section className="expert-details-page__review-doctor-card" aria-label="Care team summary">
                  <div className="ihp-booking-team-row">
                    <img src={selectedDoctor?.image || doctorAvatar} alt={selectedDoctor?.name || 'Doctor'} className="ihp-booking-team-photo" />
                    <div className="ihp-booking-team-copy">
                      <h4 className="ihp-booking-team-name">{selectedDoctor?.name || 'Doctor'}</h4>
                      <p className="ihp-booking-team-role">{selectedDoctor?.role || 'General Physician'}</p>
                    </div>
                  </div>

                  <div className="ihp-booking-team-row">
                    <img src={selectedNutritionist?.image || nutritionistAvatar} alt={selectedNutritionist?.name || 'Nutritionist'} className="ihp-booking-team-photo" />
                    <div className="ihp-booking-team-copy">
                      <h4 className="ihp-booking-team-name">{selectedNutritionist?.name || 'Nutritionist'}</h4>
                      <p className="ihp-booking-team-role">{selectedNutritionist?.role || 'Nutritionist'}</p>
                    </div>
                  </div>

                  <div className="expert-details-page__review-info-card">
                    <div className="expert-details-page__review-info-icon"><ReviewDateIcon /></div>
                    <div>
                      <p className="expert-details-page__review-info-label">Selected Date</p>
                      <p className="expert-details-page__review-info-value">{reviewDateText}</p>
                    </div>
                  </div>

                  <div className="expert-details-page__review-info-card">
                    <div className="expert-details-page__review-info-icon"><ReviewTimeIcon /></div>
                    <div>
                      <p className="expert-details-page__review-info-label">Time Window</p>
                      <p className="expert-details-page__review-info-value">{selectedTimeSlot}</p>
                    </div>
                  </div>
                </section>

                <div className="expert-details-page__review-payment-head">
                  <ReviewPaymentIcon />
                  <span>Payment Summary</span>
                </div>

                <section className="expert-details-page__review-payment-card" aria-label="Payment summary card">
                  <div className="expert-details-page__review-payment-row">
                    <span className="expert-details-page__review-payment-label">Consultation Fee (Both Experts)</span>
                    <span className="expert-details-page__review-payment-value">Rs. {formatAmount(consultationFee)}/-</span>
                  </div>
                  <div className="expert-details-page__review-payment-row">
                    <span className="expert-details-page__review-payment-label">Service Tax ({formatAmount(taxRate * 100)}%)</span>
                    <span className="expert-details-page__review-payment-value">Rs. {formatAmount(serviceTax)}/-</span>
                  </div>

                  <div className="expert-details-page__review-payment-divider" />

                  <div className="expert-details-page__review-payment-total">
                    <span className="expert-details-page__review-payment-total-label">Total Amount</span>
                    <div className="expert-details-page__review-payment-total-right">
                      <span className="expert-details-page__review-payment-total-value">Rs. {formatAmount(totalAmount)}/-</span>
                      <span className="expert-details-page__review-payment-tax">All taxes included</span>
                    </div>
                  </div>
                </section>

                <section className="expert-details-page__review-refund-card" aria-label="Refund policy">
                  <ReviewRefundIcon />
                  <p className="expert-details-page__review-refund-text">
                    <strong>Full refund</strong> if either expert is unavailable during your selected window.
                  </p>
                </section>

                <div className="expert-details-page__review-fixed-cta">
                  <button type="button" className="expert-details-page__review-continue" onClick={() => setScheduleStep('confirmed')}>Continue</button>
                </div>
              </div>
            ) : (
              <div className="expert-details-page__confirmed-flow">
                <div className="expert-details-page__confirmed-status-icon">
                  <ConfirmTickIcon />
                </div>

                <p className="expert-details-page__confirmed-title">Booking Confirmed</p>
                <p className="expert-details-page__confirmed-text">Your integrated care team consultation is confirmed.</p>

                <section className="ihp-confirmed-team" aria-label="Selected care team">
                  <div className="ihp-confirmed-team-row">
                    <img src={selectedDoctor?.image || doctorAvatar} alt={selectedDoctor?.name || 'Doctor'} className="ihp-confirmed-team-photo" />
                    <div>
                      <h4 className="ihp-confirmed-team-name">{selectedDoctor?.name || 'Doctor'}</h4>
                      <p className="ihp-confirmed-team-role">{selectedDoctor?.role || 'General Physician'}</p>
                    </div>
                  </div>

                  <div className="ihp-confirmed-team-row">
                    <img src={selectedNutritionist?.image || nutritionistAvatar} alt={selectedNutritionist?.name || 'Nutritionist'} className="ihp-confirmed-team-photo" />
                    <div>
                      <h4 className="ihp-confirmed-team-name">{selectedNutritionist?.name || 'Nutritionist'}</h4>
                      <p className="ihp-confirmed-team-role">{selectedNutritionist?.role || 'Nutritionist'}</p>
                    </div>
                  </div>
                </section>

                <p className="expert-details-page__confirmed-subtitle">Appointment Details</p>

                <div className="expert-details-page__confirmed-datetime-row">
                  <div className="expert-details-page__confirmed-datetime-card">
                    <ReviewDateIcon />
                    <p className="expert-details-page__confirmed-datetime-label">Date</p>
                    <p className="expert-details-page__confirmed-datetime-value">{confirmedDateText}</p>
                  </div>

                  <div className="expert-details-page__confirmed-datetime-card">
                    <ReviewTimeIcon />
                    <p className="expert-details-page__confirmed-datetime-label">Time Window</p>
                    <p className="expert-details-page__confirmed-datetime-value">{selectedTimeSlot}</p>
                  </div>
                </div>

                <div className="expert-details-page__confirmed-fixed-cta">
                  <button type="button" className="expert-details-page__review-continue" onClick={closeScheduleOverlay}>Add to Calendar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default IntegratedHealthProgramPage;
