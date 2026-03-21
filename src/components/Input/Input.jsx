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
    border-transparent
    bg-input-bg
    font-lato
    text-white
    text-label
    placeholder:text-label-gray
    focus:outline-none
    focus:border-white/20
    focus:shadow-[0_0_10px_0_rgba(144,223,158,0.30)]
    transition-all
  `.trim().replace(/\s+/g, ' ');

  const typeClasses = isPhoneInput ? 'text-[13px] placeholder:text-[13px] placeholder:leading-4' : '';
  
  const errorClasses = error ? 'border border-red-500' : '';
  
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
          className={`${baseClasses} ${paddingClasses} ${typeClasses} ${errorClasses} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <Typography variant="label" className="text-red-500">
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