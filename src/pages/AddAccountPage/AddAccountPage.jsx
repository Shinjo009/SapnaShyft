import React, { useEffect, useState } from 'react';
import Input from '../../components/Input';
import Typography from '../../components/Typography';
import maleAvatar from '../../images/male-avatar.png';
import femaleAvatar from '../../images/female-avatar.png';
import './AddAccountPage.css';
import { createMySubProfile } from '../../services/usersService';
import { getMyProfile } from '../../services/profileService';

const genderOptions = ['Male', 'Female'];
const relationOptions = ['Parent', 'Sibling', 'Spouse', 'Child', 'Grandparent', 'Other'];

const REQUIRED_FIELD = 'Required Field';
const INVALID_FORMAT = 'Invalid Format';
const FIELD_REQUIRED = 'Field Required';

const RE_NAME = /^(?=.*[a-zA-Z])[a-zA-Z\s'-]{1,60}$/;
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RE_PHONE = /^\d{10}$/;
const RE_CITY = /^(?=.*[a-zA-Z])[a-zA-Z\s,.'-]{1,100}$/;
const RE_PINCODE = /^\d{6}$/;
/** Integers 1–99 only */
const RE_AGE = /^([1-9]|[1-8][0-9]|9[0-9])$/;

const requiredOrInvalidFormat = (value, pattern) => {
  const t = String(value).trim();
  if (!t) return REQUIRED_FIELD;
  if (!pattern.test(t)) return INVALID_FORMAT;
  return null;
};

const optionalOrInvalidFormat = (value, pattern) => {
  const t = String(value).trim();
  if (!t) return null;
  if (!pattern.test(t)) return INVALID_FORMAT;
  return null;
};

const validateAddAccountForm = (data) => {
  const errors = {};
  const set = (key, msg) => {
    if (msg) errors[key] = msg;
  };
  set('firstName', requiredOrInvalidFormat(data.firstName, RE_NAME));
  set('lastName', requiredOrInvalidFormat(data.lastName, RE_NAME));
  set('city', requiredOrInvalidFormat(data.city, RE_CITY));
  set('pincode', requiredOrInvalidFormat(data.pincode, RE_PINCODE));
  set('email', optionalOrInvalidFormat(data.email, RE_EMAIL));
  set('phone', optionalOrInvalidFormat(data.phone, RE_PHONE));
  set('age', optionalOrInvalidFormat(data.age, RE_AGE));
  if (!data.gender) {
    errors.gender = FIELD_REQUIRED;
  }
  if (!data.relation) {
    errors.relation = FIELD_REQUIRED;
  }
  return errors;
};

const clearFieldError = (setFieldErrors, field) => {
  setFieldErrors((prev) => {
    if (!prev[field]) return prev;
    const next = { ...prev };
    delete next[field];
    return next;
  });
};

const SelectGenderHeadingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M7.99994 4.37965C8.65566 4.90563 9.129 5.62483 9.35276 6.43512C9.57652 7.2454 9.53931 8.10558 9.24643 8.89352C8.95355 9.68146 8.41987 10.3571 7.72119 10.8245C7.0225 11.2919 6.19432 11.5273 5.35424 11.4973C4.51417 11.4673 3.7049 11.1734 3.04135 10.6573C2.37781 10.1412 1.89371 9.42922 1.65781 8.62239C1.42191 7.81555 1.44619 6.95491 1.7272 6.16266C2.00822 5.37041 2.53168 4.68683 3.22327 4.20898M5.49994 11.5003V15.5003" stroke="#999999" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.42267 9.216C5.82278 8.71035 5.38484 8.03944 5.16336 7.28678C4.94187 6.53412 4.94662 5.73294 5.17702 4.98296C5.40741 4.23298 5.85327 3.56731 6.45911 3.0688C7.06495 2.5703 7.80402 2.26096 8.58433 2.1793C9.36464 2.09764 10.1517 2.24726 10.8477 2.60954C11.5436 2.97181 12.1176 3.53075 12.4983 4.21678C12.8789 4.90281 13.0495 5.68565 12.9886 6.46786C12.9278 7.25006 12.6382 7.9971 12.156 8.616M11.8287 3.328L14.5 0.5M14.5 3V0.5H12M3.5 13.5H7.5" stroke="#999999" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const RelationHeadingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <g clipPath="url(#addAccountRelationClip)">
      <path d="M2.81866 16.1615V12.1996C2.81866 11.8762 2.69022 11.5662 2.46161 11.3376C2.23299 11.1089 1.92292 10.9805 1.59961 10.9805V6.10432C1.59961 6.10432 2.5139 5.49479 4.0377 5.49479C4.50057 5.49478 4.96158 5.55336 5.40974 5.66911M7.08593 16.1615V12.8091H4.95199V12.6567L4.99588 12.5653C5.97028 10.5188 6.47586 8.28072 6.4758 6.01411V5.81357C7.06151 5.59938 7.68074 5.49143 8.30437 5.49479C9.08944 5.49479 9.71298 5.65692 10.1329 5.81357V6.01411C10.1329 6.5038 10.1565 6.9932 10.2036 7.48062M13.3329 16.1615V14.0732C13.3329 13.3747 13.8108 12.8091 14.3996 12.8091V8.86972C14.3996 8.86972 13.5999 8.23765 12.2663 8.23765C10.9326 8.23765 10.1329 8.86972 10.1329 8.86972V12.8091C10.7224 12.8091 11.1996 13.3753 11.1996 14.0732V16.1615M3.94628 4.27574C3.94628 4.27574 2.97104 3.66622 2.97104 2.90431C2.97104 2.7644 2.9986 2.62585 3.05214 2.49659C3.10568 2.36732 3.18416 2.24987 3.2831 2.15093C3.38204 2.05199 3.49949 1.97351 3.62876 1.91997C3.75802 1.86643 3.89657 1.83887 4.03649 1.83887C4.1764 1.83887 4.31495 1.86643 4.44421 1.91997C4.57348 1.97351 4.69093 2.05199 4.78987 2.15093C4.88881 2.24987 4.96729 2.36732 5.02083 2.49659C5.07437 2.62585 5.10193 2.7644 5.10193 2.90431C5.10193 3.66622 4.12913 4.27574 4.12913 4.27574H3.94628ZM8.21294 4.27574C8.21294 4.27574 7.2377 3.66622 7.2377 2.90431C7.2377 2.62174 7.34996 2.35074 7.54977 2.15093C7.74958 1.95112 8.02058 1.83887 8.30315 1.83887C8.58573 1.83887 8.85673 1.95112 9.05654 2.15093C9.25635 2.35074 9.3686 2.62174 9.3686 2.90431C9.3686 3.66622 8.3958 4.27574 8.3958 4.27574H8.21294ZM12.1889 7.0186C12.1889 7.0186 11.352 6.48527 11.352 5.81845C11.352 5.3034 11.7616 4.88527 12.2675 4.88527C12.7734 4.88527 13.1806 5.3034 13.1806 5.81845C13.1806 6.48527 12.3455 7.0186 12.3455 7.0186H12.1889Z" stroke="#9A9A9A" />
    </g>
    <defs>
      <clipPath id="addAccountRelationClip">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const HouseNoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M10 14V8.66667C10 8.48986 9.92976 8.32029 9.80474 8.19526C9.67971 8.07024 9.51014 8 9.33333 8H6.66667C6.48986 8 6.32029 8.07024 6.19526 8.19526C6.07024 8.32029 6 8.48986 6 8.66667V14" stroke="#9A9A9A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 6.66666C1.99995 6.47271 2.04222 6.28108 2.12386 6.10514C2.20549 5.9292 2.32453 5.77319 2.47267 5.64799L7.13933 1.64799C7.37999 1.4446 7.6849 1.33301 8 1.33301C8.3151 1.33301 8.62001 1.4446 8.86067 1.64799L13.5273 5.64799C13.6755 5.77319 13.7945 5.9292 13.8761 6.10514C13.9578 6.28108 14 6.47271 14 6.66666V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V6.66666Z" stroke="#9A9A9A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AreaStreetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <g clipPath="url(#addAccountAreaClip)">
      <path d="M7.99967 0.666992V2.00033M7.99967 12.0003V15.3337M7.99967 6.00033V8.00033M3.99967 6.00033L1.33301 4.00033L3.99967 2.00033H11.9997V6.00033H3.99967ZM11.9997 12.0003L14.6663 10.0003L11.9997 8.00033H3.99967V12.0003H11.9997Z" stroke="#9A9A9A" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs>
      <clipPath id="addAccountAreaClip">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const LandmarkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M15.3337 3.33333V12.6667C15.3337 13.0333 15.2032 13.3473 14.9423 13.6087C14.6814 13.87 14.3674 14.0004 14.0003 14H12.0003C11.8114 14 11.6532 13.936 11.5257 13.808C11.3981 13.68 11.3341 13.5218 11.3337 13.3333C11.3332 13.1449 11.3972 12.9867 11.5257 12.8587C11.6541 12.7307 11.8123 12.6667 12.0003 12.6667H14.0003V3.33333H8.00033V3.66667C8.00033 3.85556 7.93633 4.014 7.80833 4.142C7.68033 4.27 7.5221 4.33378 7.33366 4.33333C7.14521 4.33289 6.98699 4.26889 6.85899 4.14133C6.73099 4.01378 6.66699 3.85556 6.66699 3.66667V3.3C6.66699 2.94444 6.79477 2.63889 7.05033 2.38333C7.30588 2.12778 7.61144 2 7.96699 2H14.0003C14.367 2 14.681 2.13067 14.9423 2.392C15.2037 2.65333 15.3341 2.96711 15.3337 3.33333ZM0.666992 8.01667C0.666992 7.79444 0.716992 7.58889 0.816992 7.4C0.916992 7.21111 1.05588 7.05556 1.23366 6.93333L4.56699 4.55C4.68921 4.46111 4.81433 4.39711 4.94233 4.358C5.07033 4.31889 5.20077 4.29956 5.33366 4.3C5.46655 4.30044 5.59721 4.32 5.72566 4.35867C5.8541 4.39733 5.97899 4.46111 6.10033 4.55L9.43366 6.93333C9.61144 7.05556 9.75033 7.21111 9.85033 7.4C9.95033 7.58889 10.0003 7.79444 10.0003 8.01667V12.6667C10.0003 13.0333 9.86988 13.3473 9.60899 13.6087C9.3481 13.87 9.0341 14.0004 8.66699 14H7.33366C6.96699 14 6.65321 13.8696 6.39233 13.6087C6.13144 13.3478 6.00077 13.0338 6.00033 12.6667V10.6667H4.66699V12.6667C4.66699 13.0333 4.53655 13.3473 4.27566 13.6087C4.01477 13.87 3.70077 14.0004 3.33366 14H2.00033C1.63366 14 1.31988 13.8696 1.05899 13.6087C0.798103 13.3478 0.667437 13.0338 0.666992 12.6667V8.01667ZM2.00033 8V12.6667H3.33366V10.6667C3.33366 10.3 3.46433 9.98622 3.72566 9.72533C3.98699 9.46444 4.30077 9.33378 4.66699 9.33333H6.00033C6.36699 9.33333 6.68099 9.464 6.94233 9.72533C7.20366 9.98667 7.3341 10.3004 7.33366 10.6667V12.6667H8.66699V8L5.33366 5.63333L2.00033 8ZM11.667 6H12.3337C12.4225 6 12.5003 5.96667 12.567 5.9C12.6337 5.83333 12.667 5.75556 12.667 5.66667V5C12.667 4.91111 12.6337 4.83333 12.567 4.76667C12.5003 4.7 12.4225 4.66667 12.3337 4.66667H11.667C11.5781 4.66667 11.5003 4.7 11.4337 4.76667C11.367 4.83333 11.3337 4.91111 11.3337 5V5.66667C11.3337 5.75556 11.367 5.83333 11.4337 5.9C11.5003 5.96667 11.5781 6 11.667 6ZM11.667 8.66667H12.3337C12.4225 8.66667 12.5003 8.63333 12.567 8.56667C12.6337 8.5 12.667 8.42222 12.667 8.33333V7.66667C12.667 7.57778 12.6337 7.5 12.567 7.43333C12.5003 7.36667 12.4225 7.33333 12.3337 7.33333H11.667C11.5781 7.33333 11.5003 7.36667 11.4337 7.43333C11.367 7.5 11.3337 7.57778 11.3337 7.66667V8.33333C11.3337 8.42222 11.367 8.5 11.4337 8.56667C11.5003 8.63333 11.5781 8.66667 11.667 8.66667ZM11.667 11.3333H12.3337C12.4225 11.3333 12.5003 11.3 12.567 11.2333C12.6337 11.1667 12.667 11.0889 12.667 11V10.3333C12.667 10.2444 12.6337 10.1667 12.567 10.1C12.5003 10.0333 12.4225 10 12.3337 10H11.667C11.5781 10 11.5003 10.0333 11.4337 10.1C11.367 10.1667 11.3337 10.2444 11.3337 10.3333V11C11.3337 11.0889 11.367 11.1667 11.4337 11.2333C11.5003 11.3 11.5781 11.3333 11.667 11.3333Z" fill="#9A9A9A" />
  </svg>
);

const PincodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="5" stroke="#9A9A9A" strokeWidth="1.5" />
    <circle cx="8" cy="8" r="1.25" fill="#9A9A9A" />
    <path d="M8 2.5V4.5M8 11.5V13.5M2.5 8H4.5M11.5 8H13.5" stroke="#9A9A9A" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ProfilePlaceholderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <path d="M24 24C27.3137 24 30 21.3137 30 18C30 14.6863 27.3137 12 24 12C20.6863 12 18 14.6863 18 18C18 21.3137 20.6863 24 24 24Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 38C12 32.4772 17.3726 28 24 28C30.6274 28 36 32.4772 36 38" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AvatarEditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5Z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UseSameCheckboxIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M3.33333 2C2.97971 2 2.64057 2.14048 2.39052 2.39052C2.14048 2.64057 2 2.97971 2 3.33333V12.6667C2 13.0203 2.14048 13.3594 2.39052 13.6095C2.64057 13.8595 2.97971 14 3.33333 14H12.6667C13.0203 14 13.3594 13.8595 13.6095 13.6095C13.8595 13.3594 14 13.0203 14 12.6667V3.33333C14 2.97971 13.8595 2.64057 13.6095 2.39052C13.3594 2.14048 13.0203 2 12.6667 2H3.33333ZM3.33333 3.33333H12.6667V12.6667H3.33333V3.33333ZM11.3 6.53C11.3637 6.4685 11.4145 6.39494 11.4494 6.3136C11.4843 6.23227 11.5027 6.14479 11.5035 6.05627C11.5043 5.96775 11.4874 5.87996 11.4539 5.79803C11.4204 5.7161 11.3709 5.64166 11.3083 5.57907C11.2457 5.51647 11.1712 5.46697 11.0893 5.43345C11.0074 5.39993 10.9196 5.38306 10.8311 5.38383C10.7425 5.3846 10.6551 5.40299 10.5737 5.43793C10.4924 5.47287 10.4188 5.52366 10.3573 5.58733L7.05733 8.88733L5.64333 7.47333C5.58144 7.41139 5.50795 7.36225 5.42706 7.32871C5.34617 7.29517 5.25947 7.2779 5.1719 7.27787C4.99506 7.2778 4.82543 7.34799 4.70033 7.473C4.57524 7.59801 4.50493 7.76758 4.50487 7.94443C4.5048 8.12128 4.57499 8.29091 4.7 8.416L6.53867 10.2547C6.60677 10.3228 6.68763 10.3768 6.77662 10.4137C6.86561 10.4506 6.961 10.4696 7.05733 10.4696C7.15367 10.4696 7.24905 10.4506 7.33805 10.4137C7.42704 10.3768 7.5079 10.3228 7.576 10.2547L11.3 6.53Z" fill="#41AB99" />
  </svg>
);

