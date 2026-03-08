import React, { useState } from 'react';
import Input from '../../components/Input';
import editProfileAvatar from '../../images/Icon-AddAcc.png';
import './EditProfilePage.css';

const genderOptions = ['Male', 'Female'];

const EditProfilePage = ({ onBack }) => {
  const [formData, setFormData] = useState({
    firstName: 'Aisha',
    lastName: 'Sharma',
    email: 'aisha.sharma@example.com',
    phone: '1234567890',
    city: 'Marol',
    age: '23',
    organization: 'Organization Name',
    gender: 'Female',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
          <img src={editProfileAvatar} alt="Profile avatar" className="edit-profile-page__avatar" />
        </div>

        <div className="edit-profile-page__form">
          <div className="edit-profile-page__name-row">
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
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />

          <Input
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
          />

          <Input
            placeholder="City"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
          />

          <Input
            type="number"
            placeholder="Age"
            value={formData.age}
            onChange={(e) => handleChange('age', e.target.value)}
          />

          <Input
            placeholder="Organization Name"
            value={formData.organization}
            onChange={(e) => handleChange('organization', e.target.value)}
          />

          <div className="edit-profile-page__section">
            <p className="edit-profile-page__section-label">Gender</p>
            <div className="edit-profile-page__gender-grid">
              {genderOptions.map((option) => {
                const isSelected = formData.gender === option;
                return (
                  <button
                    key={option}
                    type="button"
                    className={`edit-profile-page__choice ${isSelected ? 'edit-profile-page__choice--selected' : ''}`}
                    onClick={() => handleChange('gender', option)}
                  >
                    <span className="edit-profile-page__gender-icon" aria-hidden="true">
                      {option === 'Male' ? '♂' : '♀'}
                    </span>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button type="button" className="edit-profile-page__submit">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
