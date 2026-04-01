import React, { useState } from 'react';
import Input from '../../components/Input';
import maleAvatar from '../../images/male-avatar.png';
import femaleAvatar from '../../images/female-avatar.png';
import './AddAccountPage.css';
import { createMySubProfile } from '../../services/usersService';

const genderOptions = ['Male', 'Female'];
const relationOptions = ['Parent', 'Sibling', 'Spouse', 'Child', 'Grandparent', 'Other'];

const SelectGenderHeadingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8.00091 4.37916C8.65663 4.90515 9.12998 5.62434 9.35374 6.43463C9.57749 7.24491 9.54029 8.10509 9.24741 8.89303C8.95452 9.68097 8.42085 10.3566 7.72216 10.824C7.02348 11.2914 6.1953 11.5268 5.35522 11.4968C4.51515 11.4668 3.70588 11.1729 3.04233 10.6568C2.37879 10.1407 1.89469 9.42873 1.65879 8.6219C1.42288 7.81507 1.44716 6.95442 1.72818 6.16217C2.00919 5.36992 2.53266 4.68634 3.22425 4.2085M5.50091 11.4998V15.4998" stroke="#999999" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.42267 9.216C5.82278 8.71035 5.38484 8.03944 5.16336 7.28678C4.94187 6.53412 4.94662 5.73294 5.17702 4.98296C5.40741 4.23298 5.85327 3.56731 6.45911 3.0688C7.06495 2.5703 7.80402 2.26096 8.58433 2.1793C9.36464 2.09764 10.1517 2.24726 10.8477 2.60954C11.5436 2.97181 12.1176 3.53075 12.4983 4.21678C12.8789 4.90281 13.0495 5.68565 12.9886 6.46786C12.9278 7.25006 12.6382 7.9971 12.156 8.616M11.8287 3.328L14.5 0.5M14.5 0.5H12M14.5 0.5V3M3.5 13.5H7.5" stroke="#999999" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const OrganizationFieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M15.3327 3.33333V12.6667C15.3327 13.0333 15.2022 13.3473 14.9413 13.6087C14.6805 13.87 14.3665 14.0004 13.9994 14H11.9993C11.8105 14 11.6522 13.936 11.5247 13.808C11.3971 13.68 11.3331 13.5218 11.3327 13.3333C11.3322 13.1449 11.3962 12.9867 11.5247 12.8587C11.6531 12.7307 11.8113 12.6667 11.9993 12.6667H13.9994V3.33333H7.99935V3.66667C7.99935 3.85556 7.93535 4.014 7.80735 4.142C7.67935 4.27 7.52113 4.33378 7.33268 4.33333C7.14424 4.33289 6.98602 4.26889 6.85802 4.14133C6.73002 4.01378 6.66602 3.85556 6.66602 3.66667V3.3C6.66602 2.94444 6.79379 2.63889 7.04935 2.38333C7.3049 2.12778 7.61046 2 7.96602 2H13.9994C14.366 2 14.68 2.13067 14.9413 2.392C15.2027 2.65333 15.3331 2.96711 15.3327 3.33333ZM0.666016 8.01667C0.666016 7.79444 0.716016 7.58889 0.816016 7.4C0.916016 7.21111 1.0549 7.05556 1.23268 6.93333L4.56602 4.55C4.68824 4.46111 4.81335 4.39711 4.94135 4.358C5.06935 4.31889 5.19979 4.29956 5.33268 4.3C5.46557 4.30044 5.59624 4.32 5.72468 4.35867C5.85313 4.39733 5.97802 4.46111 6.09935 4.55L9.43268 6.93333C9.61046 7.05556 9.74935 7.21111 9.84935 7.4C9.94935 7.58889 9.99935 7.79444 9.99935 8.01667V12.6667C9.99935 13.0333 9.86891 13.3473 9.60802 13.6087C9.34713 13.87 9.03313 14.0004 8.66602 14H7.33268C6.96602 14 6.65224 13.8696 6.39135 13.6087C6.13046 13.3478 5.99979 13.0338 5.99935 12.6667V10.6667H4.66602V12.6667C4.66602 13.0333 4.53557 13.3473 4.27468 13.6087C4.01379 13.87 3.69979 14.0004 3.33268 14H1.99935C1.63268 14 1.3189 13.8696 1.05802 13.6087C0.797127 13.3478 0.66646 13.0338 0.666016 12.6667V8.01667ZM1.99935 8V12.6667H3.33268V10.6667C3.33268 10.3 3.46335 9.98622 3.72468 9.72533C3.98602 9.46445 4.29979 9.33378 4.66602 9.33333H5.99935C6.36602 9.33333 6.68002 9.464 6.94135 9.72533C7.20268 9.98667 7.33313 10.3004 7.33268 10.6667V12.6667H8.66602V8L5.33268 5.63333L1.99935 8ZM11.666 6H12.3327C12.4216 6 12.4993 5.96667 12.566 5.9C12.6327 5.83333 12.666 5.75556 12.666 5.66667V5C12.666 4.91111 12.6327 4.83333 12.566 4.76667C12.4993 4.7 12.4216 4.66667 12.3327 4.66667H11.666C11.5771 4.66667 11.4993 4.7 11.4327 4.76667C11.366 4.83333 11.3327 4.91111 11.3327 5V5.66667C11.3327 5.75556 11.366 5.83333 11.4327 5.9C11.4993 5.96667 11.5771 6 11.666 6ZM11.666 8.66667H12.3327C12.4216 8.66667 12.4993 8.63333 12.566 8.56667C12.6327 8.5 12.666 8.42222 12.666 8.33333V7.66667C12.666 7.57778 12.6327 7.5 12.566 7.43333C12.4993 7.36667 12.4216 7.33333 12.3327 7.33333H11.666C11.5771 7.33333 11.4993 7.36667 11.4327 7.43333C11.366 7.5 11.3327 7.57778 11.3327 7.66667V8.33333C11.3327 8.42222 11.366 8.5 11.4327 8.56667C11.4993 8.63333 11.5771 8.66667 11.666 8.66667ZM11.666 11.3333H12.3327C12.4216 11.3333 12.4993 11.3 12.566 11.2333C12.6327 11.1667 12.666 11.0889 12.666 11V10.3333C12.666 10.2444 12.6327 10.1667 12.566 10.1C12.4993 10.0333 12.4216 10 12.3327 10H11.666C11.5771 10 11.4993 10.0333 11.4327 10.1C11.366 10.1667 11.3327 10.2444 11.3327 10.3333V11C11.3327 11.0889 11.366 11.1667 11.4327 11.2333C11.4993 11.3 11.5771 11.3333 11.666 11.3333Z" fill="#999999"/>
  </svg>
);