const MaleIcon = ({ active }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
    <path d="M12.0006 0H9.00064C8.86803 0 8.74085 0.0526785 8.64708 0.146447C8.55332 0.240215 8.50064 0.367392 8.50064 0.5C8.50064 0.632608 8.55332 0.759785 8.64708 0.853553C8.74085 0.947321 8.86803 1 9.00064 1H10.7938L8.16439 3.62937C7.17121 2.81754 5.904 2.41848 4.62485 2.51473C3.3457 2.61098 2.15248 3.19517 1.29196 4.14647C0.431439 5.09778 -0.0305406 6.34343 0.00156826 7.62579C0.0336771 8.90815 0.557418 10.1291 1.46447 11.0362C2.37152 11.9432 3.59249 12.467 4.87485 12.4991C6.15721 12.5312 7.40286 12.0692 8.35417 11.2087C9.30547 10.3482 9.88966 9.15493 9.98591 7.87579C10.0822 6.59664 9.68309 5.32943 8.87126 4.33625L11.5006 1.7075V3.5C11.5006 3.63261 11.5533 3.75979 11.6471 3.85355C11.7409 3.94732 11.868 4 12.0006 4C12.1332 4 12.2604 3.94732 12.3542 3.85355C12.448 3.75979 12.5006 3.63261 12.5006 3.5V0.5C12.5006 0.367392 12.448 0.240215 12.3542 0.146447C12.2604 0.0526785 12.1332 0 12.0006 0ZM7.82814 10.3306C7.26866 10.8899 6.55592 11.2706 5.78005 11.4248C5.00417 11.579 4.2 11.4997 3.4692 11.1969C2.7384 10.8941 2.11379 10.3814 1.67434 9.72366C1.2349 9.0659 1.00035 8.29261 1.00035 7.50156C1.00035 6.71051 1.2349 5.93723 1.67434 5.27947C2.11379 4.62171 2.7384 4.10902 3.4692 3.80622C4.2 3.50341 5.00417 3.42409 5.78005 3.57829C6.55592 3.73249 7.26866 4.11327 7.82814 4.6725C8.57714 5.42351 8.99776 6.44089 8.99776 7.50156C8.99776 8.56223 8.57714 9.57962 7.82814 10.3306Z" fill={active ? '#FFFFFF' : '#9A9A9A'} />
  </svg>
);

