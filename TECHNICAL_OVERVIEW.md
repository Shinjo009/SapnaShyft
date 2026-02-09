# Technical Overview - React Login App

## 📋 Project Summary
A **React health insights platform** with pixel-perfect Figma implementation. Currently built: Login page, OTP verification, and Signup page. Mobile-first design using Tailwind CSS.

---

## 📁 Folder Structure

```
src/
├── App.js                          # Main app component (page switcher)
├── App.css                         # App styles
├── index.js                        # React entry point
├── components/                     # Reusable atomic components
│   ├── Button/
│   │   ├── Button.jsx             # Gradient button with loading state
│   │   ├── Button.module.css      
│   │   ├── Button.test.jsx
│   │   └── index.js
│   ├── Input/
│   │   ├── Input.jsx              # Text input field
│   │   └── index.js
│   ├── Select/
│   │   ├── Select.jsx             # Dropdown/select field
│   │   └── index.js
│   ├── Card/
│   │   └── Card.jsx
│   ├── Header/
│   │   └── Header.jsx
│   ├── Logo/
│   │   ├── Logo.jsx               # SVG logo with size variants
│   │   └── index.js
│   ├── OTPInput/
│   │   ├── OTPInput.jsx           # 6-digit OTP input
│   │   └── index.js
│   ├── Timer/
│   │   ├── Timer.jsx              # Countdown timer
│   │   └── index.js
│   └── Typography/
│       ├── Typography.jsx         # All text styles
│       └── index.js
├── pages/                          # Full page components
│   ├── LoginPage/
│   │   ├── LoginPage.jsx          # Phone number entry
│   │   └── index.js
│   ├── OTPPage/
│   │   ├── OTPPage.jsx            # 6-digit verification with timer
│   │   └── index.js
│   └── SignupPage/
│       ├── SignupPage.jsx         # Full registration form
│       └── index.js
├── hooks/
│   └── index.js                   # Custom React hooks
├── images/
│   ├── BG-1.png                   # Background image
│   ├── logo.svg                   # Logo SVG
│   └── Gender-Arrow.svg           # Dropdown arrow icon
└── utils/
    └── index.js                   # Utility functions

tailwind.config.js                 # Custom Tailwind theme
postcss.config.js                  # PostCSS configuration
package.json                       # Dependencies
```

---

## 🏗️ Architecture & Design Patterns

### **Atomic Design System**
Components are built following atomic design principles:
- **Atoms** (smallest): Typography, Input, Button, Logo, OTPInput, Select, Timer
- **Molecules** (combined atoms): Input groups, OTP sections
- **Organisms** (full features): LoginPage, OTPPage, SignupPage
- **Pages**: Full application screens

**Benefits:**
- ✅ Highly reusable components
- ✅ Consistent styling across the app
- ✅ Easy to maintain and update
- ✅ Scales well for feature additions

### **Page Switcher Pattern (No Routing)**
Instead of React Router, using a simple state-based page switcher in `App.js`:

```javascript
const [currentPage, setCurrentPage] = useState('login');

{currentPage === 'login' && <LoginPage onSuccess={...} />}
{currentPage === 'signup' && <SignupPage onSuccess={...} />}
{currentPage === 'otp' && <OTPPage phoneNumber={...} />}
```

**Why this approach:**
- Simple for small apps
- Easy to understand flow
- Can upgrade to React Router later
- Full state control

---

## 🎯 Current Features

### **1. LoginPage**
**Purpose:** User login with phone number verification

**Features:**
- Phone number input (numbers only)
- "Send OTP" button
- "Signup" link navigation
- Navigation to OTPPage with phone number

**Flow:**
```
User enters phone → Click "Send OTP" → Navigate to OTPPage
                                    ↓
                        "Log in" link → Back to LoginPage
```

### **2. SignupPage**
**Purpose:** Full user registration

**Features:**
- First Name input
- Last Name input
- Email input
- Phone Number input (numbers only)
- Gender dropdown (Male/Female/Other)
- Date of Birth dropdown (years 18-100)
- "Send OTP" button
- "Log in" link to return to LoginPage

**Form Validation:**
All fields must be filled before "Send OTP" works

**Flow:**
```
Fill form → Click "Send OTP" → Navigate to OTPPage with signup data
                            ↓
              "Log in" link → Back to LoginPage
```

### **3. OTPPage**
**Purpose:** Verify 6-digit OTP code

**Features:**
- 6-digit OTP input (auto-focus between boxes)
- 30-second countdown timer
- "Resend OTP" button (appears when timer expires)
- "Verify OTP" button
- Back button to return to previous page

**Flow:**
```
Enter 6 digits → Click "Verify OTP" → Console logs "OTP Verified!"
              ↓
   Timer counts down 30 seconds
              ↓
   "Resend OTP" button appears when timer reaches 00:00
```

