
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useState } from "react";
import LoginPage from "./pages/LoginPage/LoginPage";
import SignupPage from "./pages/SignupPage/SignupPage";
import OTPPage from "./pages/OTPPage/OTPPage";
import HealthAssessment from "./pages/HealthAssessment";
import HomePage from "./pages/HomePage/HomePage";
import NotFound from "./pages/NotFound";

const App = () => {
  const [phone, setPhone] = useState("");
  const [signupData, setSignupData] = useState(null);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <LoginPage 
            onSuccess={phone => {
              setPhone(phone);
              window.location.href = "/otp";
            }}
            onSignup={() => window.location.href = "/signup"}
          />
        } />
        <Route path="/signup" element={
          <SignupPage 
            onSuccess={data => {
              setSignupData(data);
              setPhone(data.phone);
              window.location.href = "/otp";
            }}
            onLogin={() => window.location.href = "/"}
          />
        } />
        <Route path="/otp" element={
          <OTPPage 
            phone={phone}
            onSuccess={() => window.location.href = "/assessment"}
            onBack={() => window.location.href = "/"}
          />
        } />
        <Route path="/assessment" element={<HealthAssessment />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
