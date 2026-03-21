import React, { useState } from 'react';
import './NutritionPage.css';

/**
 * NutritionPage - Nutrition preferences and allergies
 */
const NutritionPage = ({ onBack }) => {
  const [selectedDiet, setSelectedDiet] = useState('Non-Veg');
  const [selectedAllergies, setSelectedAllergies] = useState(['Dairy', 'Corn']);
  const [otherAllergyInput, setOtherAllergyInput] = useState('');

  const dietOptions = ['Veg', 'Non-Veg', 'Vegan', 'Jain', 'Eggetarian', 'Keto'];
  const allergyOptions = ['Peanuts', 'Dairy', 'Eggs', 'Fish', 'Soy', 'Wheat', 'Sesame', 'Mustard', 'Corn', 'Other'];

  const toggleAllergy = (item) => {
    setSelectedAllergies((prev) => (
      prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item]
    ));
  };

  const isOtherSelected = selectedAllergies.includes('Other');

  const handleDone = () => {
    const value = otherAllergyInput.trim();

    if (value) {
      setSelectedAllergies((prev) => (prev.includes(value) ? prev : [...prev, value]));
      setOtherAllergyInput('');
    }

    onBack?.();
  };

  return (
    <div className="nutrition-page">
      <div className="nutrition-page__header">
        <button
          className="nutrition-page__back-btn"
          onClick={onBack}
          aria-label="Go back"
          type="button"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <h1 className="nutrition-page__title">Nutrition</h1>
      </div>

      <div className="nutrition-page__section nutrition-page__section--first">
        <h2 className="nutrition-page__section-title">Diet preferences</h2>

        <div className="nutrition-page__chip-grid nutrition-page__chip-grid--diet">
          {dietOptions.map((option) => {
            const isSelected = selectedDiet === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setSelectedDiet(option)}
                className={`nutrition-page__chip ${isSelected ? 'nutrition-page__chip--selected' : ''}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div className="nutrition-page__section nutrition-page__section--allergic">
        <h2 className="nutrition-page__section-title">Allergic To</h2>

        <div className="nutrition-page__chip-grid nutrition-page__chip-grid--allergy">
          {allergyOptions.map((option) => {
            const isSelected = selectedAllergies.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleAllergy(option)}
                className={`nutrition-page__chip ${option === 'Other' ? 'nutrition-page__chip--full' : ''} ${isSelected ? 'nutrition-page__chip--selected' : ''}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {isOtherSelected ? (
          <div className="nutrition-page__other-wrap">
            <input
              type="text"
              className="nutrition-page__other-input"
              placeholder="Enter allergy"
              value={otherAllergyInput}
              onChange={(e) => setOtherAllergyInput(e.target.value)}
            />
          </div>
        ) : null}

        <button type="button" className="nutrition-page__done-btn" onClick={handleDone}>
          Done
        </button>
      </div>
    </div>
  );
};

export default NutritionPage;
