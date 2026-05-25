import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Header from '../../components/HomePage/Header';
import NavBar from '../../components/NavBar';
import tickIcon from '../../images/ques-tick.svg';
import '../../styles/nutritionLogMcq.css';
import './SuperclubEarlyAccessPage.css';
import { SPORT_CHIPS } from './superclubEarlyAccessSports';

/** When Done with no picks, playlist confirm still needs up to four tiles — use first N in chip order. */
const DEFAULT_SPORT_COUNT = 4;

function stateFromPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return { selected: new Set(), otherNote: '' };
  }
  const selected = new Set(Array.isArray(payload.sportIds) ? payload.sportIds : []);
  const otherNote = String(payload.otherNote || '');
  if (otherNote.trim()) {
    selected.add('other');
  }
  return { selected, otherNote };
}

export default function SuperclubEarlyAccessPage({
  userName = 'there',
  initialPayload = null,
  onMenuClick,
  onNavigateHome,
  onNavigateToDoctors,
  onNavigateToPackages,
  onNavigateToSuperClub,
  onDone,
}) {
  const [selected, setSelected] = useState(() => stateFromPayload(initialPayload).selected);
  const [otherNote, setOtherNote] = useState(() => stateFromPayload(initialPayload).otherNote);
  const otherNoteRef = useRef(otherNote);

  useEffect(() => {
    otherNoteRef.current = otherNote;
  }, [otherNote]);

  const toggle = useCallback((id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleNav = useCallback(
    (itemId) => {
      if (itemId === 'home' && onNavigateHome) {
        onNavigateHome();
        return;
      }
      if (itemId === 'super-sync' && onNavigateToDoctors) {
        onNavigateToDoctors();
        return;
      }
      if (itemId === 'packages' && onNavigateToPackages) {
        onNavigateToPackages();
        return;
      }
      if (itemId === 'super-club' && onNavigateToSuperClub) {
        onNavigateToSuperClub();
      }
    },
    [onNavigateHome, onNavigateToDoctors, onNavigateToPackages, onNavigateToSuperClub]
  );

  const otherSelected = selected.has('other');

  const defaultSportIdsIfEmpty = useMemo(
    () => SPORT_CHIPS.slice(0, DEFAULT_SPORT_COUNT).map((c) => c.id),
    []
  );

  const handleOtherNoteChange = useCallback((e) => {
    const value = e.target.value;
    otherNoteRef.current = value;
    setOtherNote(value);
    if (value.trim()) {
      setSelected((prev) => {
        if (prev.has('other')) {
          return prev;
        }
        const next = new Set(prev);
        next.add('other');
        return next;
      });
    }
  }, []);

  const handleDone = useCallback(() => {
    const resolvedOtherNote = otherNoteRef.current.trim();
    let sportIds = [...selected].filter((id) => id !== 'other');
    let resolvedOtherSelected = resolvedOtherNote.length > 0;

    if (sportIds.length === 0 && !resolvedOtherSelected) {
      sportIds = defaultSportIdsIfEmpty;
      resolvedOtherSelected = false;
    }

    onDone?.({
      sportIds,
      otherSelected: resolvedOtherSelected,
      otherNote: resolvedOtherSelected ? resolvedOtherNote : '',
    });
  }, [defaultSportIdsIfEmpty, onDone, selected]);

  return (
    <div className="superclub-early">
      <div className="superclub-early__top">
        <Header name={userName} onMenuClick={onMenuClick} showGreeting={false} />
        <button type="button" className="superclub-early__search" aria-label="Search">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M10.5 18C14.6421 18 18 14.6421 18 10.5C18 6.35786 14.6421 3 10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18Z"
              stroke="white"
              strokeWidth="1.75"
            />
            <path d="M16 16L21 21" stroke="white" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <main className="superclub-early__main">
        <div className="superclub-early__main-inner">
          <div className="superclub-early__headline-wrap">
            <p className="superclub-early__headline">Build your personalized sports playlist!</p>
          </div>

          <section className="superclub-early__card" aria-labelledby="superclub-early-q">
            <h2 id="superclub-early-q" className="nutrition-log-page__question">
              Which sports or wellness experiences would you like us to prioritize for you?
            </h2>

            <div className="nutrition-log-page__chips">
              {SPORT_CHIPS.map((chip) => {
                const isOn = selected.has(chip.id);
                return (
                  <button
                    key={chip.id}
                    type="button"
                    className={`nutrition-log-page__chip${isOn ? ' nutrition-log-page__chip--selected' : ''}`}
                    onClick={() => toggle(chip.id)}
                    aria-pressed={isOn}
                  >
                    {isOn ? <img src={tickIcon} alt="" aria-hidden="true" className="nutrition-log-page__tick" /> : null}
                    <span>{chip.label}</span>
                  </button>
                );
              })}
            </div>

            <div
              className={`superclub-early__other-panel${otherSelected ? ' superclub-early__other-panel--selected' : ''}`}
            >
              <button
                type="button"
                className="superclub-early__other-panel-toggle"
                onClick={() => toggle('other')}
                aria-pressed={otherSelected}
              >
                {otherSelected ? <img src={tickIcon} alt="" aria-hidden="true" className="nutrition-log-page__tick" /> : null}
                <span className="superclub-early__other-panel-label">Other</span>
              </button>
              {otherSelected ? (
                <div className="superclub-early__other-panel-field">
                  <label className="superclub-early__other-panel-hint" htmlFor="superclub-early-other-input">
                    Please specify
                  </label>
                  <input
                    id="superclub-early-other-input"
                    type="text"
                    className="superclub-early__other-panel-input"
                    value={otherNote}
                    onChange={handleOtherNoteChange}
                    onClick={(e) => e.stopPropagation()}
                    placeholder=""
                    autoComplete="off"
                  />
                </div>
              ) : null}
            </div>
          </section>

          <div className="superclub-early__done-wrap">
            <button type="button" className="superclub-early__done" onClick={handleDone}>
              Done
            </button>
          </div>
        </div>
      </main>

      <NavBar defaultActive="super-club" onNavigate={handleNav} />
    </div>
  );
}