const FemaleIcon = ({ active }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M5 0.99994C3.93913 0.99994 2.92172 1.42137 2.17157 2.17151C1.42143 2.92166 1 3.93907 1 4.99994C1 6.06081 1.42143 7.07822 2.17157 7.82837C2.92172 8.57851 3.93913 8.99994 5 8.99994C6.06087 8.99994 7.07828 8.57851 7.82843 7.82837C8.57857 7.07822 9 6.06081 9 4.99994C9 3.93907 8.57857 2.92166 7.82843 2.17151C7.07828 1.42137 6.06087 0.99994 5 0.99994ZM3.95006e-10 4.99994C1.21561e-05 4.03235 0.280771 3.08556 0.808227 2.27438C1.33568 1.4632 2.08717 0.822483 2.97156 0.429945C3.85594 0.0374067 4.83523 -0.0900927 5.79064 0.0629099C6.74605 0.215912 7.63655 0.642844 8.35413 1.29192C9.0717 1.94101 9.58553 2.78435 9.8333 3.71968C10.0811 4.655 10.0521 5.64213 9.74997 6.56133C9.44783 7.48053 8.88547 8.29232 8.13109 8.89824C7.37672 9.50416 6.46274 9.87818 5.5 9.97494V11.9999H7.5C7.63261 11.9999 7.75979 12.0526 7.85355 12.1464C7.94732 12.2402 8 12.3673 8 12.4999C8 12.6325 7.94732 12.7597 7.85355 12.8535C7.75979 12.9473 7.63261 12.9999 7.5 12.9999H5.5V15.4999C5.5 15.6325 5.44732 15.7597 5.35355 15.8535C5.25979 15.9473 5.13261 15.9999 5 15.9999C4.86739 15.9999 4.74021 15.9473 4.64645 15.8535C4.55268 15.7597 4.5 15.6325 4.5 15.4999V12.9999H2.5C2.36739 12.9999 2.24021 12.9473 2.14645 12.8535C2.05268 12.7597 2 12.6325 2 12.4999C2 12.3673 2.05268 12.2402 2.14645 12.1464C2.24021 12.0526 2.36739 11.9999 2.5 11.9999H4.5V9.97494C3.26668 9.85099 2.12337 9.27335 1.29188 8.35408C0.460384 7.43482 -1.55717e-05 6.23947 3.95006e-10 4.99994Z" fill={active ? '#FFFFFF' : '#9A9A9A'} />
  </svg>
);

