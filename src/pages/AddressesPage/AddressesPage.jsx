import React, { useEffect, useState } from 'react';
import Input from '../../components/Input';
import backIcon from '../../images/AllAppointments/back.svg';
import {
  createMyAddress,
  deleteMyAddress,
  listMyAddresses,
  updateMyAddress,
} from '../../services/profileService';
import {
  MAX_USER_ADDRESSES,
  bookingFormToAddressPayload,
  formatProfileAddressDisplay,
  savedAddressToForm,
} from '../../utils/profileAddress';
import { isSessionAuthError, logAuthError } from '../../utils/sessionAuth';
import './AddressesPage.css';

const REQUIRED_FIELD = 'Required Field';
const INVALID_FORMAT = 'Invalid Format';
const RE_CITY = /^(?=.*[a-zA-Z])[a-zA-Z\s,.'-]{1,100}$/;
const RE_PINCODE = /^\d{6}$/;
const RE_ADDRESS_LINE = /^(?=.*[a-zA-Z0-9])[a-zA-Z0-9\s,.'#/()-]{1,200}$/;

const EMPTY_FORM = {
  house: '',
  area: '',
  landmark: '',
  city: '',
  state: '',
  pincode: '',
};

const optionalOrInvalidFormat = (value, pattern) => {
  const t = String(value).trim();
  if (!t) return null;
  if (!pattern.test(t)) return INVALID_FORMAT;
  return null;
};

const requiredOrInvalidFormat = (value, pattern) => {
  const t = String(value).trim();
  if (!t) return REQUIRED_FIELD;
  if (!pattern.test(t)) return INVALID_FORMAT;
  return null;
};

const validateAddressForm = (data) => {
  const errors = {};
  const set = (key, msg) => {
    if (msg) errors[key] = msg;
  };

  set('house', requiredOrInvalidFormat(data.house, RE_ADDRESS_LINE));
  set('area', optionalOrInvalidFormat(data.area, RE_ADDRESS_LINE));
  set('landmark', optionalOrInvalidFormat(data.landmark, RE_ADDRESS_LINE));
  set('city', requiredOrInvalidFormat(data.city, RE_CITY));
  set('state', optionalOrInvalidFormat(data.state, RE_CITY));
  set('pincode', requiredOrInvalidFormat(data.pincode, RE_PINCODE));
  return errors;
};

const HouseNoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M10 14V8.66667C10 8.48986 9.92976 8.32029 9.80474 8.19526C9.67971 8.07024 9.51014 8 9.33333 8H6.66667C6.48986 8 6.32029 8.07024 6.19526 8.19526C6.07024 8.32029 6 8.48986 6 8.66667V14" stroke="#9A9A9A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 6.66666C1.99995 6.47271 2.04222 6.28108 2.12386 6.10514C2.20549 5.9292 2.32453 5.77319 2.47267 5.64799L7.13933 1.64799C7.37999 1.4446 7.6849 1.33301 8 1.33301C8.3151 1.33301 8.62001 1.4446 8.86067 1.64799L13.5273 5.64799C13.6755 5.77319 13.7945 5.9292 13.8761 6.10514C13.9578 6.28108 14 6.47271 14 6.66666V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V6.66666Z" stroke="#9A9A9A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AreaStreetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <g clipPath="url(#addressesAreaClip)">
      <path d="M7.99967 0.666992V2.00033M7.99967 12.0003V15.3337M7.99967 6.00033V8.00033M3.99967 6.00033L1.33301 4.00033L3.99967 2.00033H11.9997V6.00033H3.99967ZM11.9997 12.0003L14.6663 10.0003L11.9997 8.00033H3.99967V12.0003H11.9997Z" stroke="#9A9A9A" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs>
      <clipPath id="addressesAreaClip">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const LandmarkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M15.3337 3.33333V12.6667C15.3337 13.0333 15.2032 13.3473 14.9423 13.6087C14.6814 13.87 14.3674 14.0004 14.0003 14H12.0003C11.8114 14 11.6532 13.936 11.5257 13.808C11.3981 13.68 11.3341 13.5218 11.3337 13.3333C11.3332 13.1449 11.3972 12.9867 11.5257 12.8587C11.6541 12.7307 11.8123 12.6667 12.0003 12.6667H14.0003V3.33333H8.00033V3.66667C8.00033 3.85556 7.93633 4.014 7.80833 4.142C7.68033 4.27 7.5221 4.33378 7.33366 4.33333C7.14521 4.33289 6.98699 4.26889 6.85899 4.14133C6.73099 4.01378 6.66699 3.85556 6.66699 3.66667V3.3C6.66699 2.94444 6.79477 2.63889 7.05033 2.38333C7.30588 2.12778 7.61144 2 7.96699 2H14.0003C14.367 2 14.681 2.13067 14.9423 2.392C15.2037 2.65333 15.3341 2.96711 15.3337 3.33333Z" fill="#9A9A9A" />
  </svg>
);

const PincodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="5" stroke="#9A9A9A" strokeWidth="1.5" />
    <circle cx="8" cy="8" r="1.25" fill="#9A9A9A" />
    <path d="M8 2.5V4.5M8 11.5V13.5M2.5 8H4.5M11.5 8H13.5" stroke="#9A9A9A" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const AddressesPage = ({ onBack }) => {
  const inputTextClass = '!text-[13px] !leading-[13px] placeholder:!text-[13px] placeholder:!leading-[13px]';
  const [view, setView] = useState('list');
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const loadAddresses = async () => {
    const rows = await listMyAddresses();
    setAddresses(Array.isArray(rows) ? rows : []);
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const rows = await listMyAddresses();
        if (mounted) {
          setAddresses(Array.isArray(rows) ? rows : []);
        }
      } catch (loadError) {
        if (mounted) {
          if (isSessionAuthError(loadError)) {
            return;
          }
          logAuthError('Addresses load failed', loadError);
          setError('Failed to load addresses. Please try again.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setFieldErrors({});
    setError('');
    setView('form');
  };

  const openEdit = (row) => {
    setEditingId(row.user_address_id);
    setFormData(savedAddressToForm(row));
    setFieldErrors({});
    setError('');
    setView('form');
  };

  const handleChange = (field, value) => {
    let nextValue = value;
    if (field === 'pincode') {
      nextValue = String(value || '').replace(/\D/g, '').slice(0, 6);
    }
    setFormData((prev) => ({ ...prev, [field]: nextValue }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSave = async () => {
    const validation = validateAddressForm(formData);
    setFieldErrors(validation);
    if (Object.keys(validation).length > 0) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      const payload = bookingFormToAddressPayload({
        house: formData.house,
        area: formData.area,
        landmark: formData.landmark,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      });
      if (editingId) {
        await updateMyAddress(editingId, payload);
      } else {
        await createMyAddress(payload);
      }
      await loadAddresses();
      setView('list');
      setEditingId(null);
    } catch (saveError) {
      setError(saveError?.message || 'Failed to save address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userAddressId) => {
    try {
      setSaving(true);
      setError('');
      await deleteMyAddress(userAddressId);
      setPendingDeleteId(null);
      await loadAddresses();
    } catch (deleteError) {
      setError(deleteError?.message || 'Failed to delete address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const canAdd = addresses.length < MAX_USER_ADDRESSES;
  const title = view === 'form' ? (editingId ? 'Edit Address' : 'Add Address') : 'Addresses';

  return (
    <div className="addresses-page">
      <div className="addresses-page__header-row">
        <div className="addresses-page__header-left">
          <button
            className="addresses-page__back-btn"
            onClick={() => {
              if (view === 'form') {
                setView('list');
                setEditingId(null);
                setError('');
                return;
              }
              onBack();
            }}
            aria-label="Go back"
            type="button"
          >
            <img src={backIcon} alt="" className="addresses-page__back-img" />
          </button>
          <h1 className="addresses-page__title">{title}</h1>
        </div>
      </div>

      {view === 'list' ? (
        <div className="addresses-page__content">
          {loading ? (
            <p className="addresses-page__status">Loading addresses...</p>
          ) : addresses.length === 0 ? (
            <div className="addresses-page__empty">
              <p className="addresses-page__empty-title">No addresses yet.</p>
              <p className="addresses-page__empty-sub">Add up to {MAX_USER_ADDRESSES} saved addresses</p>
            </div>
          ) : (
            <div className="addresses-page__list">
              {addresses.map((row) => (
                <article key={row.user_address_id} className="addresses-page__card">
                  <button type="button" className="addresses-page__card-main" onClick={() => openEdit(row)}>
                    {row.is_default ? <span className="addresses-page__badge">Default</span> : null}
                    <p className="addresses-page__card-text">{formatProfileAddressDisplay(row)}</p>
                    {row.pincode ? <p className="addresses-page__card-meta">{row.pincode}</p> : null}
                  </button>
                  <button
                    type="button"
                    className="addresses-page__delete-btn"
                    onClick={() => setPendingDeleteId(row.user_address_id)}
                    disabled={saving}
                  >
                    Delete
                  </button>
                </article>
              ))}
            </div>
          )}

          {error ? <p className="addresses-page__status addresses-page__status--error">{error}</p> : null}

          {canAdd ? (
            <button type="button" className="addresses-page__add-btn" onClick={openAdd} disabled={loading}>
              Add Address
            </button>
          ) : (
            <p className="addresses-page__limit">You can save up to {MAX_USER_ADDRESSES} addresses.</p>
          )}
        </div>
      ) : (
        <div className="addresses-page__content addresses-page__content--form">
          <div className="addresses-page__form">
            <Input
              placeholder="House No./ Building"
              value={formData.house}
              onChange={(e) => handleChange('house', e.target.value)}
              error={fieldErrors.house}
              leadingIcon={HouseNoIcon}
              className={inputTextClass}
              disabled={saving}
            />
            <Input
              placeholder="Area/ Street"
              value={formData.area}
              onChange={(e) => handleChange('area', e.target.value)}
              error={fieldErrors.area}
              leadingIcon={AreaStreetIcon}
              className={inputTextClass}
              disabled={saving}
            />
            <Input
              placeholder="Landmark"
              value={formData.landmark}
              onChange={(e) => handleChange('landmark', e.target.value)}
              error={fieldErrors.landmark}
              leadingIcon={LandmarkIcon}
              className={inputTextClass}
              disabled={saving}
            />
            <Input
              placeholder="City"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              error={fieldErrors.city}
              className={inputTextClass}
              disabled={saving}
            />
            <Input
              placeholder="State"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              error={fieldErrors.state}
              className={inputTextClass}
              disabled={saving}
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
              disabled={saving}
            />
          </div>
          {error ? <p className="addresses-page__status addresses-page__status--error">{error}</p> : null}
          <button type="button" className="addresses-page__save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}

      {pendingDeleteId ? (
        <div className="addresses-page__modal-overlay" onClick={() => setPendingDeleteId(null)}>
          <div className="addresses-page__modal" onClick={(e) => e.stopPropagation()}>
            <p className="addresses-page__modal-title">Delete this address?</p>
            <p className="addresses-page__modal-copy">This cannot be undone.</p>
            <div className="addresses-page__modal-actions">
              <button type="button" className="addresses-page__modal-cancel" onClick={() => setPendingDeleteId(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="addresses-page__modal-delete"
                onClick={() => handleDelete(pendingDeleteId)}
                disabled={saving}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AddressesPage;