const AddAccountPage = ({ onBack }) => {
  const inputTextClass = '!text-[13px] !leading-[13px] placeholder:!text-[13px] placeholder:!leading-[13px]';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    phone: '',
    email: '',
    city: '',
    organization: '',
    gender: '',
    relation: '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.firstName.trim()) {
        throw new Error('First name is required.');
      }

      if (!formData.lastName.trim()) {
        throw new Error('Last name is required.');
      }

      const age = Number.parseInt(formData.age, 10);
      if (Number.isNaN(age) || age < 1 || age > 120) {
        throw new Error('Age must be between 1 and 120.');
      }

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
          <img src={topAvatar} alt="Account avatar" className="add-account-page__avatar" />
        </div>

        <div className="add-account-page__form">
          <div className="add-account-page__name-row">
            <Input
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className={inputTextClass}
            />
            <Input
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className={inputTextClass}
            />
          </div>

          <Input
            type="number"
            placeholder="Age"
            value={formData.age}
            onChange={(e) => handleChange('age', e.target.value)}
            className={inputTextClass}
          />

          <div className="add-account-page__section">
            <div className="add-account-page__section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <SelectGenderHeadingIcon />
              <span>Select Gender</span>
            </div>
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
                      {option === 'Male' ? '♂' : '♀'}
                    </span>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="add-account-page__section">
            <p className="add-account-page__section-label">Relation</p>
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
          </div>

          <Input
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
            className={inputTextClass}
          />

          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={inputTextClass}
          />

          <Input
            placeholder="City"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className={inputTextClass}
          />

          <Input
            placeholder="Organization Name"
            value={formData.organization}
            onChange={(e) => handleChange('organization', e.target.value)}
            leadingIcon={OrganizationFieldIcon}
            className={inputTextClass}
          />

          <button type="button" className="add-account-page__submit" onClick={handleSubmit} disabled={saving}>
            {saving ? 'ADDING...' : 'ADD'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAccountPage;