const parseAddressFromProfile = (profile) => {
  const addressText = String(profile?.address || '').trim();
  const addressParts = addressText ? addressText.split(',').map((part) => part.trim()) : [];

  return {
    house: addressParts[0] || '',
    area: addressParts[1] || '',
    landmark: addressParts[2] || '',
    city: String(profile?.city || addressParts[3] || '').trim(),
    pincode: String(profile?.pin_code || profile?.pincode || profile?.postal_code || '').trim(),
  };
};

const UseSameRow = ({ checked, onToggle }) => (
  <div className="add-account-page__same-row">
    <span>Use same</span>
    <button type="button" className="add-account-page__same-checkbox" onClick={onToggle} aria-pressed={checked}>
      {checked ? <UseSameCheckboxIcon /> : <span className="add-account-page__same-checkbox-empty" />}
    </button>
  </div>
);

const SectionLabel = ({ icon: Icon, children }) => (
  <div className="add-account-page__section-label">
    <Icon />
    <span>{children}</span>
  </div>
);

const AddAccountPage = ({ onBack }) => {
  const inputTextClass = '!text-[13px] !leading-[13px] placeholder:!text-[13px] placeholder:!leading-[13px]';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    phone: '',
    email: '',
    house: '',
    area: '',
    landmark: '',
    city: '',
    pincode: '',
    gender: '',
    relation: '',
  });
  const [primaryProfile, setPrimaryProfile] = useState(null);
  const [phoneSame, setPhoneSame] = useState(false);
  const [emailSame, setEmailSame] = useState(false);
  const [addressSame, setAddressSame] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let mounted = true;

    const loadPrimaryProfile = async () => {
      try {
        const response = await getMyProfile();
        const profile = response?.data && typeof response.data === 'object'
          ? response.data
          : response;

        if (mounted) {
          setPrimaryProfile(profile);
        }
      } catch {
        // Profile prefill is optional; form remains editable without it.
      }
    };

    loadPrimaryProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (field, value) => {
    let nextValue = value;

    if (field === 'age') {
      nextValue = String(value || '').replace(/\D/g, '').slice(0, 2);
    } else if (field === 'phone') {
      nextValue = String(value || '').replace(/[^0-9]/g, '').slice(0, 10);
    } else if (field === 'pincode') {
      nextValue = String(value || '').replace(/\D/g, '').slice(0, 6);
    }

    setFormData((prev) => ({
      ...prev,
      [field]: nextValue,
    }));
    clearFieldError(setFieldErrors, field);
  };

  const applyPrimaryPhone = () => {
    const phone = String(primaryProfile?.phone || '').replace(/\D/g, '').slice(0, 10);
    setFormData((prev) => ({ ...prev, phone }));
  };

  const applyPrimaryEmail = () => {
    const email = String(primaryProfile?.email || '').trim();
    setFormData((prev) => ({ ...prev, email }));
  };

  const applyPrimaryAddress = () => {
    const address = parseAddressFromProfile(primaryProfile);
    setFormData((prev) => ({
      ...prev,
      house: address.house,
      area: address.area,
      landmark: address.landmark,
      city: address.city,
      pincode: address.pincode,
    }));
  };

  const handleTogglePhoneSame = () => {
    setPhoneSame((prev) => {
      const next = !prev;
      if (next) {
        applyPrimaryPhone();
        clearFieldError(setFieldErrors, 'phone');
      } else {
        setFormData((current) => ({ ...current, phone: '' }));
      }
      return next;
    });
  };

  const handleToggleEmailSame = () => {
    setEmailSame((prev) => {
      const next = !prev;
      if (next) {
        applyPrimaryEmail();
        clearFieldError(setFieldErrors, 'email');
      } else {
        setFormData((current) => ({ ...current, email: '' }));
      }
      return next;
    });
  };

  const handleToggleAddressSame = () => {
    setAddressSame((prev) => {
      const next = !prev;
      if (next) {
        applyPrimaryAddress();
        clearFieldError(setFieldErrors, 'city');
        clearFieldError(setFieldErrors, 'pincode');
      } else {
        setFormData((current) => ({
          ...current,
          house: '',
          area: '',
          landmark: '',
          city: '',
          pincode: '',
        }));
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    const validation = validateAddAccountForm(formData);
    setFieldErrors(validation);
    if (Object.keys(validation).length > 0) {
      return;
    }

    try {
      setSaving(true);
      await createMySubProfile(formData);
      onBack();
    } catch (error) {
      window.alert(error?.message || 'Failed to add account. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const topAvatar = formData.gender === 'Female' ? femaleAvatar : maleAvatar;
  const showGenderAvatar = Boolean(formData.gender);

  return (
    <div className="add-account-page">
      <div className="add-account-page__header">
        <button
          className="add-account-page__back-btn"
          onClick={onBack}
          aria-label="Go back"
          type="button"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <h1 className="add-account-page__title">Add Account</h1>
      </div>

      <div className="add-account-page__content">
        <div className="add-account-page__avatar-wrap">
          <div className="add-account-page__avatar-ring">
            {showGenderAvatar ? (
              <img src={topAvatar} alt="Account avatar" className="add-account-page__avatar" />
            ) : (
              <div className="add-account-page__avatar-placeholder">
                <ProfilePlaceholderIcon />
              </div>
            )}
          </div>
          <button type="button" className="add-account-page__avatar-edit" aria-label="Edit profile photo">
            <AvatarEditIcon />
          </button>
        </div>

        <div className="add-account-page__form">
          <div className="add-account-page__name-row">
            <Input
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              error={fieldErrors.firstName}
              className={inputTextClass}
            />
            <Input
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              error={fieldErrors.lastName}
              className={inputTextClass}
            />
          </div>

          <Input
            type="text"
            inputMode="numeric"
            maxLength={2}
            placeholder="Age"
            value={formData.age}
            onChange={(e) => handleChange('age', e.target.value)}
            error={fieldErrors.age}
            className={inputTextClass}
          />

          <div className="add-account-page__section">
            <SectionLabel icon={SelectGenderHeadingIcon}>Select Gender</SectionLabel>
            <div className="add-account-page__gender-grid">
              {genderOptions.map((option) => {
                const isSelected = formData.gender === option;
                return (
                  <button
                    key={option}
                    type="button"
                    className={`add-account-page__choice ${isSelected ? 'add-account-page__choice--selected' : ''}`}
                    onClick={() => handleChange('gender', option)}
                  >
                    <span className="add-account-page__gender-icon" aria-hidden="true">
                      {option === 'Male' ? <MaleIcon active={isSelected} /> : <FemaleIcon active={isSelected} />}
                    </span>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>
            {fieldErrors.gender ? (
              <Typography variant="label" className="!text-[10px] !leading-[14px] text-red-500">
                {fieldErrors.gender}
              </Typography>
            ) : null}
          </div>

          <div className="add-account-page__section">
            <SectionLabel icon={RelationHeadingIcon}>Relation</SectionLabel>
            <div className="add-account-page__relation-grid">
              {relationOptions.map((option) => {
                const isSelected = formData.relation === option;
                return (
                  <button
                    key={option}
                    type="button"
                    className={`add-account-page__choice add-account-page__choice--relation ${isSelected ? 'add-account-page__choice--selected' : ''}`}
                    onClick={() => handleChange('relation', option)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {fieldErrors.relation ? (
              <Typography variant="label" className="!text-[10px] !leading-[14px] text-red-500">
                {fieldErrors.relation}
              </Typography>
            ) : null}
          </div>

          <UseSameRow checked={phoneSame} onToggle={handleTogglePhoneSame} />
          <Input
            type="tel"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={fieldErrors.phone}
            className={inputTextClass}
            disabled={phoneSame}
          />

          <UseSameRow checked={emailSame} onToggle={handleToggleEmailSame} />
          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={fieldErrors.email}
            className={inputTextClass}
            disabled={emailSame}
          />

          <hr className="add-account-page__divider" />

          <div className="add-account-page__address-header">
            <h2 className="add-account-page__address-title">Address</h2>
            <UseSameRow checked={addressSame} onToggle={handleToggleAddressSame} />
          </div>

          <Input
            placeholder="House No./ Building"
            value={formData.house}
            onChange={(e) => handleChange('house', e.target.value)}
            leadingIcon={HouseNoIcon}
            className={inputTextClass}
            disabled={addressSame}
          />

          <Input
            placeholder="Area/ Street"
            value={formData.area}
            onChange={(e) => handleChange('area', e.target.value)}
            leadingIcon={AreaStreetIcon}
            className={inputTextClass}
            disabled={addressSame}
          />

          <Input
            placeholder="Landmark"
            value={formData.landmark}
            onChange={(e) => handleChange('landmark', e.target.value)}
            leadingIcon={LandmarkIcon}
            className={inputTextClass}
            disabled={addressSame}
          />

          <Input
            placeholder="City"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            error={fieldErrors.city}
            className={inputTextClass}
            disabled={addressSame}
          />

          <Input
            placeholder="Pincode"
            value={formData.pincode}
            onChange={(e) => handleChange('pincode', e.target.value)}
            error={fieldErrors.pincode}
            leadingIcon={PincodeIcon}
            inputMode="numeric"
            maxLength={6}
            className={inputTextClass}
            disabled={addressSame}
          />

          <button type="button" className="add-account-page__submit" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAccountPage;
