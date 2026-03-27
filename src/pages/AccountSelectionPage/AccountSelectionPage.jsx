import React, { useEffect, useMemo, useState } from 'react';
import Logo from '../../components/Logo';
import GetStartedArrow from '../../components/GetStartedArrow';
import metfluxLogo from '../../images/metflux_logo.svg';
import maleAvatar from '../../images/male-avatar.png';
import femaleAvatar from '../../images/female-avatar.png';
import './AccountSelectionPage.css';

const AccountSelectionPage = ({
  accounts = [],
  onSelectAccount,
  onGetStarted,
  selectedAccountId = null,
  currentUserId = null,
}) => {
  const initialSelectedId = useMemo(() => {
    if (selectedAccountId) {
      return selectedAccountId;
    }

    if (currentUserId) {
      return currentUserId;
    }

    const primaryAccount = accounts.find((account) => account?.isPrimary);
    if (primaryAccount?.id) {
      return primaryAccount.id;
    }

    return accounts[0]?.id || null;
  }, [accounts, selectedAccountId, currentUserId]);

  const [activeAccountId, setActiveAccountId] = useState(initialSelectedId);

  useEffect(() => {
    setActiveAccountId(initialSelectedId);
  }, [initialSelectedId]);

  useEffect(() => {
    if (!activeAccountId) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      onGetStarted(activeAccountId);
    }, 13000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activeAccountId, onGetStarted]);

  const getAvatarByGender = (genderValue) => {
    const normalized = String(genderValue || '').trim().toLowerCase();
    return normalized.startsWith('f') ? femaleAvatar : maleAvatar;
  };

  const handleAccountClick = (accountId) => {
    setActiveAccountId(accountId);
    onSelectAccount(accountId);
  };

  const handleGetStartedClick = () => {
    if (!activeAccountId) {
      return;
    }

    onGetStarted(activeAccountId);
  };

  return (
    <div className="account-selection-page">
      <div className="account-selection-logo-wrap">
        <Logo size="lg" />
      </div>

      <div className="account-selection-block">
        <h1 className="account-selection-title">Choose Account</h1>

        {accounts.map((account) => {
          const isActive = account.id === activeAccountId;
          const avatarSrc = getAvatarByGender(account.gender);

          return (
            <button
              key={account.id}
              className={`account-selection-card${isActive ? ' is-active' : ''}`}
              onClick={() => handleAccountClick(account.id)}
              type="button"
            >
              <span className="account-selection-avatar" aria-hidden="true">
                <img src={avatarSrc} alt="" />
              </span>
              <span className="account-selection-copy">
                <span className="account-selection-name">{account.name}</span>
                <span className="account-selection-role">{account.relationshipLabel}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="account-selection-bottom">
        <p className="account-selection-message">A few minutes&apos; pause before the health insights unfold.</p>

        <button className="account-selection-get-started" onClick={handleGetStartedClick} type="button">
          Get started
          <span className="account-selection-arrows" aria-hidden="true">
            <GetStartedArrow opacity="100" />
            <GetStartedArrow opacity="80" />
            <GetStartedArrow opacity="60" />
          </span>
        </button>

        <div className="account-selection-powered">
          <span className="account-selection-powered-text">Powered by</span>
          <img
            src={metfluxLogo}
            alt="MetFlux Research"
            className="account-selection-powered-logo"
          />
        </div>
      </div>
    </div>
  );
};

export default AccountSelectionPage;
