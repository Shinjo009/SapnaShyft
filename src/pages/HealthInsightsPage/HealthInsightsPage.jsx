import React from 'react';
import Typography from '../../components/Typography';
import Logo from '../../components/Logo';
import GetStartedArrow from '../../components/GetStartedArrow';
import './HealthInsightsPage.css';

/**
 * HealthInsightsPage - Welcome screen shown after OTP verification
 * 
 * Props:
 * - onGetStarted: Called when Get Started button is clicked
 */
const HealthInsightsPage = ({ onGetStarted }) => {
  return (
    <div className="health-insights-page">
      {/* Background image */}
      <div className="health-insights-bg" />

      {/* Header: Welcome to + Logo */}
      <div className="max-w-md mx-auto space-y-8 p-8 relative z-10">
        <Typography variant="heading" align="center">
          Welcome to
        </Typography>

        <Logo size="lg" />
      </div>

      {/* Center Content: Text */}
      <div className="health-insights-center">
        <div className="health-insights-text">
          <Typography 
            variant="bodyLarge" 
            align="center"
            className="health-insights-message"
          >
            A few minutes' pause before the health insights unfold.
          </Typography>
        </div>
      </div>

      {/* Bottom: Get Started Button */}
      <div className="health-insights-button-wrapper">
        <div className="p-8 relative z-10 w-full flex justify-center">
          <button 
            className="get-started-button"
            onClick={onGetStarted}
          >
            Get started
            <div className="arrows-container">
              <GetStartedArrow opacity="100" />
              <GetStartedArrow opacity="80" />
              <GetStartedArrow opacity="60" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HealthInsightsPage;
