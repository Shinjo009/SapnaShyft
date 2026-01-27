# React Login App - Project Documentation

**Date:** January 27, 2026  
**Project:** Health Insights Login & OTP Flow  
**Framework:** React (Create React App)  
**Styling:** Tailwind CSS v3  

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Setup & Installation](#setup--installation)
3. [Project Structure](#project-structure)
4. [Components Documentation](#components-documentation)
5. [Pages Documentation](#pages-documentation)
6. [Design Specifications](#design-specifications)
7. [How to Reuse Components](#how-to-reuse-components)
8. [Development Workflow](#development-workflow)
9. [Next Steps](#next-steps)

---

## 🎯 Project Overview

A mobile-first React application implementing a login and OTP verification flow based on Figma designs. The project follows atomic design principles with reusable components.

### Features Implemented:
- ✅ Login page with phone number entry
- ✅ OTP verification page with 6-digit input
- ✅ Countdown timer with resend functionality
- ✅ Pixel-perfect Figma implementation
- ✅ Fully reusable atomic components
- ✅ Mobile-first responsive design

---

## 🚀 Setup & Installation

### Prerequisites:
```bash
Node.js v16+ installed
npm or yarn package manager
```

### Installation Steps:
```bash
# Navigate to project
cd c:\Users\nigel\my-app

# Install dependencies
npm install

# Start development server
npm start
```

### Dependencies Installed:
- `react` v19.2.4
- `react-dom` v19.2.4
- `tailwindcss` v3
- `react-icons` v5.5.0
- `autoprefixer` v10.4.23
- `postcss` v8.5.6

---

## 📁 Project Structure

```
my-app/
├── public/
│   ├── index.html          # Lato font imported here
│   └── manifest.json
├── src/
│   ├── components/         # Atomic reusable components
│   │   ├── Button/
│   │   │   ├── Button.jsx
│   │   │   └── index.js
│   │   ├── Input/
│   │   │   ├── Input.jsx
│   │   │   └── index.js
│   │   ├── Typography/
│   │   │   ├── Typography.jsx
│   │   │   └── index.js
│   │   ├── Logo/
│   │   │   ├── Logo.jsx
│   │   │   └── index.js
│   │   ├── OTPInput/
│   │   │   ├── OTPInput.jsx
│   │   │   └── index.js
│   │   └── Timer/
│   │       ├── Timer.jsx
│   │       └── index.js
│   ├── pages/              # Page-level components
│   │   ├── LoginPage/
│   │   │   ├── LoginPage.jsx
│   │   │   └── index.js
│   │   └── OTPPage/
│   │       ├── OTPPage.jsx
│   │       └── index.js
│   ├── images/
│   │   ├── BG-1.png        # Background image
│   │   └── logo.svg        # App logo
│   ├── App.js              # Main app orchestrator
│   ├── App.css
│   ├── index.js
│   └── index.css           # Tailwind imports
├── tailwind.config.js      # Custom theme configuration
├── postcss.config.js       # PostCSS configuration
└── package.json
```

---

## 🧩 Components Documentation

### 1. Typography Component

**Location:** `src/components/Typography/Typography.jsx`

**Purpose:** Consistent text styling across the app based on Figma specs.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | string | `'label'` | Typography style: 'heading', 'bodyLarge', 'button', 'label', 'link' |
| `as` | string | `'p'` | HTML element to render |
| `align` | string | `'left'` | Text alignment: 'left', 'center', 'right' |
| `className` | string | `''` | Additional CSS classes |
| `children` | node | required | Content to render |

**Usage Examples:**
```jsx
import Typography from './components/Typography';

// Heading
<Typography variant="heading" align="center">
  Welcome to
</Typography>

// Body text
<Typography variant="bodyLarge">
  A few minutes' pause before the health insights unfold.
</Typography>

// Label
<Typography variant="label">Phone Number</Typography>

// Link
<Typography variant="link">Forgot Password?</Typography>

// Custom element
<Typography variant="heading" as="h1">Main Title</Typography>
```

**Figma Specs:**
- **heading:** 20px, 700 weight, 24px line-height, #FFF
- **bodyLarge:** 20px, 600 weight, 30px line-height, 0.891px letter-spacing
- **button:** 14px, 600 weight, 0.28px letter-spacing
- **label:** 12px, 400 weight, 16px line-height, #999
- **link:** 10px, 500 weight, 0.05px letter-spacing

---

### 2. Input Component

**Location:** `src/components/Input/Input.jsx`

**Purpose:** Styled input field with label and error state support.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | - | Optional label above input |
| `type` | string | `'text'` | Input type: 'text', 'tel', 'email', 'password' |
| `placeholder` | string | - | Placeholder text |
| `value` | string | - | Input value (controlled) |
| `onChange` | function | - | Change handler |
| `error` | string | - | Error message (shows red border) |
| `className` | string | `''` | Additional CSS classes |

**Usage Examples:**
```jsx
import { useState } from 'react';
import Input from './components/Input';

// Basic input
<Input
  type="tel"
  placeholder="Phone number"
  value={phoneNumber}
  onChange={(e) => setPhoneNumber(e.target.value)}
/>

// With label
<Input
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// With error
<Input
  label="Password"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  error="Password must be at least 8 characters"
/>
```

**Figma Specs:**
- Height: 40px
- Padding: 0 16px
- Border radius: 8px
- Border: 0.838px solid rgba(221, 219, 219, 0.20)
- Background: rgba(4, 251, 206, 0.10)
- Focus border: rgba(4, 251, 206, 0.40)

---

### 3. Button Component

**Location:** `src/components/Button/Button.jsx`

**Purpose:** Primary action button with gradient and loading states.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | node | required | Button text |
| `onClick` | function | - | Click handler |
| `disabled` | boolean | `false` | Disabled state |
| `loading` | boolean | `false` | Loading state (shows "Loading...") |
| `className` | string | `''` | Additional CSS classes |

**Usage Examples:**
```jsx
import Button from './components/Button';

// Basic button
<Button onClick={() => handleSubmit()}>
  Send OTP
</Button>

// Loading state
<Button loading={isLoading} onClick={() => handleSubmit()}>
  Submit
</Button>

// Disabled state
<Button disabled={!isValid} onClick={() => handleSubmit()}>
  Continue
</Button>
```

**Figma Specs:**
- Height: 40px
- Padding: 10px 24px
- Border radius: 24px
- Border: 1px solid #969696
- Background: linear-gradient(90deg, #296359 0%, #41AB99 100%)
- Box shadow: 0 12px 20px 0 rgba(255, 255, 255, 0.15)

---

### 4. Logo Component

**Location:** `src/components/Logo/Logo.jsx`

**Purpose:** Reusable logo with configurable sizes.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | string | `'md'` | Size preset: 'sm', 'md', 'lg', 'xl' |
| `alt` | string | `'Logo'` | Alt text for accessibility |
| `className` | string | `''` | Additional CSS classes |

**Usage Examples:**
```jsx
import Logo from './components/Logo';

// Different sizes
<Logo size="sm" />  {/* 48px */}
<Logo size="md" />  {/* 64px */}
<Logo size="lg" />  {/* 96px */}
<Logo size="xl" />  {/* 128px */}

// Custom styling
<Logo size="md" className="my-4" />
```

---

### 5. OTPInput Component

**Location:** `src/components/OTPInput/OTPInput.jsx`

**Purpose:** 6-digit OTP input with auto-focus and keyboard navigation.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | string | `''` | OTP value |
| `onChange` | function | required | Called with complete OTP string |
| `length` | number | `6` | Number of digits |
| `className` | string | `''` | Additional CSS classes |

**Usage Examples:**
```jsx
import { useState } from 'react';
import OTPInput from './components/OTPInput';

const [otp, setOtp] = useState('');

// 6-digit OTP
<OTPInput 
  value={otp} 
  onChange={setOtp} 
/>

// 4-digit OTP
<OTPInput 
  value={otp} 
  onChange={setOtp}
  length={4}
/>
```

**Features:**
- Auto-focus next box when digit entered
- Auto-focus previous box on backspace
- Paste support (paste full OTP)
- Keyboard navigation (arrow keys)
- Only accepts numbers

---

### 6. Timer Component

**Location:** `src/components/Timer/Timer.jsx`

**Purpose:** Countdown timer with resend functionality.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialSeconds` | number | `30` | Starting time in seconds |
| `onResend` | function | - | Called when Resend OTP clicked |
| `className` | string | `''` | Additional CSS classes |

**Usage Examples:**
```jsx
import Timer from './components/Timer';

// 30-second countdown
<Timer 
  initialSeconds={30}
  onResend={() => console.log('Resend OTP')}
/>

// 60-second countdown
<Timer 
  initialSeconds={60}
  onResend={handleResend}
/>
```

**Features:**
- Auto-countdown display (MM:SS format)
- Shows "Resend OTP" when timer expires
- Auto-resets timer on resend
- Customizable duration

---

## 📄 Pages Documentation

### 1. LoginPage

**Location:** `src/pages/LoginPage/LoginPage.jsx`

**Purpose:** Phone number entry and OTP request.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `onSuccess` | function | Called with phone number when Send OTP clicked |

**Usage:**
```jsx
import LoginPage from './pages/LoginPage';

<LoginPage 
  onSuccess={(phone) => {
    setPhoneNumber(phone);
    setCurrentPage('otp');
  }}
/>
```

**Components Used:**
- Typography (heading, link)
- Logo
- Input
- Button

---

### 2. OTPPage

**Location:** `src/pages/OTPPage/OTPPage.jsx`

**Purpose:** OTP verification with timer.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `phoneNumber` | string | Phone number for context |
| `onSuccess` | function | Called when OTP verified successfully |
| `onBack` | function | Called to navigate back to login |

**Usage:**
```jsx
import OTPPage from './pages/OTPPage';

<OTPPage 
  phoneNumber={phoneNumber}
  onBack={() => setCurrentPage('login')}
  onSuccess={() => console.log('OTP Verified!')}
/>
```

**Components Used:**
- Typography (heading)
- Logo
- OTPInput
- Button
- Timer

---

## 🎨 Design Specifications

### Colors (Tailwind Config)

```javascript
colors: {
  'label-gray': '#999',
  'input-bg': 'rgba(4, 251, 206, 0.10)',
  'input-border': 'rgba(221, 219, 219, 0.20)',
  'input-focus': 'rgba(4, 251, 206, 0.40)',
  'button-border': '#969696',
}
```

### Typography (Custom Font Sizes)

```javascript
fontSize: {
  'heading': ['20px', { lineHeight: '24px', fontWeight: '700' }],
  'body-large': ['20px', { lineHeight: '30px', fontWeight: '600', letterSpacing: '0.891px' }],
  'button': ['14px', { fontWeight: '600', letterSpacing: '0.28px' }],
  'label': ['12px', { lineHeight: '16px', fontWeight: '400' }],
  'link': ['10px', { fontWeight: '500', letterSpacing: '0.05px' }],
}
```

### Font Family

- **Primary Font:** Lato (imported from Google Fonts)
- **Weights Used:** 300, 400, 500, 600, 700, 900

### Spacing Standards

- **Gap between sections:** 32px (space-y-8)
- **Gap between form elements:** 24px (space-y-6)
- **Gap Input → Button:** 48px (space-y-12)
- **Gap Button → Timer:** 16px (space-y-4)

---

## 🔄 How to Reuse Components

### Example: Creating a Signup Page

```jsx
import { useState } from 'react';
import Input from './components/Input';
import Button from './components/Button';
import Typography from './components/Typography';
import Logo from './components/Logo';

function SignupPage({ onSuccess }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSignup = () => {
    setLoading(true);
    // API call here
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 2000);
  };

  return (
    <div className="max-w-md mx-auto space-y-8 p-8">
      <Logo size="lg" />
      
      <Typography variant="heading" align="center">
        Create Account
      </Typography>

      <div className="space-y-6">
        <Typography variant="heading" as="h2">
          Sign up
        </Typography>

        <div className="space-y-4">
          <Input
            label="First Name"
            type="text"
            placeholder="Enter first name"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            error={errors.firstName}
          />

          <Input
            label="Last Name"
            type="text"
            placeholder="Enter last name"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
          />

          <Input
            label="Email"
            type="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            error={errors.email}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            error={errors.password}
          />

          <Button loading={loading} onClick={handleSignup}>
            Sign Up
          </Button>
        </div>
      </div>

      <Typography variant="link" align="center">
        Already have an account? <span className="underline">Login</span>
      </Typography>
    </div>
  );
}

export default SignupPage;
```

---

## 🛠️ Development Workflow

### Current Page Switching Logic (App.js)

```jsx
function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [phoneNumber, setPhoneNumber] = useState('');

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {currentPage === 'login' && (
        <LoginPage 
          onSuccess={(phone) => {
            setPhoneNumber(phone);
            setCurrentPage('otp');
          }}
        />
      )}

      {currentPage === 'otp' && (
        <OTPPage 
          phoneNumber={phoneNumber}
          onBack={() => setCurrentPage('login')}
          onSuccess={() => console.log('OTP Verified!')}
        />
      )}
    </div>
  );
}
```

### Adding React Router (Future Enhancement)

```bash
npm install react-router-dom
```

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-cover bg-center" 
           style={{ backgroundImage: `url(${bgImage})` }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/otp" element={<OTPPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
```

---

## 📝 Next Steps

### Immediate Tasks:
- [ ] Test Login → OTP flow thoroughly
- [ ] Add form validation (phone number format)
- [ ] Add error handling for API failures
- [ ] Implement actual API integration

### Future Enhancements:
- [ ] Add Signup page (matching Figma design)
- [ ] Add Onboarding/Splash screen with "Get started" button
- [ ] Add React Router for proper navigation
- [ ] Add Context API or Redux for global state
- [ ] Add form validation library (React Hook Form + Yup)
- [ ] Add loading states and animations
- [ ] Add unit tests for components
- [ ] Add accessibility improvements (ARIA labels)
- [ ] Add error boundary component
- [ ] Add 404 page

### Recommended Packages:
```bash
# Routing
npm install react-router-dom

# Form validation
npm install react-hook-form yup @hookform/resolvers

# State management
npm install zustand
# or
npm install @reduxjs/toolkit react-redux

# API calls
npm install axios

# Animations
npm install framer-motion
```

---

## 🎯 Key Achievements

✅ **Component Architecture:** Fully reusable atomic components  
✅ **Design Implementation:** Pixel-perfect Figma specs  
✅ **Mobile-First:** Responsive design prioritizing mobile  
✅ **Type Safety:** PropTypes validation on all components  
✅ **Code Organization:** Clean separation of concerns (components/pages)  
✅ **Tailwind Integration:** Custom theme matching design system  
✅ **User Experience:** Auto-focus, keyboard navigation, timer, paste support  

---

## 📞 Support & Resources

- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **React Docs:** https://react.dev
- **Lato Font:** https://fonts.google.com/specimen/Lato

---

**Last Updated:** January 27, 2026  
**Version:** 1.0.0  
**Status:** Login & OTP pages complete ✅
