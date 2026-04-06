import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './SuperClubPage.css';
import Header from '../../components/HomePage/Header';
import NavBar from '../../components/NavBar';
import SuperClubMovingMarquee from './SuperClubMovingMarquee';
import { SUPER_CLUB_SPORTS } from './superClubSportImages';
import { clearSuperClubOnboardingStorage, saveSuperClubOnboardingResult } from './superClubStorage';
import negativeImg from '../../images/Superclub/Negative.svg';
import positiveImg from '../../images/Superclub/Positive.svg';

function shuffleSports(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Super Club — moving activity orbs + “How do you move?” swipe / pass-like flow (Figma).
 * On each visit, client onboarding flags are cleared so everyone always sees page 1 fresh.
 * If `onOnboardingComplete` is set (e.g. page 2 enabled), completion is saved to localStorage.
 */
export default function SuperClubPage({
  userName = 'there',
  onMenuClick,
  onSearchClick,
  onNavigateHome,
  onNavigateToDoctors,
  onNavigateToPackages,
  onOnboardingComplete,
}) {
  const deck = useMemo(() => shuffleSports(SUPER_CLUB_SPORTS), []);
  const [index, setIndex] = useState(0);
  const [likedIds, setLikedIds] = useState([]);
  const [offsetX, setOffsetX] = useState(0);
  const [flying, setFlying] = useState(null);

  const likedIdsRef = useRef([]);
  const offsetRef = useRef(0);
  const dragRef = useRef({ pointerId: null, startX: 0, startOff: 0 });

  useEffect(() => {
    clearSuperClubOnboardingStorage();
  }, []);

  useEffect(() => {
    likedIdsRef.current = likedIds;
  }, [likedIds]);

  useEffect(() => {
    offsetRef.current = offsetX;
  }, [offsetX]);

  const sport = deck[index];

  const finishSwipeAnimation = useCallback(
    (isLike) => {
      setOffsetX(0);
      setFlying(isLike ? 'right' : 'left');
      window.setTimeout(() => {
        setFlying(null);
        const current = deck[index];
        const isLast = index >= deck.length - 1;

        let nextLiked = likedIdsRef.current;
        if (isLike && current && !nextLiked.includes(current.id)) {
          nextLiked = [...nextLiked, current.id];
          likedIdsRef.current = nextLiked;
          setLikedIds(nextLiked);
        }

        if (isLast) {
          if (onOnboardingComplete) {
            saveSuperClubOnboardingResult(nextLiked);
            onOnboardingComplete(nextLiked);
          }
          return;
        }
        setIndex((i) => i + 1);
      }, 280);
    },
    [deck, index, onOnboardingComplete],
  );

  const triggerPass = useCallback(() => {
    finishSwipeAnimation(false);
  }, [finishSwipeAnimation]);

  const triggerLike = useCallback(() => {
    finishSwipeAnimation(true);
  }, [finishSwipeAnimation]);

  const handleNav = (itemId) => {
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
    if (itemId === 'super-club') {
      return;
    }
  };

  const onCardPointerDown = (e) => {
    if (flying) return;
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startOff: offsetRef.current,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onCardPointerMove = (e) => {
    if (flying) return;
    if (dragRef.current.pointerId !== e.pointerId) return;
    const dx = e.clientX - dragRef.current.startX;
    setOffsetX(dragRef.current.startOff + dx);
  };

  const onCardPointerUp = (e) => {
    if (flying) return;
    if (dragRef.current.pointerId !== e.pointerId) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    const { startX, startOff } = dragRef.current;
    dragRef.current.pointerId = null;
    const ox = startOff + (e.clientX - startX);

    if (ox > 72) {
      triggerLike();
    } else if (ox < -72) {
      triggerPass();
    } else {
      setOffsetX(0);
    }
  };

  let cardTransform;
  if (flying === 'left') {
    cardTransform = 'translateX(-120vw) rotate(-12deg)';
  } else if (flying === 'right') {
    cardTransform = 'translateX(120vw) rotate(12deg)';
  } else {
    cardTransform = `translateX(${offsetX}px)`;
  }

  return (
    <div className="super-club-v1">
      <div className="super-club-v1__glow super-club-v1__glow--tl" aria-hidden="true" />
      <div className="super-club-v1__glow super-club-v1__glow--tr" aria-hidden="true" />
      <div className="super-club-v1__glow super-club-v1__glow--bl" aria-hidden="true" />

      <div className="super-club-v1__header-wrap">
        <Header name={userName} onMenuClick={onMenuClick} onSearchClick={onSearchClick} />
      </div>

      <main className="super-club-v1__main">
        <p className="super-club-v1__kicker">You&apos;ll love what&apos;s coming</p>
        <SuperClubMovingMarquee />

        <div className="super-club-v1__prompt">
          <h1 className="super-club-v1__question">How do you move?</h1>
          <p className="super-club-v1__hint">Swipe to answer</p>
        </div>

        <div className="super-club-v1__swipe-zone">
          <div className="super-club-v1__swipe-row">
            <button
              type="button"
              className="super-club-v1__vote"
              aria-label="Not for me"
              onClick={triggerPass}
              disabled={flying}
            >
              <img src={negativeImg} alt="" width={40} height={40} draggable={false} />
            </button>

            <div className="super-club-v1__card-outer">
              <div
                key={`${index}-${sport?.id ?? 'x'}`}
                role="presentation"
                className={`super-club-v1__card${flying ? ' super-club-v1__card--flying' : ''}`}
                style={{ transform: cardTransform, opacity: flying ? 0.85 : 1 }}
                onPointerDown={onCardPointerDown}
                onPointerMove={onCardPointerMove}
                onPointerUp={onCardPointerUp}
                onPointerCancel={onCardPointerUp}
              >
                {sport ? (
                  <div
                    className={`super-club-v1__card-art${
                      sport.xlCardGif
                        ? ' super-club-v1__card-art--flush'
                        : sport.largeCardGif
                          ? ' super-club-v1__card-art--tight'
                          : ''
                    }`}
                  >
                    <img
                      src={sport.image}
                      alt=""
                      className={`super-club-v1__card-gif${
                        sport.xlCardGif
                          ? ' super-club-v1__card-gif--xl'
                          : sport.largeCardGif
                            ? ' super-club-v1__card-gif--large'
                            : ''
                      }`}
                      draggable={false}
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              className="super-club-v1__vote"
              aria-label="I like this"
              onClick={triggerLike}
              disabled={flying}
            >
              <img src={positiveImg} alt="" width={40} height={40} draggable={false} />
            </button>
          </div>
        </div>
      </main>

      <NavBar defaultActive="super-club" onNavigate={handleNav} />
    </div>
  );
}
