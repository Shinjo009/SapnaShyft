# Components Documentation

Complete guide to all reusable components in the Health Insights App with import paths and usage examples.

---

## Table of Contents

1. [CircularProgressCard](#circularprogesscard)
2. [HealthParametersSection](#healthparameterssection)
3. [Header](#header)
4. [MetabolicAgeCard](#metabolicagecard)
5. [NavBar](#navbar)
6. [HomePage](#homepage)

---

## CircularProgressCard

### Overview
A reusable circular progress indicator component with animated tick marks, glowing effects, and customizable percentage display. Features a neumorphic design with radial gradient fill.

### Import Path
```javascript
import CircularProgressCard from 'src/pages/HomePage/components/CircularProgressCard';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `percentage` | number | 75 | The percentage value to display (0-100) |
| `label` | string | 'Score' | Label text displayed below the card |

### Usage Example

```jsx
import CircularProgressCard from 'src/pages/HomePage/components/CircularProgressCard';

export default function Example() {
  return (
    <div>
      <CircularProgressCard 
        percentage={85} 
        label="Lifestyle score" 
      />
      
      <CircularProgressCard 
        percentage={72} 
        label="Nutrition score" 
      />
      
      <CircularProgressCard 
        percentage={90} 
        label="Fitness score" 
      />
    </div>
  );
}
```

### Component Code

**File:** `src/pages/HomePage/components/CircularProgressCard/CircularProgressCard.jsx`

```jsx
import React from 'react';
import './CircularProgressCard.css';

/**
 * CircularProgressCard Component - Reusable circular progress card
 * 
 * Props:
 * - percentage: The percentage value to display (e.g., 75)
 * - label: Label text below the card (e.g., "Lifestyle score")
 */
const CircularProgressCard = ({ percentage = 75, label = 'Score' }) => {
  return (
    <div className="circular-progress-card">
      <div className="circular-progress-card__glow"></div>
      <div className="circular-progress-card__container">
        <svg 
          className="circular-progress-card__svg"
          viewBox="0 0 70 46"
          width="73.492"
          height="46.5"
        >
          <defs>
            <radialGradient id={`arcGradient-${label}`} cx="21.9%" cy="-3.93%" r="120.37%">
              <stop offset="0%" stopColor="#FFD6C7" />
              <stop offset="23.78%" stopColor="#FDD4C6" />
              <stop offset="100%" stopColor="#19252C" />
            </radialGradient>
          </defs>
          <path
            d="M8.52734 40.3135C8.81772 40.2357 9.11648 40.4079 9.19434 40.6982C9.27212 40.9885 9.09979 41.2873 8.80957 41.3652L3.28809 42.8447C2.99777 42.9225 2.69903 42.7502 2.62109 42.46C2.54331 42.1697 2.71563 41.8709 3.00586 41.793L8.52734 40.3135ZM60.3418 40.3135L65.8623 41.793C66.1527 41.8708 66.3259 42.1696 66.248 42.46C66.1702 42.7503 65.8714 42.9225 65.5811 42.8447L60.0596 41.3652C59.7692 41.2874 59.597 40.9886 59.6748 40.6982C59.7528 40.4081 60.0515 40.2357 60.3418 40.3135ZM7.91699 36.8779C8.21495 36.8389 8.48811 37.0487 8.52734 37.3467C8.56636 37.6446 8.35655 37.9178 8.05859 37.957L2.3916 38.7031C2.09353 38.7424 1.82049 38.5324 1.78125 38.2344C1.74204 37.9363 1.95194 37.6633 2.25 37.624L7.91699 36.8779ZM60.9521 36.877L66.6191 37.623C66.9172 37.6623 67.1271 37.9363 67.0879 38.2344C67.0486 38.5323 66.7755 38.7422 66.4775 38.7031L60.8105 37.957C60.5125 37.9178 60.3026 37.6438 60.3418 37.3457C60.3812 37.0479 60.6543 36.8378 60.9521 36.877ZM7.75977 33.3906C8.06042 33.3906 8.30469 33.6349 8.30469 33.9355C8.30456 34.2361 8.06034 34.4795 7.75977 34.4795H2.04395C1.74348 34.4794 1.50013 34.236 1.5 33.9355C1.5 33.635 1.7434 33.3908 2.04395 33.3906H7.75977ZM66.8262 33.3906C67.1268 33.3906 67.3711 33.6349 67.3711 33.9355C67.371 34.2361 67.1267 34.4795 66.8262 34.4795H61.1104C60.8098 34.4795 60.5656 34.2361 60.5654 33.9355C60.5654 33.6349 60.8097 33.3906 61.1104 33.3906H66.8262ZM2.39258 29.168L8.05957 29.9141C8.35765 29.9533 8.56756 30.2273 8.52832 30.5254C8.48903 30.8232 8.21583 31.0331 7.91797 30.9941L2.25 30.248C1.95212 30.2086 1.743 29.9347 1.78223 29.6367C1.82165 29.3388 2.09463 29.1287 2.39258 29.168ZM66.4775 29.168C66.7756 29.1287 67.0496 29.3386 67.0889 29.6367C67.1279 29.9346 66.918 30.2077 66.6201 30.2471L60.9531 30.9932C60.655 31.0324 60.381 30.8225 60.3418 30.5244C60.3027 30.2265 60.5127 29.9534 60.8105 29.9141L66.4775 29.168ZM3.28906 25.0264L8.81055 26.5059C9.10077 26.5837 9.27286 26.8816 9.19531 27.1719C9.1175 27.4623 8.81873 27.6354 8.52832 27.5576L3.00781 26.0781C2.71744 26.0003 2.54434 25.7015 2.62207 25.4111C2.69987 25.1208 2.9987 24.9487 3.28906 25.0264ZM65.5811 25.0264C65.8713 24.9486 66.1701 25.121 66.248 25.4111C66.3258 25.7014 66.1534 26.0001 65.8633 26.0781L60.3418 27.5576C60.0514 27.6354 59.7526 27.4633 59.6748 27.1729C59.597 26.8825 59.7693 26.5837 60.0596 26.5059L65.5811 25.0264ZM4.00684 21.332C4.12189 21.0543 4.44098 20.9221 4.71875 21.0371L9.99902 23.2246C10.2767 23.3396 10.4088 23.6578 10.2939 23.9355C10.1789 24.2133 9.86074 24.3454 9.58301 24.2305L4.30176 22.043C4.0242 21.9279 3.89202 21.6097 4.00684 21.332ZM64.1523 21.0371C64.43 20.9223 64.7483 21.0544 64.8633 21.332C64.9781 21.6097 64.846 21.928 64.5684 22.043L59.2881 24.2305C59.0103 24.3455 58.6912 24.2133 58.5762 23.9355C58.4613 23.6578 58.5934 23.3396 58.8711 23.2246L64.1523 21.0371ZM5.91211 17.4678C6.0625 17.2077 6.39505 17.1184 6.65527 17.2686L11.6055 20.127C11.8658 20.2772 11.9549 20.6098 11.8047 20.8701C11.6544 21.1305 11.3219 21.2196 11.0615 21.0693L6.11133 18.2119C5.85095 18.0616 5.76178 17.7281 5.91211 17.4678ZM62.2129 17.2686C62.4732 17.1182 62.8067 17.2074 62.957 17.4678C63.1074 17.7281 63.0182 18.0616 62.7578 18.2119L57.8076 21.0693C57.5472 21.2197 57.2138 21.1305 57.0635 20.8701C56.9135 20.6099 57.0027 20.2773 57.2627 20.127L62.2129 17.2686ZM8.30566 13.8857C8.48863 13.6474 8.82986 13.6024 9.06836 13.7852L13.6035 17.2646C13.842 17.4477 13.8871 17.7898 13.7041 18.0283C13.5211 18.2668 13.1789 18.3119 12.9404 18.1289L8.40625 14.6494C8.16773 14.4664 8.12264 14.1243 8.30566 13.8857ZM59.8008 13.7852C60.0393 13.6021 60.3814 13.6472 60.5645 13.8857C60.7475 14.1243 60.7024 14.4664 60.4639 14.6494L55.9287 18.1289C55.6902 18.3116 55.349 18.2666 55.166 18.0283C54.983 17.7898 55.0281 17.4477 55.2666 17.2646L59.8008 13.7852ZM11.1465 10.6475C11.3591 10.4349 11.7034 10.4349 11.916 10.6475L15.958 14.6885C16.1706 14.9011 16.1706 15.2464 15.958 15.459C15.7454 15.6715 15.4001 15.6716 15.1875 15.459L11.1465 11.417C10.9339 11.2044 10.9339 10.8601 11.1465 10.6475ZM56.9541 10.6475C57.1667 10.4349 57.511 10.4349 57.7236 10.6475C57.9362 10.8601 57.9362 11.2044 57.7236 11.417L53.6826 15.459C53.47 15.6716 53.1247 15.6716 52.9121 15.459C52.6997 15.2465 52.6998 14.9021 52.9121 14.6895L56.9541 10.6475ZM14.3848 7.80664C14.6233 7.62361 14.9654 7.6687 15.1484 7.90723L18.6279 12.4424C18.8107 12.6809 18.7658 13.0221 18.5273 13.2051C18.2888 13.3881 17.9477 13.3429 17.7646 13.1045L14.2842 8.57031C14.1012 8.33184 14.1464 7.9897 14.3848 7.80664ZM53.7207 7.90723C53.9037 7.6687 54.2458 7.62361 54.4844 7.80664C54.7228 7.98965 54.7678 8.33085 54.585 8.56934L51.1055 13.1045C50.9224 13.343 50.5803 13.3881 50.3418 13.2051C50.1033 13.022 50.0582 12.6799 50.2412 12.4414L53.7207 7.90723ZM50.1582 5.6123C50.3085 5.35193 50.642 5.26276 50.9023 5.41309C51.1623 5.56346 51.2515 5.89607 51.1016 6.15625L48.2432 11.1064C48.0929 11.3667 47.7603 11.4558 47.5 11.3057C47.2397 11.1554 47.1497 10.8228 47.2998 10.5625L50.1582 5.6123ZM17.9678 5.41309C18.2281 5.26276 18.5606 5.35193 18.7109 5.6123L21.5693 10.5625C21.7194 10.8228 21.6304 11.1554 21.3701 11.3057C21.1098 11.456 20.7773 11.3667 20.627 11.1064L17.7686 6.15625C17.6183 5.89594 17.7076 5.56347 17.9678 5.41309ZM21.8311 3.50781C22.1088 3.39277 22.4279 3.52405 22.543 3.80176L24.7305 9.08301C24.8453 9.36066 24.7131 9.67885 24.4355 9.79395C24.158 9.90893 23.8398 9.77741 23.7246 9.5L21.5371 4.21875C21.4221 3.94111 21.5536 3.62301 21.8311 3.50781ZM46.3271 3.80176C46.4422 3.52421 46.7605 3.39209 47.0381 3.50684C47.3159 3.62189 47.4481 3.94098 47.333 4.21875L45.1455 9.49902C45.0305 9.77673 44.7123 9.90886 44.4346 9.79395C44.1569 9.67892 44.0247 9.36073 44.1396 9.08301L46.3271 3.80176ZM25.9102 2.12305C26.2006 2.04524 26.4993 2.21741 26.5771 2.50781L28.0566 8.0293C28.1342 8.31958 27.9612 8.61753 27.6709 8.69531C27.3806 8.77296 27.0827 8.60087 27.0049 8.31055L25.5254 2.78906C25.4478 2.49877 25.6199 2.20083 25.9102 2.12305ZM42.959 2.12305C43.2492 2.20085 43.4213 2.49878 43.3438 2.78906L41.8643 8.31055C41.7865 8.60085 41.4885 8.77291 41.1982 8.69531C40.908 8.61753 40.735 8.31958 40.8125 8.0293L42.292 2.50781C42.3698 2.2174 42.6686 2.04523 42.959 2.12305ZM30.1367 1.28223C30.4346 1.24323 30.7077 1.45316 30.7471 1.75098L31.4932 7.41797C31.5324 7.71605 31.3225 7.99005 31.0244 8.0293C30.7264 8.06843 30.4534 7.85851 30.4141 7.56055L29.668 1.89355C29.6287 1.59547 29.8386 1.32147 30.1367 1.28223ZM38.7334 1.28223C39.0315 1.32147 39.2414 1.59547 39.2021 1.89355L38.4561 7.56055C38.4167 7.85833 38.1435 8.06823 37.8457 8.0293C37.5476 7.99005 37.3377 7.71605 37.377 7.41797L38.123 1.75098C38.1623 1.45299 38.4354 1.24303 38.7334 1.28223ZM34.4346 1C34.7352 1.00006 34.9785 1.2443 34.9785 1.54492V7.26074C34.9785 7.56136 34.7352 7.8056 34.4346 7.80566C34.1339 7.80566 33.8896 7.5614 33.8896 7.26074V1.54492C33.8896 1.24427 34.1339 1 34.4346 1Z"
            fill={`url(#arcGradient-${label})`}
            stroke="#607C82"
            strokeWidth="0.5"
            style={{ filter: 'drop-shadow(0.5px 1px 2px rgba(0, 0, 0, 0.25))' }}
          />
        </svg>
        <div className="circular-progress-card__content">
          <span className="circular-progress-card__percentage">{percentage}</span>
        </div>
      </div>
      <p className="circular-progress-card__label">{label}</p>
    </div>
  );
};

export default CircularProgressCard;
```

**File:** `src/pages/HomePage/components/CircularProgressCard/CircularProgressCard.css`

```css
.circular-progress-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  flex: 1;
}

.circular-progress-card__glow {
  position: absolute;
  top: calc(50% - 9px);
  left: 50%;
  transform: translate(-50%, -50%);
  width: 94px;
  height: 93px;
  aspect-ratio: 94.00 / 93.00;
  border-radius: 94px;
  background: radial-gradient(47.15% 47.15% at 50% 50%, #CFF7D3 0%, #CFF7D3 59.1%, rgba(255, 255, 255, 0.00) 100%);
  box-shadow: -28.5px 28.5px 57px 0 #151D26, 
              28.5px -28.5px 57px 0 rgba(165, 165, 165, 0.20), 
              28.5px 28.5px 71.5px 0 rgba(165, 165, 165, 0.20);
  z-index: 0;
  filter: blur(8px);
  opacity: 0.8;
  pointer-events: none;
}

.circular-progress-card__container {
  position: relative;
  width: 73.492px;
  height: 73.492px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 73.492px;
  background: #293837;
  box-shadow: -0.5px -0.5px 1px 0 rgba(61, 82, 104, 0.30), 
              0.5px 0.5px 1px 0 rgba(15, 20, 26, 0.50), 
              0.5px -0.5px 1px 0 rgba(15, 20, 26, 0.20) inset, 
              -0.5px 0.5px 1px 0 rgba(15, 20, 26, 0.20) inset, 
              0.5px 0.5px 1px 0 rgba(61, 82, 104, 0.90) inset, 
              -0.5px -0.5px 1.5px 0 rgba(15, 20, 26, 0.90) inset;
  z-index: 1;
}

.circular-progress-card__svg {
  position: absolute;
  top: 3px;
  left: 50%;
  transform: translateX(calc(-50% + 1px));
  width: 73.492px;
  height: 46.5px;
}

.circular-progress-card__content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.circular-progress-card__percentage {
  color: #E95D5C;
  text-align: center;
  font-family: "DM Sans", sans-serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 19.5px;
  margin: 0;
  padding: 0;
}

.circular-progress-card__label {
  color: #FFF;
  text-align: center;
  font-family: "DM Sans", sans-serif;
  font-size: 11px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  margin: 0;
  padding: 0;
  width: 100%;
}
```

---

## HealthParametersSection

### Overview
Container component that displays a collection of circular progress cards representing different health metrics. Includes a title, description, and a grid of `CircularProgressCard` components.

### Import Path
```javascript
import HealthParametersSection from 'src/pages/HomePage/components/HealthParametersSection';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | array | Default 3 items | Array of card objects with `percentage` and `label` properties |

### Usage Example

```jsx
import HealthParametersSection from 'src/pages/HomePage/components/HealthParametersSection';

export default function Example() {
  const healthData = [
    { percentage: 85, label: 'Lifestyle score' },
    { percentage: 72, label: 'Nutrition score' },
    { percentage: 90, label: 'Fitness score' }
  ];

  return <HealthParametersSection data={healthData} />;
}
```

### Component Code

**File:** `src/pages/HomePage/components/HealthParametersSection/HealthParametersSection.jsx`

```jsx
import React from 'react';
import './HealthParametersSection.css';
import CircularProgressCard from '../CircularProgressCard';

/**
 * HealthParametersSection Component - Displays health parameters with circular progress cards
 * 
 * Props:
 * - data: Array of card data [{percentage: 75, label: "Lifestyle score"}, ...]
 */
const HealthParametersSection = ({ data = [
  { percentage: 75, label: 'Lifestyle score' },
  { percentage: 75, label: 'Nutrition score' },
  { percentage: 75, label: 'Fitness score' }
]}) => {
  return (
    <section className="health-parameters">
      <div className="health-parameters__header">
        <h2 className="health-parameters__title">Health Parameters To Focus</h2>
        <a href="#" className="health-parameters__see-more">See more</a>
      </div>

      <div className="health-parameters__box">
        <div className="health-parameters__text-group">
          <p className="health-parameters__subheading">Health Scan Index</p>
          <p className="health-parameters__note">Tap the card to know more</p>
        </div>

        <div className="health-parameters__cards">
          {data.map((item, index) => (
            <CircularProgressCard 
              key={index}
              percentage={item.percentage}
              label={item.label}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HealthParametersSection;
```

**File:** `src/pages/HomePage/components/HealthParametersSection/HealthParametersSection.css`

```css
.health-parameters {
  position: absolute;
  top: 320px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  z-index: 40;
  padding: 0 16px;
  box-sizing: border-box;
}

.health-parameters__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.health-parameters__title {
  color: #FFF;
  font-family: Lato, sans-serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
  margin: 0;
  padding: 0;
}

.health-parameters__see-more {
  color: #C4C4C4;
  font-family: Lato, sans-serif;
  font-size: 11px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
  text-decoration: underline dotted;
  text-decoration-thickness: 0.55px;
  text-underline-offset: 2.75px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.health-parameters__see-more:hover {
  opacity: 0.8;
}

.health-parameters__box {
  display: flex;
  padding: 8px 16px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 16px;
  align-self: stretch;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}

.health-parameters__text-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  align-self: stretch;
}

.health-parameters__subheading {
  color: #FFF;
  text-align: left;
  font-family: Lato, sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
  margin: 0;
  padding: 0;
}

.health-parameters__note {
  color: #C4C4C4;
  text-align: left;
  font-family: "DM Sans", sans-serif;
  font-size: 11px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  margin: 0;
  padding: 0;
}

.health-parameters__cards {
  display: flex;
  gap: 3px;
  width: 100%;
  justify-content: space-between;
  align-items: center;
}
```

---

## Header

### Overview
Navigation header component displayed at the top of the page with a hamburger menu, greeting text, and search icon. Features interactive buttons with hover states.

### Import Path
```javascript
import Header from 'src/pages/HomePage/components/Header';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | string | 'User' | User's name displayed in the greeting |
| `onMenuClick` | function | undefined | Callback function when menu button is clicked |
| `onSearchClick` | function | undefined | Callback function when search button is clicked |

### Usage Example

```jsx
import Header from 'src/pages/HomePage/components/Header';

export default function Example() {
  const handleMenuClick = () => {
    console.log('Menu opened');
    // Open drawer/sidebar
  };

  const handleSearchClick = () => {
    console.log('Search opened');
    // Open search page
  };

  return (
    <Header 
      name="Neha" 
      onMenuClick={handleMenuClick}
      onSearchClick={handleSearchClick}
    />
  );
}
```

### Component Code

**File:** `src/pages/HomePage/components/Header/Header.jsx`

```jsx
import React from 'react';
import './Header.css';

/**
 * Header Component - HomePage header with greeting, menu, and search
 * 
 * Props:
 * - name: User name to display in greeting
 * - onMenuClick: Callback when hamburger menu is clicked
 * - onSearchClick: Callback when search icon is clicked
 */
const Header = ({ name = 'User', onMenuClick, onSearchClick }) => {
  return (
    <header className="header">
      <div className="header__container">
        {/* Hamburger Menu */}
        <button 
          className="header__menu-btn"
          onClick={onMenuClick}
          aria-label="Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.75 6H20.25M3.75 12H20.25M3.75 18H20.25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Greeting Text */}
        <h1 className="header__greeting">Hello {name}!</h1>

        {/* Search Icon */}
        <button 
          className="header__search-btn"
          onClick={onSearchClick}
          aria-label="Search"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.5 14H14.71L14.43 13.73C15.0549 13.0039 15.5117 12.1487 15.7675 11.2256C16.0234 10.3024 16.072 9.33413 15.91 8.38998C15.44 5.60998 13.12 3.38997 10.32 3.04997C9.33559 2.92544 8.33576 3.02775 7.397 3.34906C6.45824 3.67038 5.60542 4.20219 4.90381 4.90381C4.20219 5.60542 3.67038 6.45824 3.34906 7.397C3.02775 8.33576 2.92544 9.33559 3.04997 10.32C3.38997 13.12 5.60998 15.44 8.38998 15.91C9.33413 16.072 10.3024 16.0234 11.2256 15.7675C12.1487 15.5117 13.0039 15.0549 13.73 14.43L14 14.71V15.5L18.25 19.75C18.66 20.16 19.33 20.16 19.74 19.75C20.15 19.34 20.15 18.67 19.74 18.26L15.5 14ZM9.49997 14C7.00997 14 4.99997 11.99 4.99997 9.49997C4.99997 7.00997 7.00997 4.99997 9.49997 4.99997C11.99 4.99997 14 7.00997 14 9.49997C14 11.99 11.99 14 9.49997 14Z" fill="white"/>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
```

**File:** `src/pages/HomePage/components/Header/Header.css`

```css
.header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding-top: 44px;
  padding-left: 16px;
  padding-right: 16px;
  width: 100%;
  box-sizing: border-box;
  z-index: 100;
}

.header__container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.header__menu-btn {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s ease;
}

.header__menu-btn:hover {
  opacity: 0.8;
}

.header__greeting {
  flex: 1;
  text-align: center;
  color: #FFF;
  font-family: Lato;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  letter-spacing: 0.1px;
  margin: 0;
  padding: 0;
}

.header__search-btn {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s ease;
}

.header__search-btn:hover {
  opacity: 0.8;
}

.header__menu-btn:focus,
.header__search-btn:focus {
  outline: none;
}

.header__menu-btn:focus-visible,
.header__search-btn:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
  border-radius: 2px;
}
```

---

## MetabolicAgeCard

### Overview
Display card showing the user's metabolic age with supporting text. Simple, focused component for presenting a single key metric.

### Import Path
```javascript
import MetabolicAgeCard from 'src/pages/HomePage/components/MetabolicAgeCard';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `age` | number | 28 | User's metabolic age value |
| `label` | string | 'Metabolic age' | Label describing the metric |
| `detail` | string | '5 years older' | Additional detail about the metric |

### Usage Example

```jsx
import MetabolicAgeCard from 'src/pages/HomePage/components/MetabolicAgeCard';

export default function Example() {
  return (
    <MetabolicAgeCard 
      age={28}
      label="Metabolic age"
      detail="5 years older"
    />
  );
}
```

### Component Code

**File:** `src/pages/HomePage/components/MetabolicAgeCard/MetabolicAgeCard.jsx`

```jsx
import React from 'react';
import './MetabolicAgeCard.css';

/**
 * MetabolicAgeCard Component - Displays user's metabolic age
 * 
 * Props:
 * - age: Metabolic age value (e.g., 28)
 * - label: Description of metabolic age (e.g., "Metabolic age")
 * - detail: Additional detail (e.g., "5 years older")
 */
const MetabolicAgeCard = ({ age = 28, label = 'Metabolic age', detail = '5 years older' }) => {
  return (
    <div className="metabolic-card">
      <div className="metabolic-card__content">
        <h2 className="metabolic-card__age">{age}</h2>
        <p className="metabolic-card__label">{label}</p>
        <p className="metabolic-card__detail">{detail}</p>
      </div>
    </div>
  );
};

export default MetabolicAgeCard;
```

**File:** `src/pages/HomePage/components/MetabolicAgeCard/MetabolicAgeCard.css`

```css
.metabolic-card {
  position: absolute;
  top: 140px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  z-index: 50;
  padding: 0 16px;
  box-sizing: border-box;
}

.metabolic-card__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.metabolic-card__age {
  color: #FFF;
  text-align: center;
  font-family: Sora, sans-serif;
  font-size: 48px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  letter-spacing: 0.24px;
  margin: 0;
  padding: 0;
}

.metabolic-card__label {
  align-self: stretch;
  color: #FFF;
  text-align: center;
  font-family: Lato, sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
  margin: 0;
  padding: 0;
}

.metabolic-card__detail {
  align-self: stretch;
  color: #FFF;
  text-align: center;
  font-family: "DM Sans", sans-serif;
  font-size: 11px;
  font-style: normal;
  font-weight: 100;
  line-height: normal;
  margin: 0;
  padding: 0;
}
```

---

## NavBar

### Overview
Fixed bottom navigation bar with 4 items (Home, Super Sync, Super Club, Packages). Features active state tracking and navigation callbacks.

### Import Path
```javascript
import NavBar from 'src/components/NavBar';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultActive` | string | 'home' | The initially active nav item ID |
| `onNavigate` | function | undefined | Callback function when nav item is clicked (receives item id) |

### Usage Example

```jsx
import NavBar from 'src/components/NavBar';

export default function Example() {
  const handleNavigate = (itemId) => {
    console.log('Navigating to:', itemId);
    // Route to the appropriate page
  };

  return (
    <NavBar 
      defaultActive="home"
      onNavigate={handleNavigate}
    />
  );
}
```

### Component Code

**File:** `src/components/NavBar/NavBar.jsx`

```jsx
import React, { useState } from 'react';
import './NavBar.css';
import NavItem from './NavItem';
import homeIcon from '../../images/home.svg';
import superSyncIcon from '../../images/SuperSync.svg';
import superClubIcon from '../../images/SuperClub.svg';
import packagesIcon from '../../images/Packages.svg';

/**
 * NavBar Component - Bottom navigation bar with 4 items
 * 
 * Props:
 * - defaultActive: Initial active item (default: 'home')
 * - onNavigate: Callback when navigation item is clicked
 */
const NavBar = ({ defaultActive = 'home', onNavigate }) => {
  const [activeItem, setActiveItem] = useState(defaultActive);

  const navItems = [
    { id: 'home', label: 'Home', icon: homeIcon, width: '21.7px', height: '23.734px' },
    { id: 'super-sync', label: 'Super Sync', icon: superSyncIcon },
    { id: 'super-club', label: 'Super Club', icon: superClubIcon },
    { id: 'packages', label: 'Packages', icon: packagesIcon, width: '24.413px', height: '24.413px', flexShrink: 0 },
  ];

  const handleItemClick = (id) => {
    setActiveItem(id);
    if (onNavigate) {
      onNavigate(id);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar__container">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            id={item.id}
            label={item.label}
            icon={item.icon}
            isActive={activeItem === item.id}
            onClick={handleItemClick}
            width={item.width}
            height={item.height}
            flexShrink={item.flexShrink}
          />
        ))}
      </div>
    </nav>
  );
};

export default NavBar;
```

**File:** `src/components/NavBar/NavBar.css`

```css
.navbar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 360px;
  z-index: 1000;
}

.navbar__container {
  display: flex;
  width: 360px;
  padding: 8px 0;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-around;
  gap: 8px;
  background: linear-gradient(90deg, #451C23 0%, #0A3432 100%);
  box-shadow: 0 0 4px 0 rgba(255, 255, 255, 0.50);
}
```

---

## HomePage

### Overview
Main page container that integrates all major components including Header, MetabolicAgeCard, HealthParametersSection, NavBar, and background images. This is the primary entry point for the home screen.

### Import Path
```javascript
import HomePage from 'src/pages/HomePage';
```

### Props
None (standalone page component)

### Usage Example

```jsx
import HomePage from 'src/pages/HomePage';

export default function App() {
  return <HomePage />;
}
```

### Component Code

**File:** `src/pages/HomePage/HomePage.jsx`

```jsx
import React from 'react';
import './HomePage.css';
import bg1 from '../../images/HP-BG-1.png';
import bg2 from '../../images/HP-BG-1.png';
import Header from './components/Header';
import MetabolicAgeCard from './components/MetabolicAgeCard';
import HealthParametersSection from './components/HealthParametersSection';
import NavBar from '../../components/NavBar';

const HomePage = () => {
  const handleMenuClick = () => {
    console.log('Menu clicked');
  };

  const handleSearchClick = () => {
    console.log('Search clicked');
  };

  const handleNavigate = (itemId) => {
    console.log('Navigating to:', itemId);
    // Handle navigation logic here
  };

  return (
    <div className="home-page">
      {/* Header */}
      <Header 
        name="Neha" 
        onMenuClick={handleMenuClick}
        onSearchClick={handleSearchClick}
      />

      {/* Metabolic Age Card */}
      <MetabolicAgeCard 
        age={28}
        label="Metabolic age"
        detail="5 years older"
      />

      {/* Health Parameters Section */}
      <HealthParametersSection 
        data={[
          { percentage: 75, label: 'Lifestyle score' },
          { percentage: 75, label: 'Nutrition score' },
          { percentage: 75, label: 'Fitness score' }
        ]}
      />

      <div className="home-page__background">
        <img src={bg1} alt="" className="home-page__image" />
        <img src={bg2} alt="" className="home-page__image" />

        {/* Content will be added here */}
      </div>
      <NavBar defaultActive="home" onNavigate={handleNavigate} />
    </div>
  );
};

export default HomePage;
```

---

## Component Hierarchy

```
HomePage (Main Container)
├── Header
│   ├── Menu Button
│   ├── Greeting Text
│   └── Search Button
├── MetabolicAgeCard
│   └── Age Display
├── HealthParametersSection
│   ├── Section Title & Link
│   ├── Text Group
│   │   ├── "Health Scan Index"
│   │   └── "Tap the card to know more"
│   └── Cards Container
│       ├── CircularProgressCard (1)
│       ├── CircularProgressCard (2)
│       └── CircularProgressCard (3)
├── Background Images
└── NavBar
    ├── NavItem (Home)
    ├── NavItem (Super Sync)
    ├── NavItem (Super Club)
    └── NavItem (Packages)
```

---

## Styling Guidelines

### Color Palette
- **Primary Dark:** #293837
- **Accent Red:** #E95D5C
- **Text Primary:** #FFF (White)
- **Text Secondary:** #C4C4C4 (Gray)
- **Background:** rgba(255, 255, 255, 0.05)
- **Gradient Start:** #FFD6C7
- **Gradient Mid:** #FDD4C6
- **Gradient End:** #19252C

### Typography
- **Headers:** Lato (16px, 600 weight)
- **Body Text:** Lato (14px, 400 weight)
- **Small Text:** DM Sans (11px, 400 weight)
- **Large Numbers:** Sora (48px, 700 weight)
- **Percentage Values:** DM Sans (16px, 700 weight)

### Spacing Standards
- **Default Gap:** 8px
- **Padding:** 16px (outer), 8px (inner)
- **Component Gap:** 3px (between cards)
- **Section Spacing:** 12-16px

---

## Notes for Future Development

1. **Backend Integration:** All components are designed to accept dynamic data via props. Connect to backend APIs by replacing hardcoded data.

2. **Theme Support:** Consider extracting color palette to a centralized theme file for easy dark/light mode switching.

3. **Responsive Design:** Components are currently optimized for mobile (360px width). Consider adding tablet and desktop breakpoints.

4. **Accessibility:** Components use semantic HTML and ARIA labels. Ensure all interactive elements are keyboard accessible.

5. **Performance:** Consider memoizing CircularProgressCard when used in large lists.

---

**Last Updated:** February 3, 2026