---

## 🧩 Component Details

### **Input Component**
```jsx
<Input
  type="email"
  placeholder="Email Address"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={emailError}
/>
```
- Support for all input types (text, email, tel, password)
- Error message display
- Tailwind styled with custom colors
- Placeholder in gray (#999)

### **Select Component**
```jsx
<Select
  placeholder="Select Gender"
  value={gender}
  onChange={handleChange}
  options={[
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' }
  ]}
/>
```
- Styled dropdown matching Input appearance
- Custom arrow icon (Gender-Arrow.svg)
- Placeholder in gray, selected text in white
- Dark background for dropdown options

### **Button Component**
```jsx
<Button onClick={handleClick} loading={isLoading}>
  Send OTP
</Button>
```
- Gradient background (teal to cyan)
- Loading state with disabled appearance
- Full width by default
- Tailwind styled

### **Typography Component**
```jsx
<Typography variant="heading" align="center">
  Welcome to
</Typography>
```
**Variants:**
- `heading` - 20px/700 weight
- `bodyLarge` - 20px/600 weight
- `button` - 14px/600 weight
- `label` - 12px/400 weight (gray text)
- `link` - 10px/500 weight

### **OTPInput Component**
- 6 separate input boxes
- Auto-focus to next box when digit entered
- Keyboard navigation
- Paste support (splits pasted code)

### **Timer Component**
- 30-second countdown
- MM:SS format
- "Resend OTP" button appears at 00:00
- Customizable initial time

### **Logo Component**
- SVG logo with size variants (sm, md, lg, xl)
- Scales responsively

---

## 🎨 Design System

### **Custom Tailwind Theme**
Located in `tailwind.config.js`:

#### **Colors**
```
bg-input-bg          → rgba(4, 251, 206, 0.10)
border-input-border  → rgba(221, 219, 219, 0.20)
border-input-focus   → rgba(4, 251, 206, 0.40)
text-label-gray      → #999
```

#### **Typography Classes**
```
text-heading         → 20px/700 weight/24px line-height
text-body-large      → 20px/600 weight/30px line-height
text-button          → 14px/600 weight
text-label           → 12px/400 weight
text-link            → 10px/500 weight
font-lato            → Lato font family
```

#### **Spacing Standards**
```
space-y-8            → 32px gap (section spacing)
space-y-6            → 24px gap (form fields)
space-y-12           → 48px gap (input to button)
space-y-4            → 16px gap (button to footer)
```

### **Background**
- Mobile-first design (max-w-md container)
- BG-1.png as full-height background
- Dark theme with teal/cyan accent colors

---

## 📊 Data Flow

### **Login Flow**
```
LoginPage (phone input)
    ↓ onSuccess(phone)
App.js (sets phoneNumber state)
    ↓ setCurrentPage('otp')
OTPPage (receives phoneNumber)
    ↓ onSuccess()
Console log "OTP Verified!"
```

### **Signup Flow**
```
SignupPage (form inputs)
    ↓ onSuccess(formData)
App.js (sets signupData state)
    ↓ setCurrentPage('otp')
OTPPage (receives phoneNumber from signup data)
    ↓ onSuccess()
Console log "OTP Verified!"
```

### **Navigation**
```
All pages receive callback functions:
- onSuccess: Navigate forward
- onLogin/onBack: Navigate backward
- App.js manages page state and passes callbacks
```

---

## 🔧 Key Implementation Details

### **Phone Number Filtering**
```javascript
const value = e.target.value.replace(/[^0-9]/g, '');
// Only allows digits, removes all letters and special characters
```
Applied in:
- LoginPage (phone input)
- SignupPage (phone input)

### **Form Validation**
```javascript
const { firstName, lastName, email, phone, gender, dateOfBirth } = formData;
if (firstName.trim() && lastName.trim() && email.trim() && 
    phone.trim() && gender && dateOfBirth) {
  // All fields filled, enable Send OTP
}
```

### **Dynamic Styling in Select**
```javascript
<style>{`
  select {
    color: ${value ? 'white' : '#999'};
  }
`}</style>
```
- Changes text color based on whether value is selected
- Gray when empty, white when filled

---

## 🚀 State Management

### **App.js State**
```javascript
const [currentPage, setCurrentPage] = useState('login');
const [phoneNumber, setPhoneNumber] = useState('');
const [signupData, setSignupData] = useState(null);
```

### **LoginPage State**
```javascript
const [phoneNumber, setPhoneNumber] = useState('');
```

### **SignupPage State**
```javascript
const [formData, setFormData] = useState({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  gender: '',
  dateOfBirth: '',
});
```

### **OTPPage State**
```javascript
const [otp, setOtp] = useState(Array(6).fill(''));
const [timeLeft, setTimeLeft] = useState(30);
```

---

## 📱 Responsive Design

- **Mobile-first approach**: All designs optimized for mobile
- **Max-width container**: max-w-md (28rem = 448px)
- **Centered layout**: mx-auto centers content
- **Full padding**: p-8 (32px) padding on all sides
- **Scalable components**: All components work at any screen size

---

## 🔄 Component Reusability

### **Input Component Used In:**
- LoginPage (phone)
- SignupPage (firstName, lastName, email, phone)

### **Button Component Used In:**
- LoginPage (Send OTP)
- SignupPage (Send OTP)
- OTPPage (Verify OTP, Resend OTP)

### **Typography Component Used In:**
- All pages (headings, labels, links)

### **Select Component Used In:**
- SignupPage (gender, date of birth)

---

## 🔗 Import Patterns

**From App.js (root level):**
```javascript
import Input from './components/Input';
import Button from './components/Button';
import Logo from './components/Logo';
```

**From Pages (nested level):**
```javascript
import Input from '../../components/Input';
import Button from '../../components/Button';
import Select from '../../components/Select';
import Logo from '../../components/Logo';
```

**Images:**
```javascript
import bgImage from './images/BG-1.png';
import GenderArrow from '../../images/Gender-Arrow.svg';
```

---

## 🧪 Testing the App

### **Start the app:**
```bash
npm start
```

### **Test flows:**

**Login Flow:**
1. Homepage shows LoginPage
2. Enter phone number (only digits)
3. Click "Send OTP" → Goes to OTPPage
4. Enter 6 digits → Timer counts down
5. Click "Verify OTP" → Console logs "OTP Verified!"

**Signup Flow:**
1. From LoginPage, click "Signup"
2. Fill all form fields
3. Click "Send OTP" → Goes to OTPPage
4. Complete OTP verification

**Back Navigation:**
1. From any page, click "Log in" → Returns to LoginPage

---

## ✅ What's Been Built

| Component | Status | Features |
|-----------|--------|----------|
| Input | ✅ Complete | All input types, error states, label |
| Button | ✅ Complete | Gradient, loading state, disabled |
| Select | ✅ Complete | Dropdown, custom arrow, styled options |
| Typography | ✅ Complete | 5 variants (heading, body, button, label, link) |
| OTPInput | ✅ Complete | 6-digit input, auto-focus, paste |
| Timer | ✅ Complete | 30s countdown, resend button |
| Logo | ✅ Complete | SVG, size variants |
| LoginPage | ✅ Complete | Phone input, navigation |
| OTPPage | ✅ Complete | OTP verification, timer, navigation |
| SignupPage | ✅ Complete | Full form, dropdowns, validation |

---

## 🎯 Next Steps (When Ready)

1. **Backend Integration (FastAPI)**
   - Create API utility file (`src/utils/api.js`)
   - Replace console.log with actual API calls
   - Add loading states to buttons
   - Handle error responses

2. **API Endpoints Needed:**
   - `POST /auth/send-otp` - Send OTP to phone
   - `POST /auth/verify-otp` - Verify OTP code
   - `POST /auth/signup` - Register new user
   - `POST /auth/login` - Login user

3. **Authentication**
   - Store JWT token from backend
   - Add token to all future requests
   - Implement logout functionality

4. **Additional Screens**
   - Onboarding/splash screen
   - Dashboard
   - Profile management

---

## 💡 Code Quality Standards

✅ **What's being followed:**
- Functional components with React hooks
- PropTypes validation on all components
- Clean separation of concerns
- Reusable atomic components
- Consistent naming conventions
- Proper import/export structure
- Comments on complex logic

✅ **Best Practices:**
- No hard-coded values (use config/constants)
- Responsive design first
- Accessibility considerations (labels, alt text)
- Performance optimized (no unnecessary re-renders)
- Error handling structure in place

---

## 📝 Summary for Senior

**What has been accomplished:**

1. ✅ Complete atomic component library built and styled
2. ✅ Three full pages implemented (Login, Signup, OTP)
3. ✅ Navigation system with callback-based page switching
4. ✅ Mobile-first responsive design matching Figma specs
5. ✅ Custom Tailwind theme with brand colors
6. ✅ Form validation and input filtering
7. ✅ Timer functionality with countdown
8. ✅ Clean, maintainable code structure

**Architecture Highlights:**
- Atomic design for maximum reusability
- State management handled cleanly in App.js
- No external routing library (simple state-based)
- Tailwind CSS for consistent styling
- Ready for backend integration

**Ready For:**
- FastAPI backend integration
- Additional pages/features
- Testing and deployment
- Future scaling and maintenance

