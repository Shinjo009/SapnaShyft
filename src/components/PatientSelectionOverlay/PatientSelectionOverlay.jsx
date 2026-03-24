import React, { useEffect, useMemo, useState } from 'react';
import './PatientSelectionOverlay.css';

const PATIENTS = [
  {
    id: 'harshili',
    name: 'Harshili Gada',
    meta: 'F, 29  |  Primary',
    gender: 'female',
  },
  {
    id: 'harsh',
    name: 'Harsh',
    meta: 'M, 25  |  Spouse',
    gender: 'male',
  },
];

const MaleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="16" viewBox="0 0 18 16" fill="none" aria-hidden="true">
    <path d="M0.185458 15.99C0.249491 16.0067 0.317521 15.9975 0.374801 15.9643C0.43208 15.9312 0.473994 15.8768 0.491458 15.813C1.00646 13.8915 3.09946 13.3935 4.35046 13.0955C4.66396 13.021 4.91146 12.962 5.07246 12.8925C6.49746 12.274 6.96196 11.279 7.10096 10.553C7.10922 10.5098 7.10595 10.4652 7.09146 10.4237C7.07698 10.3821 7.0518 10.3452 7.01846 10.3165C6.27646 9.676 5.65046 8.7145 5.25546 7.6085C5.24421 7.57683 5.2267 7.54775 5.20396 7.523C4.68146 6.955 4.38146 6.3545 4.38146 5.876C4.38146 5.5965 4.48696 5.409 4.72446 5.2675C4.76003 5.24623 4.78976 5.21645 4.81097 5.18084C4.83218 5.14523 4.8442 5.10491 4.84596 5.0635C4.95646 2.5165 6.77046 0.5115 8.99546 0.4985L9.04896 0.502C11.285 0.533 13.0875 2.581 13.152 5.164C13.1529 5.19929 13.1614 5.23398 13.1767 5.26578C13.192 5.29758 13.2139 5.32578 13.241 5.3485C13.3975 5.481 13.4705 5.649 13.4705 5.877C13.4705 6.2775 13.257 6.77 12.87 7.263C12.8513 7.28659 12.8371 7.31336 12.828 7.342C12.428 8.61 11.71 9.7295 10.859 10.4145C10.8236 10.4429 10.7967 10.4804 10.781 10.5229C10.7653 10.5655 10.7615 10.6115 10.77 10.656C10.909 11.3815 11.3735 12.376 12.7985 12.9955C12.967 13.0685 13.2285 13.1255 13.56 13.197C14.7985 13.465 16.871 13.9145 17.3795 15.813C17.388 15.8447 17.4027 15.8744 17.4227 15.9005C17.4427 15.9265 17.4677 15.9483 17.4962 15.9647C17.5246 15.9811 17.556 15.9917 17.5886 15.996C17.6212 16.0002 17.6542 15.998 17.686 15.9895C17.7177 15.981 17.7474 15.9663 17.7734 15.9462C17.7995 15.9262 17.8213 15.9013 17.8377 15.8728C17.8541 15.8443 17.8647 15.8129 17.8689 15.7804C17.8732 15.7478 17.871 15.7147 17.8625 15.683C17.275 13.4895 14.927 12.981 13.666 12.708C13.3735 12.6445 13.121 12.59 12.998 12.536C12.068 12.132 11.495 11.5165 11.2925 10.7035C12.156 9.962 12.8785 8.818 13.2915 7.535C13.73 6.965 13.971 6.378 13.971 5.8765C13.971 5.542 13.863 5.263 13.649 5.045C13.53 2.243 11.5305 0.0365 9.04896 0.001L8.97446 0C6.53796 0.013 4.52996 2.1615 4.35446 4.915C4.04146 5.145 3.88246 5.4675 3.88246 5.877C3.88246 6.4685 4.21696 7.176 4.80246 7.825C5.20696 8.9365 5.83396 9.913 6.58046 10.5965C6.37896 11.4125 5.80546 12.03 4.87346 12.4345C4.75296 12.487 4.51296 12.5445 4.23496 12.6105C2.96446 12.9125 0.600458 13.475 0.00845779 15.684C-0.00863897 15.748 0.000403151 15.8163 0.0335957 15.8737C0.0667882 15.931 0.121413 15.9729 0.185458 15.99Z" fill="white"/>
  </svg>
);

const FemaleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="16" viewBox="0 0 18 16" fill="none" aria-hidden="true">
    <path d="M11.046 10.362C11.007 10.3569 10.9673 10.3613 10.9303 10.3748C10.8933 10.3882 10.8601 10.4105 10.8335 10.4395C10.8066 10.4682 10.7869 10.5029 10.776 10.5407C10.765 10.5785 10.7632 10.6183 10.7705 10.657C10.9085 11.382 11.373 12.377 12.799 12.9965C12.968 13.0695 13.229 13.1265 13.56 13.198C14.799 13.466 16.871 13.915 17.38 15.814C17.3886 15.8457 17.4033 15.8755 17.4233 15.9016C17.4433 15.9276 17.4683 15.9495 17.4968 15.9659C17.5253 15.9823 17.5567 15.993 17.5893 15.9972C17.6219 16.0015 17.655 15.9993 17.6868 15.9907C17.7185 15.9822 17.7483 15.9675 17.7743 15.9475C17.8004 15.9274 17.8223 15.9025 17.8387 15.874C17.8551 15.8455 17.8657 15.8141 17.87 15.7815C17.8743 15.7489 17.8721 15.7157 17.8635 15.684C17.275 13.4905 14.9275 12.982 13.666 12.709C13.374 12.6455 13.1215 12.591 12.998 12.537C12.141 12.165 11.5875 11.613 11.3475 10.894C13.7285 11.071 14.8065 10.1225 14.854 10.0795C14.8833 10.053 14.9059 10.0199 14.9199 9.98296C14.9339 9.94603 14.939 9.9063 14.9347 9.86702C14.9304 9.82775 14.9169 9.79005 14.8952 9.75702C14.8735 9.72399 14.8443 9.69657 14.81 9.677C13.436 8.892 13.436 6.1795 13.436 5.158C13.436 2.3015 11.512 0.037 9.04552 0.0015L8.97502 0C6.47252 0.014 4.43602 2.281 4.43602 5.054C4.43602 6.0755 4.43602 8.7885 3.06202 9.573C3.0266 9.59357 2.99674 9.62248 2.97504 9.65722C2.95334 9.69196 2.94045 9.73147 2.93749 9.77232C2.93454 9.81318 2.9416 9.85413 2.95808 9.89163C2.97455 9.92913 2.99993 9.96204 3.03202 9.9875C3.10102 10.041 4.62602 11.208 6.50252 10.8535C6.25152 11.5425 5.70552 12.0725 4.87352 12.434C4.75302 12.4865 4.51302 12.544 4.23502 12.61C2.96502 12.912 0.600521 13.4745 0.00852111 15.6835C1.80174e-05 15.7152 -0.00214876 15.7484 0.00214449 15.7809C0.00643773 15.8135 0.0171069 15.8449 0.0335429 15.8734C0.0667368 15.9309 0.121405 15.9728 0.185521 15.99C0.249637 16.0072 0.317949 15.9982 0.375429 15.965C0.432909 15.9318 0.474848 15.8771 0.492021 15.813C1.00652 13.891 3.10052 13.3935 4.35102 13.0955C4.66452 13.021 4.91202 12.962 5.07302 12.8925C6.49902 12.273 6.96302 11.278 7.10152 10.553C7.10959 10.5105 7.10651 10.4667 7.09257 10.4258C7.07864 10.3848 7.05433 10.3482 7.02202 10.3195C6.98977 10.2907 6.95061 10.2708 6.90838 10.2617C6.86614 10.2526 6.82226 10.2546 6.78102 10.2675C5.42752 10.6935 4.17702 10.1075 3.63052 9.7825C4.93602 8.6895 4.93602 6.174 4.93602 5.054C4.93602 2.5555 6.74902 0.5125 8.99602 0.499L9.04902 0.502C11.265 0.5335 12.936 2.535 12.936 5.158C12.936 6.2785 12.936 8.7995 14.247 9.8925C13.7955 10.1505 12.766 10.568 11.046 10.362Z" fill="white"/>
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M16.3767 4.40976C17.2936 3.49312 17.2938 2.00455 16.3771 1.08768C15.4605 0.170807 13.9719 0.170621 13.0551 1.08726L1.93339 12.2114C1.73991 12.4043 1.59682 12.6419 1.51673 12.9031L0.415893 16.5298C0.372015 16.6766 0.412276 16.8357 0.520724 16.9439C0.629172 17.0522 0.788301 17.0922 0.93506 17.0481L4.56256 15.9481C4.82353 15.8687 5.06104 15.7265 5.25423 15.5339L16.3767 4.40976M11.2317 2.89976L14.5651 6.23309" stroke="white" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UncheckedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none" aria-hidden="true">
    <path d="M14.5 0.5H4.5C2.29086 0.5 0.5 2.29086 0.5 4.5V14.5C0.5 16.7091 2.29086 18.5 4.5 18.5H14.5C16.7091 18.5 18.5 16.7091 18.5 14.5V4.5C18.5 2.29086 16.7091 0.5 14.5 0.5Z" stroke="#CCCCCC" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="9" viewBox="0 0 12 9" fill="none" aria-hidden="true">
    <path d="M0.75 4.75L4.25 8.25L11.25 0.75" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect width="24" height="24" rx="12" fill="white" fillOpacity="0.1"/>
    <path d="M8.34687 12.875L13.2469 17.775L12 19L5 12L12 5L13.2469 6.225L8.34687 11.125H19V12.875H8.34687Z" fill="#9A9A9A"/>
  </svg>
);

const DownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect width="24" height="24" rx="12" fill="white" fillOpacity="0.1"/>
    <path d="M12 15L7 10H17L12 15Z" fill="#9A9A9A"/>
  </svg>
);

const UseSameCheckboxIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M3.33333 2C2.97971 2 2.64057 2.14048 2.39052 2.39052C2.14048 2.64057 2 2.97971 2 3.33333V12.6667C2 13.0203 2.14048 13.3594 2.39052 13.6095C2.64057 13.8595 2.97971 14 3.33333 14H12.6667C13.0203 14 13.3594 13.8595 13.6095 13.6095C13.8595 13.3594 14 13.0203 14 12.6667V3.33333C14 2.97971 13.8595 2.64057 13.6095 2.39052C13.3594 2.14048 13.0203 2 12.6667 2H3.33333ZM3.33333 3.33333H12.6667V12.6667H3.33333V3.33333ZM11.3 6.53C11.3637 6.4685 11.4145 6.39494 11.4494 6.3136C11.4843 6.23227 11.5027 6.14479 11.5035 6.05627C11.5043 5.96775 11.4874 5.87996 11.4539 5.79803C11.4204 5.7161 11.3709 5.64166 11.3083 5.57907C11.2457 5.51647 11.1712 5.46697 11.0893 5.43345C11.0074 5.39993 10.9196 5.38306 10.8311 5.38383C10.7425 5.3846 10.6551 5.40299 10.5737 5.43793C10.4924 5.47287 10.4188 5.52366 10.3573 5.58733L7.05733 8.88733L5.64333 7.47333C5.58144 7.41139 5.50795 7.36225 5.42706 7.32871C5.34617 7.29517 5.25947 7.2779 5.1719 7.27787C4.99506 7.2778 4.82543 7.34799 4.70033 7.473C4.57524 7.59801 4.50493 7.76758 4.50487 7.94443C4.5048 8.12128 4.57499 8.29091 4.7 8.416L6.53867 10.2547C6.60677 10.3228 6.68763 10.3768 6.77662 10.4137C6.86561 10.4506 6.961 10.4696 7.05733 10.4696C7.15367 10.4696 7.24905 10.4506 7.33805 10.4137C7.42704 10.3768 7.5079 10.3228 7.576 10.2547L11.3 6.53Z" fill="#9A9A9A"/>
  </svg>
);

const PackagePulseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="14" viewBox="0 0 16 14" fill="none" aria-hidden="true">
    <path d="M14.418 6.854H12.713C12.0955 6.85282 11.5528 7.22226 11.3861 7.75738L9.77047 12.9301C9.74908 12.9961 9.68186 13.0415 9.60547 13.0415C9.52908 13.0415 9.46186 12.9961 9.44047 12.9301L5.64547 0.777879C5.62408 0.711879 5.55686 0.666504 5.48047 0.666504C5.40408 0.666504 5.33686 0.711879 5.31547 0.777879L3.69984 5.95063C3.53381 6.48353 2.9948 6.85242 2.37984 6.854H0.667969" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SelectedRowPackageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path d="M14.0013 7.33317H12.348C11.7492 7.33189 11.223 7.72995 11.0613 8.3065L9.49464 13.8798C9.47389 13.9509 9.40871 13.9998 9.33464 13.9998C9.26056 13.9998 9.19538 13.9509 9.17464 13.8798L5.49464 0.786504C5.47389 0.715393 5.40871 0.666504 5.33464 0.666504C5.26056 0.666504 5.19538 0.715393 5.17464 0.786504L3.60797 6.35984C3.44696 6.93401 2.92429 7.33146 2.32797 7.33317H0.667969" stroke="#C4C4C4" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PatientSelectionOverlay = ({ open, onClose }) => {
  const [view, setView] = useState('select');
  const [patients, setPatients] = useState(PATIENTS);
  const [selectedIds, setSelectedIds] = useState([]);
  const [phoneSame, setPhoneSame] = useState(true);
  const [emailSame, setEmailSame] = useState(true);
  const [activeField, setActiveField] = useState('firstName');
  const [formData, setFormData] = useState({
    firstName: 'Ramesh',
    lastName: 'Ramesh',
    relation: 'Spouse',
    age: '23',
    gender: 'Male',
    phone: '9987254209',
    email: 'abc.de@example.com',
  });

  useEffect(() => {
    if (!open) {
      setView('select');
    }
  }, [open]);

  const selectedCount = selectedIds.length;
  const canContinue = selectedCount > 0;

  const selectedText = useMemo(() => {
    if (selectedCount === 1) {
      return '1 patient selected';
    }
    return `${selectedCount} patients selected`;
  }, [selectedCount]);

  const pricing = useMemo(() => {
    if (selectedCount <= 0) {
      return null;
    }

    if (selectedCount === 1) {
      return { current: 2499, old: 4498, off: 44 };
    }

    return {
      current: 2339 * selectedCount,
      old: 4498 * selectedCount,
      off: 48,
    };
  }, [selectedCount]);

  const formatPrice = (value) => `₹ ${value.toLocaleString('en-IN')}`;

  const togglePatient = (patientId) => {
    setSelectedIds((prev) => {
      if (prev.includes(patientId)) {
        return prev.filter((id) => id !== patientId);
      }
      return [...prev, patientId];
    });
  };

  if (!open) {
    return null;
  }

  const handleClose = () => {
    setView('select');
    onClose();
  };

  const renderInputField = (key, label, options = {}) => {
    const fieldClass = `patient-add__field${activeField === key ? ' is-focused' : ''}${options.half ? ' patient-add__field--half' : ''}`;
    const isDropdown = options.dropdown;

    return (
      <label className={fieldClass} htmlFor={`patient-${key}`}>
        <span className="patient-add__label-chip">{label}</span>

        <div className="patient-add__field-inner">
          <input
            id={`patient-${key}`}
            value={formData[key]}
            onFocus={() => setActiveField(key)}
            onChange={(event) => setFormData((prev) => ({ ...prev, [key]: event.target.value }))}
            className="patient-add__input"
            readOnly={isDropdown}
          />

          {isDropdown ? (
            <button type="button" className="patient-add__dropdown-btn" aria-label={`Open ${label} dropdown`}>
              <DownIcon />
            </button>
          ) : null}
        </div>
      </label>
    );
  };

  const handleSavePatient = () => {
    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();

    if (!firstName) {
      return;
    }

    const fullName = `${firstName}${lastName ? ` ${lastName}` : ''}`;
    const normalizedGender = formData.gender.trim().toLowerCase();
    const genderCode = normalizedGender.startsWith('f') ? 'F' : 'M';
    const genderType = normalizedGender.startsWith('f') ? 'female' : 'male';
    const age = formData.age.trim() || '--';
    const relation = formData.relation.trim() || 'Primary';
    const newId = `patient-${Date.now()}`;

    setPatients((prev) => ([
      ...prev,
      {
        id: newId,
        name: fullName,
        meta: `${genderCode}, ${age}  |  ${relation}`,
        gender: genderType,
      },
    ]));

    setSelectedIds((prev) => [...prev, newId]);
    setView('select');
  };

  return (
    <div className="patient-select-overlay" role="dialog" aria-modal="true" aria-label="Select Patients">
      <button type="button" className="patient-select-overlay__close" aria-label="Close" onClick={handleClose}>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect width="32" height="32" rx="16" fill="#063533"/>
          <path d="M23.1992 8.75C23.2127 8.75003 23.2258 8.75513 23.2354 8.76465C23.2449 8.77417 23.25 8.78732 23.25 8.80078C23.25 8.81422 23.2448 8.82738 23.2354 8.83691L16.6006 15.4697L16.0703 16L16.6006 16.5303L23.2354 23.1631C23.2448 23.1726 23.25 23.1858 23.25 23.1992C23.25 23.2127 23.2449 23.2258 23.2354 23.2354C23.2258 23.2449 23.2127 23.25 23.1992 23.25C23.1858 23.25 23.1726 23.2448 23.1631 23.2354L16.5303 16.6006L16 16.0703L15.4697 16.6006L8.83691 23.2354C8.82738 23.2448 8.81422 23.25 8.80078 23.25C8.78732 23.25 8.77417 23.2449 8.76465 23.2354C8.75513 23.2258 8.75003 23.2127 8.75 23.1992C8.75 23.1858 8.75518 23.1726 8.76465 23.1631L15.3994 16.5303L15.9297 16L15.3994 15.4697L8.76465 8.83691C8.75998 8.83221 8.75644 8.82643 8.75391 8.82031C8.75136 8.81415 8.75 8.80745 8.75 8.80078C8.75002 8.79414 8.75136 8.78739 8.75391 8.78125C8.75646 8.77514 8.75996 8.76933 8.76465 8.76465C8.76933 8.75996 8.77514 8.75646 8.78125 8.75391C8.78739 8.75136 8.79414 8.75002 8.80078 8.75C8.80745 8.75 8.81415 8.75136 8.82031 8.75391C8.82643 8.75644 8.83221 8.75998 8.83691 8.76465L15.4697 15.3994L16 15.9297L16.5303 15.3994L23.1631 8.76465C23.1726 8.75518 23.1858 8.75 23.1992 8.75Z" fill="white" stroke="white" strokeWidth="1.5"/>
        </svg>
      </button>

      <div className={`patient-select-overlay__sheet${view === 'add' ? ' is-add' : ''}`}>
        {view === 'select' ? (
          <>
            <h3 className="patient-select-overlay__title">Select patients</h3>

            <div className="patient-select-overlay__list">
              {patients.map((patient) => {
                const selected = selectedIds.includes(patient.id);
                return (
                  <div key={patient.id}>
                    <div className="patient-select-overlay__row">
                      <div className="patient-select-overlay__left">
                        <div className="patient-select-overlay__avatar">
                          {patient.gender === 'male' ? <MaleIcon /> : <FemaleIcon />}
                        </div>

                        <div className="patient-select-overlay__details">
                          <p className="patient-select-overlay__name">{patient.name}</p>
                          <p className="patient-select-overlay__meta">{patient.meta}</p>
                        </div>
                      </div>

                      <div className="patient-select-overlay__actions">
                        <button type="button" className="patient-select-overlay__icon-btn" aria-label={`Edit ${patient.name}`}>
                          <EditIcon />
                        </button>

                        <button
                          type="button"
                          className="patient-select-overlay__icon-btn patient-select-overlay__check-btn"
                          aria-label={selected ? `Unselect ${patient.name}` : `Select ${patient.name}`}
                          onClick={() => togglePatient(patient.id)}
                        >
                          <UncheckedIcon />
                          {selected ? <span className="patient-select-overlay__checkmark"><CheckedIcon /></span> : null}
                        </button>
                      </div>
                    </div>

                    {selected ? (
                      <div className="patient-select-overlay__selected-package">
                        <div className="patient-select-overlay__selected-package-left">
                          <SelectedRowPackageIcon />
                          <span>Full Body Checkup</span>
                        </div>
                        <button type="button" className="patient-select-overlay__selected-package-change">Change</button>
                      </div>
                    ) : null}

                    <div className="patient-select-overlay__divider" />
                  </div>
                );
              })}
            </div>

            <button type="button" className="patient-select-overlay__add-btn" onClick={() => setView('add')}>+ Add new patient</button>

            <div className="patient-select-overlay__footer">
              <div className="patient-select-overlay__footer-left">
                <span className="patient-select-overlay__selected-count">{selectedText}</span>
                {pricing ? (
                  <div className="patient-select-overlay__selected-price-row">
                    <span className="patient-select-overlay__selected-price-now">{formatPrice(pricing.current)}</span>
                    <span className="patient-select-overlay__selected-price-old">{formatPrice(pricing.old)}</span>
                    <span className="patient-select-overlay__selected-price-off">{pricing.off}% OFF</span>
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                className={`patient-select-overlay__continue${canContinue ? ' is-active' : ''}`}
                disabled={!canContinue}
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="patient-add__header-row">
              <button type="button" className="patient-add__back" aria-label="Back to select patients" onClick={() => setView('select')}>
                <BackIcon />
              </button>
              <h3 className="patient-select-overlay__title">Add a new patient</h3>
            </div>

            <div className="patient-add__body">
              <div className="patient-add__split-row">
                {renderInputField('firstName', 'First Name', { half: true })}
                {renderInputField('lastName', 'Last Name', { half: true })}
              </div>

              {renderInputField('relation', 'Relation', { dropdown: true })}

              <div className="patient-add__split-row">
                {renderInputField('age', 'Age', { half: true })}
                {renderInputField('gender', 'Gender', { half: true, dropdown: true })}
              </div>

              <div className="patient-add__same-row">
                <span>Use same</span>
                <button type="button" className="patient-add__same-checkbox" onClick={() => setPhoneSame((prev) => !prev)}>
                  {phoneSame ? <UseSameCheckboxIcon /> : <span className="patient-add__same-checkbox-empty" />}
                </button>
              </div>
              {renderInputField('phone', 'Phone')}

              <div className="patient-add__same-row">
                <span>Use same</span>
                <button type="button" className="patient-add__same-checkbox" onClick={() => setEmailSame((prev) => !prev)}>
                  {emailSame ? <UseSameCheckboxIcon /> : <span className="patient-add__same-checkbox-empty" />}
                </button>
              </div>
              {renderInputField('email', 'Email')}

              <div className="patient-add__package-row">
                <div className="patient-add__package-left">
                  <PackagePulseIcon />
                  <div>
                    <p className="patient-add__package-title">Full Body Checkup</p>
                    <p className="patient-add__package-subtitle">Current Package</p>
                  </div>
                </div>

                <button type="button" className="patient-add__change-btn">Change</button>
              </div>

              <button type="button" className="patient-add__save-btn" onClick={handleSavePatient}>Save</button>
            </div>
          </>
        )}

        <div className="patient-select-overlay__grip" aria-hidden="true" />
      </div>
    </div>
  );
};

export default PatientSelectionOverlay;
