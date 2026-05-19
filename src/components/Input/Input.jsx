import React from 'react';
import PropTypes from 'prop-types';
import Typography from '../Typography';

const NameFieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M12.5709 14.8574V12.9526C12.5709 10.8486 11.2551 9.14307 9.6321 9.14307H5.22393C3.60089 9.14307 2.28516 10.8486 2.28516 12.9526V14.8574" stroke="#9A9A9A" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.57227 5.14279C4.57227 6.71969 5.85251 7.99993 7.42941 7.99993C9.00631 7.99993 10.2866 6.71969 10.2866 5.14279C10.2866 3.56589 9.00631 2.28564 7.42941 2.28564C5.85251 2.28564 4.57227 3.56589 4.57227 5.14279Z" stroke="#9A9A9A" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EmailFieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M14.6654 4.66699L8.67136 8.48499C8.25731 8.72549 7.74609 8.72549 7.33203 8.48499L1.33203 4.66699" stroke="#9A9A9A" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.66536 2.66699H13.332C14.0684 2.66699 14.6654 3.26395 14.6654 4.00033V12.0003C14.6654 12.7367 14.0684 13.3337 13.332 13.3337H2.66536C1.92898 13.3337 1.33203 12.7367 1.33203 12.0003V4.00033C1.33203 3.26395 1.92898 2.66699 2.66536 2.66699V2.66699" stroke="#9A9A9A" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PhoneFieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M9.6908 11.4692C9.96732 11.5962 10.2949 11.5144 10.4793 11.2723L10.71 10.97C10.9555 10.6427 11.3408 10.45 11.75 10.45H13.7C14.418 10.45 15 11.032 15 11.75V13.7C15 14.418 14.418 15 13.7 15C7.23827 15 2 9.76173 2 3.3C2 2.58203 2.58203 2 3.3 2H5.25C5.96797 2 6.55 2.58203 6.55 3.3V5.25C6.55 5.65918 6.35735 6.04449 6.03 6.29L5.7258 6.51815C5.47976 6.70602 5.40035 7.04134 5.536 7.3196C6.42434 9.12391 7.88538 10.5831 9.6908 11.4692" stroke="#9A9A9A" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CityFieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M7.99935 1.3335C5.06602 1.3335 2.66602 3.7335 2.66602 6.66683C2.66602 10.2668 7.33268 14.3335 7.53268 14.5335C7.66602 14.6002 7.86601 14.6668 7.99935 14.6668C8.13268 14.6668 8.33268 14.6002 8.46601 14.5335C8.66601 14.3335 13.3327 10.2668 13.3327 6.66683C13.3327 3.7335 10.9327 1.3335 7.99935 1.3335ZM7.99935 13.1335C6.59935 11.8002 3.99935 8.9335 3.99935 6.66683C3.99935 4.46683 5.79935 2.66683 7.99935 2.66683C10.1993 2.66683 11.9993 4.46683 11.9993 6.66683C11.9993 8.86683 9.39935 11.8002 7.99935 13.1335ZM7.99935 4.00016C6.53268 4.00016 5.33268 5.20016 5.33268 6.66683C5.33268 8.1335 6.53268 9.3335 7.99935 9.3335C9.46602 9.3335 10.666 8.1335 10.666 6.66683C10.666 5.20016 9.46602 4.00016 7.99935 4.00016ZM7.99935 8.00016C7.26602 8.00016 6.66602 7.40016 6.66602 6.66683C6.66602 5.9335 7.26602 5.3335 7.99935 5.3335C8.73268 5.3335 9.33268 5.9335 9.33268 6.66683C9.33268 7.40016 8.73268 8.00016 7.99935 8.00016Z" fill="#999999"/>
  </svg>
);

const OrganizationFieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M15.3327 3.33333V12.6667C15.3327 13.0333 15.2022 13.3473 14.9413 13.6087C14.6805 13.87 14.3665 14.0004 13.9994 14H11.9993C11.8105 14 11.6522 13.936 11.5247 13.808C11.3971 13.68 11.3331 13.5218 11.3327 13.3333C11.3322 13.1449 11.3962 12.9867 11.5247 12.8587C11.6531 12.7307 11.8113 12.6667 11.9993 12.6667H13.9994V3.33333H7.99935V3.66667C7.99935 3.85556 7.93535 4.014 7.80735 4.142C7.67935 4.27 7.52113 4.33378 7.33268 4.33333C7.14424 4.33289 6.98602 4.26889 6.85802 4.14133C6.73002 4.01378 6.66602 3.85556 6.66602 3.66667V3.3C6.66602 2.94444 6.79379 2.63889 7.04935 2.38333C7.3049 2.12778 7.61046 2 7.96602 2H13.9994C14.366 2 14.68 2.13067 14.9413 2.392C15.2027 2.65333 15.3331 2.96711 15.3327 3.33333ZM0.666016 8.01667C0.666016 7.79444 0.716016 7.58889 0.816016 7.4C0.916016 7.21111 1.0549 7.05556 1.23268 6.93333L4.56602 4.55C4.68824 4.46111 4.81335 4.39711 4.94135 4.358C5.06935 4.31889 5.19979 4.29956 5.33268 4.3C5.46557 4.30044 5.59624 4.32 5.72468 4.35867C5.85313 4.39733 5.97802 4.46111 6.09935 4.55L9.43268 6.93333C9.61046 7.05556 9.74935 7.21111 9.84935 7.4C9.94935 7.58889 9.99935 7.79444 9.99935 8.01667V12.6667C9.99935 13.0333 9.86891 13.3473 9.60802 13.6087C9.34713 13.87 9.03313 14.0004 8.66602 14H7.33268C6.96602 14 6.65224 13.8696 6.39135 13.6087C6.13046 13.3478 5.99979 13.0338 5.99935 12.6667V10.6667H4.66602V12.6667C4.66602 13.0333 4.53557 13.3473 4.27468 13.6087C4.01379 13.87 3.69979 14.0004 3.33268 14H1.99935C1.63268 14 1.3189 13.8696 1.05802 13.6087C0.797127 13.3478 0.66646 13.0338 0.666016 12.6667V8.01667ZM1.99935 8V12.6667H3.33268V10.6667C3.33268 10.3 3.46335 9.98622 3.72468 9.72533C3.98602 9.46445 4.29979 9.33378 4.66602 9.33333H5.99935C6.36602 9.33333 6.68002 9.464 6.94135 9.72533C7.20268 9.98667 7.33313 10.3004 7.33268 10.6667V12.6667H8.66602V8L5.33268 5.63333L1.99935 8ZM11.666 6H12.3327C12.4216 6 12.4993 5.96667 12.566 5.9C12.6327 5.83333 12.666 5.75556 12.666 5.66667V5C12.666 4.91111 12.6327 4.83333 12.566 4.76667C12.4993 4.7 12.4216 4.66667 12.3327 4.66667H11.666C11.5771 4.66667 11.4993 4.7 11.4327 4.76667C11.366 4.83333 11.3327 4.91111 11.3327 5V5.66667C11.3327 5.75556 11.366 5.83333 11.4327 5.9C11.4993 5.96667 11.5771 6 11.666 6ZM11.666 8.66667H12.3327C12.4216 8.66667 12.4993 8.63333 12.566 8.56667C12.6327 8.5 12.666 8.42222 12.666 8.33333V7.66667C12.666 7.57778 12.6327 7.5 12.566 7.43333C12.4993 7.36667 12.4216 7.33333 12.3327 7.33333H11.666C11.5771 7.33333 11.4993 7.36667 11.4327 7.43333C11.366 7.5 11.3327 7.57778 11.3327 7.66667V8.33333C11.3327 8.42222 11.366 8.5 11.4327 8.56667C11.4993 8.63333 11.5771 8.66667 11.666 8.66667ZM11.666 11.3333H12.3327C12.4216 11.3333 12.4993 11.3 12.566 11.2333C12.6327 11.1667 12.666 11.0889 12.666 11V10.3333C12.666 10.2444 12.6327 10.1667 12.566 10.1C12.4993 10.0333 12.4216 10 12.3327 10H11.666C11.5771 10 11.4993 10.0333 11.4327 10.1C11.366 10.1667 11.3327 10.2444 11.3327 10.3333V11C11.3327 11.0889 11.366 11.1667 11.4327 11.2333C11.4993 11.3 11.5771 11.3333 11.666 11.3333Z" fill="#999999"/>
  </svg>
);

const AgeFieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M5.33398 1.33301V3.99967M10.6673 1.33301V3.99967" stroke="#9A9A9A" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.33333 2.6665H12.6667C13.403 2.6665 14 3.26346 14 3.99984V13.3332C14 14.0695 13.403 14.6665 12.6667 14.6665H3.33333C2.59695 14.6665 2 14.0695 2 13.3332V3.99984C2 3.26346 2.59695 2.6665 3.33333 2.6665V2.6665" stroke="#9A9A9A" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 6.6665H14" stroke="#9A9A9A" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const getAutoIconFromPlaceholder = (placeholder = '') => {
  const normalized = String(placeholder).toLowerCase();

  if (normalized.includes('first name') || normalized.includes('last name')) return NameFieldIcon;
  if (normalized.includes('email')) return EmailFieldIcon;
  if (normalized.includes('phone')) return PhoneFieldIcon;
  if (normalized.includes('organization')) return OrganizationFieldIcon;
  if (normalized.includes('address') || normalized.includes('country')) return CityFieldIcon;
  if (normalized.includes('city')) return CityFieldIcon;
  if (normalized.includes('age')) return AgeFieldIcon;

  return null;
};

/**
 * Input Component - Styled input field based on Figma specs
 * 
 * Specs:
 * - Height: 40px
 * - Padding: 0 16px
 * - Border radius: 8px
 * - Background: rgba(255, 255, 255, 0.05)
 */
const Input = ({ 
  label,
  type = 'text',
  placeholder,
  leadingIcon,
  value,
  onChange,
  error,
  className = '',
  ...props 
}) => {
  const isPhoneInput = type === 'tel';
  const AutoIcon = getAutoIconFromPlaceholder(placeholder);
  const IconComponent = leadingIcon || AutoIcon;
  const hasLeadingIcon = Boolean(IconComponent);
  
  const baseClasses = `
    flex
    flex-col
    justify-center
    items-start
    self-stretch
    w-full
    h-10
    box-border
    px-[15px]
    py-[10px]
    rounded-lg
    border
    bg-input-bg
    font-lato
    text-white
    text-label
    placeholder:text-label-gray
    transition-all
  `.trim().replace(/\s+/g, ' ');

  const stateClasses = error
    ? 'border border-red-500 shadow-[0_0_10px_0_rgba(255,0,0,0.30)] focus:outline-none focus:border-red-500 focus:shadow-[0_0_10px_0_rgba(255,0,0,0.30)]'
    : 'border border-transparent focus:outline-none focus:border-white/20 focus:shadow-[0_0_10px_0_rgba(144,223,158,0.30)]';

  const typeClasses = isPhoneInput ? 'text-[13px] placeholder:text-[13px] placeholder:leading-4' : '';
  
  const paddingClasses = hasLeadingIcon ? 'pr-[15px] pl-[37px]' : 'px-[15px]';

  return (
    <div className="w-full space-y-1">
      {label && (
        <Typography variant="label" as="label">
          {label}
        </Typography>
      )}
      <div className="relative w-full">
        {hasLeadingIcon ? (
          <span className="pointer-events-none absolute left-[15px] top-1/2 -translate-y-1/2 inline-flex items-center justify-center">
            <IconComponent />
          </span>
        ) : null}
        <input
          type={type}
          inputMode={props.inputMode || (isPhoneInput ? 'numeric' : undefined)}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`${baseClasses} ${stateClasses} ${paddingClasses} ${typeClasses} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <Typography variant="label" className="!text-[10px] !leading-[14px] text-red-500">
          {error}
        </Typography>
      )}
    </div>
  );
};

Input.propTypes = {
  /** Label text above input */
  label: PropTypes.string,
  /** Input type (text, email, tel, password, etc.) */
  type: PropTypes.string,
  /** Placeholder text */
  placeholder: PropTypes.string,
  /** Optional leading icon component */
  leadingIcon: PropTypes.elementType,
  /** Input value */
  value: PropTypes.string,
  /** Change handler */
  onChange: PropTypes.func,
  /** Error message to display */
  error: PropTypes.string,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default Input;