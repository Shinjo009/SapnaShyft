import React, { useState, useRef, useEffect } from 'react';
import Typography from '../../components/Typography';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Logo from '../../components/Logo';
import './SignupPage.css';

/**
 * SignupPage - User registration with personal details
 * 
 * Props:
 * - onSuccess: Called when Send OTP is clicked
 * - onLogin: Called when user clicks "Log in" to go back to login page
 */
const SignupPage = ({ onSuccess, onLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    month: 'May',
    day: '08',
    year: '2021',
  });

  const monthColRef = useRef(null);
  const dayColRef = useRef(null);
  const yearColRef = useRef(null);
  const scrollTimeoutsRef = useRef({});

  const months = React.useMemo(() => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], []);
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 83 }, (_, i) => String(currentYear - 18 - i));

  // Get indices for current selections
  const monthIndex = months.indexOf(formData.month);
  const dayIndex = days.indexOf(formData.day);
  const yearIndex = years.indexOf(formData.year);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setFormData(prev => ({
      ...prev,
      phone: value
    }));
  };

  const handleGenderChange = (gender) => {
    setFormData(prev => ({
      ...prev,
      gender
    }));
  };

  useEffect(() => {
    const scrollTimeouts = scrollTimeoutsRef.current;
    const ITEM_HEIGHT = 126.853 / 3;
    const arrays = { month: months, day: days, year: years };
    const indices = { month: monthIndex, day: dayIndex, year: yearIndex };

    const setColumnByIndex = (column, index) => {
      const currentArray = arrays[column];
      const clampedIndex = Math.max(0, Math.min(index, currentArray.length - 1));
      const value = currentArray[clampedIndex];

      setFormData(prev => (
        prev[column] === value
          ? prev
          : { ...prev, [column]: value }
      ));
    };

    const setupColumn = (column, ref) => {
      const el = ref.current;
      if (!el) return () => {};

      const onScroll = () => {
        if (scrollTimeoutsRef.current[column]) {
          clearTimeout(scrollTimeoutsRef.current[column]);
        }

        scrollTimeoutsRef.current[column] = setTimeout(() => {
          const newIndex = Math.round(el.scrollTop / ITEM_HEIGHT);
          el.scrollTo({ top: newIndex * ITEM_HEIGHT, behavior: 'smooth' });
          setColumnByIndex(column, newIndex);
        }, 80);
      };

      el.addEventListener('scroll', onScroll, { passive: true });
      el.scrollTop = indices[column] * ITEM_HEIGHT;

      return () => {
        el.removeEventListener('scroll', onScroll);
      };
    };

    const cleanups = [
      setupColumn('month', monthColRef),
      setupColumn('day', dayColRef),
      setupColumn('year', yearColRef)
    ];

    return () => {
      Object.values(scrollTimeouts).forEach(timeoutId => clearTimeout(timeoutId));
      cleanups.forEach(cleanup => cleanup && cleanup());
    };
  }, [monthIndex, dayIndex, yearIndex, months, days, years]);

  const handleSendOTP = () => {
    const { firstName, lastName, email, phone, gender } = formData;
    if (firstName.trim() && lastName.trim() && email.trim() && phone.trim() && gender) {
      console.log('Signup Form Submitted:', formData);
      onSuccess(formData);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-8 p-8">
      <Typography variant="heading" align="center">
        Welcome to
      </Typography>

      <Logo size="lg" />

      <div className="space-y-6">
        <Typography variant="heading" as="h2">
          Signup
        </Typography>

        <div className="space-y-6">
          <Input
            name="firstName"
            type="text"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleInputChange}
          />

          <Input
            name="lastName"
            type="text"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleInputChange}
          />

          <Input
            name="email"
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleInputChange}
          />

          <Input
            name="phone"
            type="tel"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handlePhoneChange}
          />

          {/* Gender Selection */}
          <div className="space-y-3">
            <label className="gender-label">Select Gender</label>
            <div className="gender-options">
              <label className="gender-radio">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={() => handleGenderChange('male')}
                  className="radio-input"
                />
                <span className={formData.gender === 'male' ? 'radio-label selected' : 'radio-label'}>Male</span>
              </label>
              <label className="gender-radio">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={() => handleGenderChange('female')}
                  className="radio-input"
                />
                <span className={formData.gender === 'female' ? 'radio-label selected' : 'radio-label'}>Female</span>
              </label>
              <label className="gender-radio">
                <input
                  type="radio"
                  name="gender"
                  value="other"
                  checked={formData.gender === 'other'}
                  onChange={() => handleGenderChange('other')}
                  className="radio-input"
                />
                <span className={formData.gender === 'other' ? 'radio-label selected' : 'radio-label'}>Other</span>
              </label>
            </div>
          </div>

          {/* Date of Birth Selection */}
          <div className="space-y-3">
            <label className="dob-label">Select Date of Birth</label>
            <div className="date-picker-wrapper">
              <div className="date-picker-container">
                <div className="date-row-bg date-row-top"></div>
                <div className="date-row-bg date-row-middle"></div>
                <div className="date-row-bg date-row-bottom"></div>
                <div 
                  ref={monthColRef}
                  className="date-column"
                >
                  <div className="date-values">
                    {months.map((month, idx) => (
                      <div key={month + idx} className={`date-value ${idx === monthIndex ? 'active' : ''}`}>
                        {month}
                      </div>
                    ))}
                  </div>
                </div>
                <div 
                  ref={dayColRef}
                  className="date-column"
                >
                  <div className="date-values">
                    {days.map((day, idx) => (
                      <div key={day + idx} className={`date-value ${idx === dayIndex ? 'active' : ''}`}>
                        {day}
                      </div>
                    ))}
                  </div>
                </div>
                <div 
                  ref={yearColRef}
                  className="date-column"
                >
                  <div className="date-values">
                    {years.map((year, idx) => (
                      <div key={year + idx} className={`date-value ${idx === yearIndex ? 'active' : ''}`}>
                        {year}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Button onClick={handleSendOTP}>
              Send OTP
            </Button>
          </div>
        </div>
      </div>

      <div className="text-center space-y-4" style={{ marginTop: '10px' }}>
        <span className="opacity-80 text-white text-center font-lato text-[10px] font-medium leading-normal tracking-[0.05px]">
          Already have an account?{' '}
          <span 
            className="text-[12px] tracking-[0.06px] underline cursor-pointer hover:opacity-80"
            onClick={onLogin}
          >
            Log in
          </span>
        </span>
      </div>
    </div>
  );
};

export default SignupPage;
