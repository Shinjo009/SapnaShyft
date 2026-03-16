import React, { useState, useEffect } from 'react';
import { getMyPreferences, updateMyPreferences } from '../../services/usersService';
import pushIcon from '../../images/Perm-Push.svg';
import emailIcon from '../../images/Perm-Email.svg';
import smsIcon from '../../images/Perm-SMS.svg';
import accessIcon from '../../images/Perm-Access.svg';
import storeIcon from '../../images/Perm-Store.svg';
import './PermissionsPage.css';

const ToggleSwitch = ({ isOn, onClick, label }) => (
  <button
    type="button"
    className="permissions-page__toggle"
    onClick={onClick}
    aria-label={label}
    aria-pressed={isOn}
  >
    {isOn ? (
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="15" viewBox="0 0 30 15" fill="none" aria-hidden="true">
        <rect width="30" height="15" rx="7.5" fill="#4B8D83" />
        <circle cx="22" cy="7.5" r="6" fill="white" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" width="31" height="16" viewBox="0 0 31 16" fill="none" aria-hidden="true">
        <rect x="0.25" y="0.25" width="30.5" height="15.5" rx="7.75" fill="black" fillOpacity="0.25" />
        <rect x="0.25" y="0.25" width="30.5" height="15.5" rx="7.75" stroke="#4B8D83" strokeWidth="0.5" />
        <circle cx="8.5" cy="8" r="6" fill="white" />
      </svg>
    )}
  </button>
);


const defaultPermissions = {
  push_enabled: true,
  email_enabled: true,
  sms_enabled: false,
  access_to_files: true,
  store_downloaded_files: true,
};

const PermissionsPage = ({ onBack }) => {
  const [permissions, setPermissions] = useState(defaultPermissions);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch preferences on mount
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getMyPreferences()
      .then((data) => {
        if (mounted && typeof data === 'object') {
          setPermissions({ ...defaultPermissions, ...data });
        }
      })
      .catch((err) => {
        if (mounted) setError('Failed to load preferences');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  // Toggle and persist one preference key at a time
  const togglePermission = (apiKey) => {
    const nextValue = !permissions[apiKey];

    setPermissions((prev) => ({
      ...prev,
      [apiKey]: nextValue,
    }));

    updateMyPreferences({ [apiKey]: nextValue })
      .then((serverPreferences) => {
        if (serverPreferences && typeof serverPreferences === 'object') {
          setPermissions((prev) => ({
            ...prev,
            ...serverPreferences,
          }));
        }
      })
      .catch(() => {
      setError('Failed to update preferences');
      // Revert this toggle only if persistence fails.
      setPermissions((prev) => ({
        ...prev,
        [apiKey]: !nextValue,
      }));
      });
  };


  const notificationItems = [
    { key: 'push', label: 'Push Notification', icon: pushIcon, apiKey: 'push_enabled' },
    { key: 'email', label: 'Email Notification', icon: emailIcon, apiKey: 'email_enabled' },
    { key: 'sms', label: 'SMS Notification', icon: smsIcon, apiKey: 'sms_enabled' },
  ];

  const storageItems = [
    { key: 'access', label: 'Access to Files', icon: accessIcon, apiKey: 'access_to_files' },
    { key: 'store', label: 'Store Downloaded Files', icon: storeIcon, apiKey: 'store_downloaded_files' },
  ];

  return (
    <div className="permissions-page">
      <div className="permissions-page__header">
        <button
          className="permissions-page__back-btn"
          onClick={onBack}
          aria-label="Go back"
          type="button"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <h1 className="permissions-page__title">Permissions</h1>
      </div>

      <div className="permissions-page__content">
        {error && <div className="permissions-page__error">{error}</div>}
        {loading ? (
          <div className="permissions-page__loading">Loading...</div>
        ) : (
          <>
            <h2 className="permissions-page__section-title">Notifications Permissions</h2>
            <div className="permissions-page__box">
              {notificationItems.map((item, index) => (
                <React.Fragment key={item.key}>
                  <div className="permissions-page__row">
                    <div className="permissions-page__left">
                      <img src={item.icon} alt="" aria-hidden="true" className="permissions-page__icon" />
                      <span className="permissions-page__label">{item.label}</span>
                    </div>
                    <ToggleSwitch
                      isOn={permissions[item.apiKey]}
                      onClick={() => togglePermission(item.apiKey)}
                      label={`${item.label} ${permissions[item.apiKey] ? 'enabled' : 'disabled'}`}
                    />
                  </div>
                  {index < notificationItems.length - 1 && <div className="permissions-page__divider" />}
                </React.Fragment>
              ))}
            </div>

            <h2 className="permissions-page__section-title permissions-page__section-title--storage">Storage Permissions</h2>
            <div className="permissions-page__box">
              {storageItems.map((item, index) => (
                <React.Fragment key={item.key}>
                  <div className="permissions-page__row">
                    <div className="permissions-page__left">
                      <img src={item.icon} alt="" aria-hidden="true" className="permissions-page__icon" />
                      <span className="permissions-page__label">{item.label}</span>
                    </div>
                    <ToggleSwitch
                      isOn={permissions[item.apiKey]}
                      onClick={() => togglePermission(item.apiKey)}
                      label={`${item.label} ${permissions[item.apiKey] ? 'enabled' : 'disabled'}`}
                    />
                  </div>
                  {index < storageItems.length - 1 && <div className="permissions-page__divider" />}
                </React.Fragment>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PermissionsPage;
