import React from 'react';
import Typography from '../../components/Typography';
import Logo from '../../components/Logo';
import GetStartedArrow from '../../components/GetStartedArrow';
import metfluxLogo from '../../images/metflux_logo.svg';
import './HealthInsightsPage.css';

/**
 * HealthInsightsPage - Welcome screen shown after OTP verification
 * 
 * Props:
 * - onGetStarted: Called when Get Started button is clicked
 * - userName: User's first name to display in welcome message
 */
const HealthInsightsPage = ({ onGetStarted, userName = 'User' }) => {
  return (
    <div className="health-insights-page">
      {/* Background image */}
      <div className="health-insights-bg" />

      {/* Header: Logo */}
      <div className="max-w-md mx-auto space-y-8 px-8 pt-[75px] pb-8 relative z-10">
        <Logo size="lg" />
      </div>

      {/* Center Content: Text */}
      <div className="health-insights-center">
        <div className="health-insights-text">
          <Typography 
            align="center"
            className="health-insights-welcome"
          >
            Welcome {userName}!
          </Typography>
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

      <div className="health-insights-powered">
        <span className="health-insights-powered-text">Powered by</span>
        <img
          src={metfluxLogo}
          alt="MetFlux Research"
          className="health-insights-powered-logo"
        />
      </div>
    </div>
  );
};

export default HealthInsightsPage;
