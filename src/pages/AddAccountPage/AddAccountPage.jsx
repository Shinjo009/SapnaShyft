import React, { useState } from 'react';
import Input from '../../components/Input';
import addAccountAvatar from '../../images/Icon-AddAcc.png';
import './AddAccountPage.css';

const genderOptions = ['Male', 'Female'];
const relationOptions = ['Parent', 'Sibling', 'Spouse', 'Child', 'Grandparent', 'Other'];

const AddAccountPage = ({ onBack }) => {
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

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
            />
            <Input
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
            />
          </div>

          <Input
            type="number"
            placeholder="Age"
            value={formData.age}
            onChange={(e) => handleChange('age', e.target.value)}
          />

          <div className="add-account-page__section">
            <p className="add-account-page__section-label">Select Gender</p>
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
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
          />

          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />

          <Input
            placeholder="City"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
          />

          <Input
            placeholder="Organization Name"
            value={formData.organization}
            onChange={(e) => handleChange('organization', e.target.value)}
          />

          <button type="button" className="add-account-page__submit">
            ADD
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAccountPage;
