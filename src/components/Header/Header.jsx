import React from 'react';

const Header = ({ title, subtitle, ...props }) => {
  return (
    <header className="header" {...props}>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </header>
  );
};

export default Header;
