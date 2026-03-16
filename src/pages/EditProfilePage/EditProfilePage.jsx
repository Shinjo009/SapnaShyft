import React, { useEffect, useState } from 'react';
import Input from '../../components/Input';
import editProfileAvatar from '../../images/Icon-AddAcc.png';
import './EditProfilePage.css';
import { getMyProfile, updateMyProfile } from '../../services/profileService';

const genderOptions = ['male', 'female'];

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

const EditProfilePage = ({ onBack }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    age: '',
    gender: '',
    address: '',
    country: '',
    organization_name: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getMyProfile();
        const profile = response?.data && typeof response.data === 'object' ? response.data : response;

        if (!mounted) {
          return;
        }

        setFormData({
          first_name: profile?.first_name || '',
          last_name: profile?.last_name || '',
          email: profile?.email || '',
          age: getAgeValue(profile),
          gender: (profile?.gender || '').toLowerCase(),
          address: profile?.address || '',
          country: profile?.country || '',
          organization_name: profile?.referred_by || '',
          phone: profile?.phone || '',
        });
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
  }, []);

  const handleChange = (field, value) => {
    setSuccess('');
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const age = Number.parseInt(formData.age, 10);

      if (Number.isNaN(age) || age < 1 || age > 120) {
        throw new Error('Age must be between 1 and 120.');
      }

      const payload = {
        age,
        first_name: formData.first_name.trim() || null,
        last_name: formData.last_name.trim() || null,
        email: formData.email.trim() || null,
        gender: formData.gender.trim() || null,
        address: formData.address.trim() || null,
        country: formData.country.trim() || null,
        referred_by: formData.organization_name.trim() || null,
      };

      await updateMyProfile(payload);
      setSuccess('Profile updated successfully.');
      onBack();
    } catch (saveError) {
      setError(saveError?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
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
              value={formData.first_name}
              onChange={(e) => handleChange('first_name', e.target.value)}
              disabled={loading}
            />
            <Input
              placeholder="Last Name"
              value={formData.last_name}
              onChange={(e) => handleChange('last_name', e.target.value)}
              disabled={loading}
            />
          </div>

          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            disabled={loading}
          />

          <Input
            placeholder="Phone (read-only)"
            value={formData.phone}
            disabled
          />

          <Input
            type="number"
            placeholder="Age"
            value={formData.age}
            onChange={(e) => handleChange('age', e.target.value)}
            disabled={loading}
          />

          <Input
            placeholder="Address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            disabled={loading}
          />

          <Input
            placeholder="Country"
            value={formData.country}
            onChange={(e) => handleChange('country', e.target.value)}
            disabled={loading}
          />

          <Input
            placeholder="Organization Name"
            value={formData.organization_name}
            onChange={(e) => handleChange('organization_name', e.target.value)}
            disabled={loading}
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
                    disabled={loading}
                  >
                    <span className="edit-profile-page__gender-icon" aria-hidden="true">
                      {option === 'male' ? '♂' : '♀'}
                    </span>
                    <span>{option.charAt(0).toUpperCase() + option.slice(1)}</span>
                  </button>
                );
              })}
            </div>
          </div>

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
