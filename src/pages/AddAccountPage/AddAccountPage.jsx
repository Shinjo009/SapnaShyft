import React, { useState } from 'react';
import Input from '../../components/Input';
import addAccountAvatar from '../../images/Icon-AddAcc.png';
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
    gender: 'Female',
    relation: 'Sibling',
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
          <img src={addAccountAvatar} alt="Account avatar" className="add-account-page__avatar" />
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
