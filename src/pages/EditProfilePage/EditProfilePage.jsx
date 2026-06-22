import React, { useEffect, useState } from 'react';
import Input from '../../components/Input';
import Typography from '../../components/Typography';
import maleAvatar from '../../images/male-avatar.png';
import femaleAvatar from '../../images/female-avatar.png';
import './EditProfilePage.css';
import { getMyProfile, invalidateMyProfileCache, updateMyProfile } from '../../services/profileService';
import { getMyProfiles, invalidateMyProfilesCache, updateMySubProfile } from '../../services/usersService';

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const REQUIRED_FIELD = 'Required Field';
const INVALID_FORMAT = 'Invalid Format';
const FIELD_REQUIRED = 'Field Required';

const RE_NAME = /^(?=.*[a-zA-Z])[a-zA-Z\s'-]{1,60}$/;
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RE_PHONE = /^\d{10}$/;
const RE_CITY = /^(?=.*[a-zA-Z])[a-zA-Z\s,.'-]{1,100}$/;
const RE_PINCODE = /^\d{6}$/;
const RE_ADDRESS_LINE = /^(?=.*[a-zA-Z0-9])[a-zA-Z0-9\s,.'#/()-]{1,200}$/;
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

const validateEditProfileForm = (data) => {
  const errors = {};
  const set = (key, msg) => {
    if (msg) errors[key] = msg;
  };

  set('first_name', requiredOrInvalidFormat(data.first_name, RE_NAME));
  set('last_name', requiredOrInvalidFormat(data.last_name, RE_NAME));
  set('age', requiredOrInvalidFormat(data.age, RE_AGE));
  set('city', requiredOrInvalidFormat(data.city, RE_CITY));
  set('state', optionalOrInvalidFormat(data.state, RE_CITY));
  set('pincode', requiredOrInvalidFormat(data.pincode, RE_PINCODE));
  set('email', optionalOrInvalidFormat(data.email, RE_EMAIL));
  set('phone', optionalOrInvalidFormat(data.phone, RE_PHONE));
  set('house', optionalOrInvalidFormat(data.house, RE_ADDRESS_LINE));
  set('area', optionalOrInvalidFormat(data.area, RE_ADDRESS_LINE));
  set('landmark', optionalOrInvalidFormat(data.landmark, RE_ADDRESS_LINE));
  set('organization_name', optionalOrInvalidFormat(data.organization_name, RE_ADDRESS_LINE));

  if (!data.gender) {
    errors.gender = FIELD_REQUIRED;
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

const HouseNoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M10 14V8.66667C10 8.48986 9.92976 8.32029 9.80474 8.19526C9.67971 8.07024 9.51014 8 9.33333 8H6.66667C6.48986 8 6.32029 8.07024 6.19526 8.19526C6.07024 8.32029 6 8.48986 6 8.66667V14" stroke="#9A9A9A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 6.66666C1.99995 6.47271 2.04222 6.28108 2.12386 6.10514C2.20549 5.9292 2.32453 5.77319 2.47267 5.64799L7.13933 1.64799C7.37999 1.4446 7.6849 1.33301 8 1.33301C8.3151 1.33301 8.62001 1.4446 8.86067 1.64799L13.5273 5.64799C13.6755 5.77319 13.7945 5.9292 13.8761 6.10514C13.9578 6.28108 14 6.47271 14 6.66666V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V6.66666Z" stroke="#9A9A9A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AreaStreetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <g clipPath="url(#editProfileAreaClip)">
      <path d="M7.99967 0.666992V2.00033M7.99967 12.0003V15.3337M7.99967 6.00033V8.00033M3.99967 6.00033L1.33301 4.00033L3.99967 2.00033H11.9997V6.00033H3.99967ZM11.9997 12.0003L14.6663 10.0003L11.9997 8.00033H3.99967V12.0003H11.9997Z" stroke="#9A9A9A" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs>
      <clipPath id="editProfileAreaClip">
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

const SectionLabel = ({ icon: Icon, children }) => (
  <div className="edit-profile-page__section-label">
    <Icon />
    <span>{children}</span>
  </div>
);

const getAgeValue = (profile) => {
  if (typeof profile?.age === 'number' && profile.age > 0) {
    return String(profile.age);
  }

  if (!profile?.date_of_birth) {
    return '';
  }

  const dob = new Date(profile.date_of_birth);
  if (Number.isNaN(dob.getTime())) {
    return '';
  }

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }

  return age > 0 ? String(age) : '';
};

const getDateOfBirthFromAge = (ageValue) => {
  const age = Number.parseInt(ageValue, 10);

  if (Number.isNaN(age) || age <= 0) {
    return null;
  }

  const today = new Date();
  const dateOfBirth = new Date(today.getFullYear() - age, today.getMonth(), today.getDate());
  return dateOfBirth.toISOString().split('T')[0];
};

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

const buildAddressString = ({ house, area, landmark }) => {
  const parts = [house, area, landmark].map((part) => String(part || '').trim()).filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
};

const isSelfRelationship = (relationshipValue) => {
  const normalized = String(relationshipValue || '').trim().toLowerCase();

  if (!normalized) {
    return false;
  }

  return normalized === 'self' || normalized === 'primary' || normalized === 'primary account';
};

const EditProfilePage = ({ onBack, currentUserId = null, linkedAccounts = [] }) => {
  const inputTextClass = '!text-[13px] !leading-[13px] placeholder:!text-[13px] placeholder:!leading-[13px]';

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    age: '',
    gender: '',
    house: '',
    area: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    organization_name: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubProfileEdit, setIsSubProfileEdit] = useState(false);
  const [activeProfileUserId, setActiveProfileUserId] = useState(null);
  const [activeRelationship, setActiveRelationship] = useState('');
  const [lockedProfileFields, setLockedProfileFields] = useState({
    email: '',
    gender: '',
    phone: '',
  });

  const isPhoneEditable = isSubProfileEdit;
  const isEmailEditable = false;
  const isGenderEditable = false;

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const [profileResponse, linkedProfilesResponse] = await Promise.all([
          getMyProfile(),
          getMyProfiles(),
        ]);
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

        const activeUserId = Number(currentUserId || profile?.user_id || profile?.id || 0);
        const matchedLinkedProfile = linkedProfiles.find(
          (item) => Number(item?.user_id || item?.id || 0) === activeUserId
        );
        const activeLinkedAccountFromApp = Array.isArray(linkedAccounts)
          ? linkedAccounts.find((account) => Number(account?.id || 0) === activeUserId)
          : null;
        const appRelationshipLabel = String(activeLinkedAccountFromApp?.relationshipLabel || '').trim();
        const relationshipForPermission = profile?.relationship || matchedLinkedProfile?.relationship || '';
        const relationshipToEvaluate = appRelationshipLabel || relationshipForPermission;
        const profileToEdit = matchedLinkedProfile || profile;
        const address = parseAddressFromProfile(profileToEdit);

        setFormData({
          first_name: profileToEdit?.first_name || '',
          last_name: profileToEdit?.last_name || '',
          email: profileToEdit?.email || '',
          age: getAgeValue(profileToEdit),
          gender: (profileToEdit?.gender || '').toLowerCase(),
          house: address.house,
          area: address.area,
          landmark: address.landmark,
          city: address.city,
          state: profileToEdit?.state || '',
          pincode: address.pincode,
          organization_name: profileToEdit?.referred_by || '',
          phone: profileToEdit?.phone || '',
        });
        setLockedProfileFields({
          email: profileToEdit?.email || '',
          gender: (profileToEdit?.gender || '').toLowerCase(),
          phone: profileToEdit?.phone || '',
        });
        const primaryUserId = Number(profile?.user_id || profile?.id || 0);
        const isEditingOwnProfile = activeUserId > 0 && primaryUserId > 0 && activeUserId === primaryUserId;
        const shouldEditAsSubProfile = !isEditingOwnProfile
          && !isSelfRelationship(relationshipToEvaluate)
          && Boolean(matchedLinkedProfile);

        setActiveProfileUserId(activeUserId > 0 ? activeUserId : null);
        setActiveRelationship(relationshipToEvaluate);
        setIsSubProfileEdit(shouldEditAsSubProfile);
      } catch (loadError) {
        if (mounted) {
          setError(loadError?.message || 'Failed to load profile. Please try again.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [currentUserId, linkedAccounts]);

  const handleChange = (field, value) => {
    setSuccess('');

    let nextValue = value;

    if (field === 'phone') {
      nextValue = String(value || '').replace(/\D/g, '').slice(0, 10);
    } else if (field === 'age') {
      nextValue = String(value || '').replace(/\D/g, '').slice(0, 2);
    } else if (field === 'pincode') {
      nextValue = String(value || '').replace(/\D/g, '').slice(0, 6);
    }

    setFormData((prev) => ({
      ...prev,
      [field]: nextValue,
    }));
    clearFieldError(setFieldErrors, field);
  };

  const handleSave = async () => {
    const validation = validateEditProfileForm(formData);
    setFieldErrors(validation);
    if (Object.keys(validation).length > 0) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const age = Number.parseInt(formData.age, 10);
      const address = buildAddressString(formData);
      const email = lockedProfileFields.email.trim() || null;
      const gender = lockedProfileFields.gender.trim() || null;
      const phoneSource = isPhoneEditable ? formData.phone : lockedProfileFields.phone;
      const phone = String(phoneSource || '').trim() || null;

      const dateOfBirth = getDateOfBirthFromAge(formData.age);
      const profilePayload = {
        age,
        first_name: formData.first_name.trim() || null,
        last_name: formData.last_name.trim() || null,
        email,
        gender,
        address,
        city: formData.city.trim() || null,
        state: formData.state.trim() || null,
        pin_code: formData.pincode.trim() || null,
        phone,
        date_of_birth: dateOfBirth,
      };

      if (isSubProfileEdit) {
        const subProfilePayload = {
          age,
          first_name: formData.first_name.trim() || null,
          last_name: formData.last_name.trim() || null,
          date_of_birth: dateOfBirth,
          gender,
          relationship: String(activeRelationship || '').trim().toLowerCase() || null,
          phone,
          email,
          city: formData.city.trim() || null,
          address,
        };

        await updateMySubProfile(activeProfileUserId, subProfilePayload);
      } else {
        await updateMyProfile(profilePayload);
      }

      invalidateMyProfileCache();
      invalidateMyProfilesCache();

      setSuccess('Profile updated successfully.');
      onBack();
    } catch (saveError) {
      setError(saveError?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const showGenderAvatar = Boolean(formData.gender);
  const topAvatar = formData.gender === 'female' ? femaleAvatar : maleAvatar;

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-page__header">
        <button
          className="edit-profile-page__back-btn"
          onClick={onBack}
          aria-label="Go back"
          type="button"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <h1 className="edit-profile-page__title">Edit Profile</h1>
      </div>

      <div className="edit-profile-page__content">
        <div className="edit-profile-page__avatar-wrap">
          <div className="edit-profile-page__avatar-ring">
            {showGenderAvatar ? (
              <img src={topAvatar} alt="Profile avatar" className="edit-profile-page__avatar" />
            ) : (
              <div className="edit-profile-page__avatar-placeholder">
                <ProfilePlaceholderIcon />
              </div>
            )}
          </div>
        </div>

        <div className="edit-profile-page__form">
          <div className="edit-profile-page__name-row">
            <Input
              placeholder="First Name"
              value={formData.first_name}
              onChange={(e) => handleChange('first_name', e.target.value)}
              error={fieldErrors.first_name}
              className={inputTextClass}
              disabled={loading}
            />
            <Input
              placeholder="Last Name"
              value={formData.last_name}
              onChange={(e) => handleChange('last_name', e.target.value)}
              error={fieldErrors.last_name}
              className={inputTextClass}
              disabled={loading}
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
            disabled={loading}
          />

          <div className="edit-profile-page__section">
            <SectionLabel icon={SelectGenderHeadingIcon}>Select Gender</SectionLabel>
            <div className="edit-profile-page__gender-grid">
              {genderOptions.map((option) => {
                const isSelected = formData.gender === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`edit-profile-page__choice ${isSelected ? 'edit-profile-page__choice--selected' : ''}`}
                    onClick={() => handleChange('gender', option.value)}
                    disabled={loading || !isGenderEditable}
                  >
                    <span className="edit-profile-page__gender-icon" aria-hidden="true">
                      {option.value === 'male' ? <MaleIcon active={isSelected} /> : <FemaleIcon active={isSelected} />}
                    </span>
                    <span>{option.label}</span>
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

          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={fieldErrors.email}
            className={inputTextClass}
            disabled={loading || !isEmailEditable}
            readOnly={!isEmailEditable}
          />

          <Input
            type="tel"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={fieldErrors.phone}
            maxLength={10}
            className={inputTextClass}
            disabled={loading || !isPhoneEditable}
            readOnly={!isPhoneEditable}
          />

          <Input
            placeholder="Organization Name"
            value={formData.organization_name}
            onChange={(e) => handleChange('organization_name', e.target.value)}
            error={fieldErrors.organization_name}
            className={inputTextClass}
            disabled={loading}
          />

          <hr className="edit-profile-page__divider" />

          <h2 className="edit-profile-page__address-title">Address</h2>

          <Input
            placeholder="House No./ Building"
            value={formData.house}
            onChange={(e) => handleChange('house', e.target.value)}
            error={fieldErrors.house}
            leadingIcon={HouseNoIcon}
            className={inputTextClass}
            disabled={loading}
          />

          <Input
            placeholder="Area/ Street"
            value={formData.area}
            onChange={(e) => handleChange('area', e.target.value)}
            error={fieldErrors.area}
            leadingIcon={AreaStreetIcon}
            className={inputTextClass}
            disabled={loading}
          />

          <Input
            placeholder="Landmark"
            value={formData.landmark}
            onChange={(e) => handleChange('landmark', e.target.value)}
            error={fieldErrors.landmark}
            leadingIcon={LandmarkIcon}
            className={inputTextClass}
            disabled={loading}
          />

          <Input
            placeholder="City"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            error={fieldErrors.city}
            className={inputTextClass}
            disabled={loading}
          />

          <Input
            placeholder="State"
            value={formData.state}
            onChange={(e) => handleChange('state', e.target.value)}
            error={fieldErrors.state}
            className={inputTextClass}
            disabled={loading}
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
            disabled={loading}
          />

          <button type="button" className="edit-profile-page__submit" onClick={handleSave} disabled={loading || saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>

          {error ? <p className="edit-profile-page__status edit-profile-page__status--error">{error}</p> : null}
          {success ? <p className="edit-profile-page__status edit-profile-page__status--success">{success}</p> : null}
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
