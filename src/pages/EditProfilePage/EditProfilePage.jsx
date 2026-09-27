import React, { useEffect, useState } from 'react';
import Input from '../../components/Input';
import Typography from '../../components/Typography';
import maleAvatar from '../../images/male-avatar.png';
import femaleAvatar from '../../images/female-avatar.png';
import './EditProfilePage.css';
import { getMyProfile, invalidateMyProfileCache, updateMyProfile } from '../../services/profileService';
import { getMyProfiles, invalidateMyProfilesCache, updateMySubProfile } from '../../services/usersService';
import { normalizeProfilePhone } from '../../utils/profilePrimaryContact';

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
  set('email', optionalOrInvalidFormat(data.email, RE_EMAIL));
  set('phone', optionalOrInvalidFormat(data.phone, RE_PHONE));
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
    gender: '',
    phone: '',
  });

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

        setFormData({
          first_name: profileToEdit?.first_name || '',
          last_name: profileToEdit?.last_name || '',
          email: profileToEdit?.email || '',
          age: getAgeValue(profileToEdit),
          gender: (profileToEdit?.gender || '').toLowerCase(),
          organization_name: profileToEdit?.referred_by || '',
          phone: normalizeProfilePhone(profileToEdit?.phone),
        });
        setLockedProfileFields({
          gender: (profileToEdit?.gender || '').toLowerCase(),
          phone: String(profileToEdit?.phone || '').trim(),
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
      const email = formData.email.trim() || null;
      const gender = lockedProfileFields.gender.trim() || null;
      const editedPhone = String(formData.phone || '').trim();
      const phone = editedPhone
        || (isSubProfileEdit ? null : String(lockedProfileFields.phone || '').trim())
        || null;

      const dateOfBirth = getDateOfBirthFromAge(formData.age);
      const profilePayload = {
        age,
        first_name: formData.first_name.trim() || null,
        last_name: formData.last_name.trim() || null,
        email,
        gender,
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
            disabled={loading}
          />

          <Input
            type="tel"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={fieldErrors.phone}
            maxLength={10}
            className={inputTextClass}
            disabled={loading}
          />

          <Input
            placeholder="Organization Name"
            value={formData.organization_name}
            onChange={(e) => handleChange('organization_name', e.target.value)}
            error={fieldErrors.organization_name}
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
