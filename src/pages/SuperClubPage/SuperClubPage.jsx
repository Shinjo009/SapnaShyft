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
  /** True while flying animation runs — ref matches state for window-level pointer handlers. */
  const flyingRef = useRef(false);
  const teardownWindowDragRef = useRef(() => {});
  const dragRef = useRef({ pointerId: null, startX: 0, startOff: 0 });
  const deckRef = useRef(deck);
  const indexRef = useRef(index);
  const onOnboardingCompleteRef = useRef(onOnboardingComplete);
  const swipeCommitLockRef = useRef(false);
  const finishSwipeTimeoutRef = useRef(null);

  useEffect(() => {
    clearSuperClubOnboardingStorage();
  }, []);

  useEffect(() => {
    likedIdsRef.current = likedIds;
  }, [likedIds]);

  useEffect(() => {
    offsetRef.current = offsetX;
  }, [offsetX]);

  useEffect(() => {
    flyingRef.current = flying != null;
  }, [flying]);

  useEffect(() => {
    deckRef.current = deck;
  }, [deck]);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    onOnboardingCompleteRef.current = onOnboardingComplete;
  }, [onOnboardingComplete]);

  useEffect(
    () => () => {
      teardownWindowDragRef.current();
      teardownWindowDragRef.current = () => {};
      if (finishSwipeTimeoutRef.current != null) {
        clearTimeout(finishSwipeTimeoutRef.current);
        finishSwipeTimeoutRef.current = null;
      }
    },
    [],
  );

  const sport = deck[index];

  const finishSwipeAnimation = useCallback((isLike) => {
    if (swipeCommitLockRef.current) return;
    swipeCommitLockRef.current = true;

    const swipeAtIndex = indexRef.current;

    setOffsetX(0);
    setFlying(isLike ? 'right' : 'left');

    finishSwipeTimeoutRef.current = window.setTimeout(() => {
      finishSwipeTimeoutRef.current = null;
      try {
        setFlying(null);
        const d = deckRef.current;
        const current = d[swipeAtIndex];
        const lastIdx = d.length > 0 ? d.length - 1 : 0;
        const isLast = d.length === 0 || swipeAtIndex >= lastIdx;

        let nextLiked = likedIdsRef.current;
        if (isLike && current && !nextLiked.includes(current.id)) {
          nextLiked = [...nextLiked, current.id];
          likedIdsRef.current = nextLiked;
          setLikedIds(nextLiked);
        }

        if (isLast) {
          const complete = onOnboardingCompleteRef.current;
          if (complete) {
            saveSuperClubOnboardingResult(nextLiked);
            complete(nextLiked);
          }
          return;
        }
        setIndex(swipeAtIndex + 1);
      } finally {
        swipeCommitLockRef.current = false;
      }
    }, 280);
  }, []);

  const triggerPass = useCallback(() => {
    finishSwipeAnimation(false);
  }, [finishSwipeAnimation]);

  const triggerLike = useCallback(() => {
    finishSwipeAnimation(true);
  }, [finishSwipeAnimation]);

  /** Clear vote interactions from bubbling; keeps desktop clicks reliable beside card drag handlers. */
  const onVoteClickPass = useCallback(
    (e) => {
      e.stopPropagation();
      triggerPass();
    },
    [triggerPass],
  );

  const onVoteClickLike = useCallback(
    (e) => {
      e.stopPropagation();
      triggerLike();
    },
    [triggerLike],
  );

  const onVotePointerDown = useCallback((e) => {
    e.stopPropagation();
  }, []);

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

  /**
   * Element capture alone is unreliable on some desktop browsers when the card transform updates
   * every move. Track drag with capturing listeners on `window` until pointer up/cancel.
   */
  const onCardPointerDown = (e) => {
    if (flyingRef.current) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    const pointerId = e.pointerId;
    const cardEl = e.currentTarget;

    teardownWindowDragRef.current();
    teardownWindowDragRef.current = () => {};

    dragRef.current = {
      pointerId,
      startX: e.clientX,
      startOff: offsetRef.current,
    };

    const onMove = (ev) => {
      if (ev.pointerId !== pointerId) return;
      if (flyingRef.current) return;
      if (dragRef.current.pointerId !== pointerId) return;
      const dx = ev.clientX - dragRef.current.startX;
      setOffsetX(dragRef.current.startOff + dx);
    };

    const teardown = () => {
      window.removeEventListener('pointermove', onMove, true);
      window.removeEventListener('pointerup', onUpOrCancel, true);
      window.removeEventListener('pointercancel', onUpOrCancel, true);
    };

    const onUpOrCancel = (ev) => {
      if (ev.pointerId !== pointerId) return;
      teardown();
      teardownWindowDragRef.current = () => {};

      if (flyingRef.current) return;
      if (dragRef.current.pointerId !== pointerId) return;

      try {
        cardEl.releasePointerCapture(pointerId);
      } catch {
        /* ignore */
      }

      const { startX, startOff } = dragRef.current;
      dragRef.current = { pointerId: null, startX: 0, startOff: 0 };

      const ox = startOff + (ev.clientX - startX);
      if (ox > 72) {
        triggerLike();
      } else if (ox < -72) {
        triggerPass();
      } else {
        setOffsetX(0);
      }
    };

    teardownWindowDragRef.current = teardown;

    window.addEventListener('pointermove', onMove, true);
    window.addEventListener('pointerup', onUpOrCancel, true);
    window.addEventListener('pointercancel', onUpOrCancel, true);

    try {
      cardEl.setPointerCapture(pointerId);
    } catch {
      /* still OK — window listeners handle desktop */
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
        <Header name={userName} onMenuClick={onMenuClick} showGreeting={false} />
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
              onPointerDown={onVotePointerDown}
              onClick={onVoteClickPass}
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
                onLostPointerCapture={() => {
                  if (dragRef.current.pointerId == null || flyingRef.current) return;
                  teardownWindowDragRef.current();
                  teardownWindowDragRef.current = () => {};
                  dragRef.current = { pointerId: null, startX: 0, startOff: 0 };
                  setOffsetX(0);
                }}
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
              onPointerDown={onVotePointerDown}
              onClick={onVoteClickLike}
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
