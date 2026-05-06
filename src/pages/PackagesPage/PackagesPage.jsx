import React, { useEffect, useMemo, useState, Suspense, lazy } from 'react';
import './PackagesPage.css';
import NavBar from '../../components/NavBar';
import { listDiagnosticPackages, listPublicDiagnosticPackageFilterChips } from '../../services/diagnosticPackagesService';
import { getAccessToken } from '../../utils/authStorage';

// PatientSelectionOverlay is a large (~14 KiB) booking sheet that only renders when the user
// taps "Book"; keep it out of the initial Packages bundle via React.lazy + Suspense.
const PatientSelectionOverlay = lazy(() => import('../../components/PatientSelectionOverlay'));

const ALL_FILTER = {
  filter_chip_id: 'all',
  chip_key: 'all',
  display_name: 'All',
};

const MISSING_VALUE = '-';

const normalizeFilterChipValue = (value) => {
  if (value == null) {
    return '';
  }

  return String(value).trim();
};

const getPackageFilterChips = (pkg) => {
  const values = [];
  const pushValue = (value) => {
    const normalized = normalizeFilterChipValue(value);
    if (normalized) {
      values.push(normalized);
    }
  };

  const rawFilterChip = pkg?.filter_chip ?? pkg?.filter_chips;

  if (typeof rawFilterChip === 'string') {
    rawFilterChip
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach(pushValue);
  } else if (Array.isArray(rawFilterChip)) {
    rawFilterChip.forEach((item) => {
      if (typeof item === 'string' || typeof item === 'number') {
        pushValue(item);
        return;
      }

      if (item && typeof item === 'object') {
        pushValue(item?.display_name || item?.filter_chip || item?.chip_key || item?.name);
      }
    });
  } else if (rawFilterChip && typeof rawFilterChip === 'object') {
    pushValue(rawFilterChip?.display_name || rawFilterChip?.filter_chip || rawFilterChip?.chip_key || rawFilterChip?.name);
  }

  const unique = Array.from(new Map(values.map((value) => [value.toLowerCase(), value])).values());
  return unique;
};

const toDiscountText = (discountPercent, nowPrice, originalPrice) => {
  if (Number(discountPercent) > 0) {
    return `${Math.round(Number(discountPercent))}% OFF`;
  }

  if (Number(originalPrice) > Number(nowPrice) && Number(nowPrice) > 0) {
    const computedPercent = Math.round(((Number(originalPrice) - Number(nowPrice)) / Number(originalPrice)) * 100);
    if (computedPercent > 0) {
      return `${computedPercent}% OFF`;
    }
  }

  return MISSING_VALUE;
};

const mapDiagnosticPackageToCard = (pkg, index) => {
  const resolvedNowPrice = Number(pkg?.price);
  const resolvedOldPrice = Number(pkg?.original_price);
  const now = Number.isFinite(resolvedNowPrice) && resolvedNowPrice > 0 ? resolvedNowPrice : null;
  const old = Number.isFinite(resolvedOldPrice) && resolvedOldPrice > 0 ? resolvedOldPrice : null;
  const filterChipBadges = getPackageFilterChips(pkg);

  const badges = [
    ...(pkg?.is_most_popular ? ['Most Popular'] : []),
    ...filterChipBadges,
  ];

  const mappedTags = Array.isArray(pkg?.tags)
    ? pkg.tags
      .map((tag) => {
        if (typeof tag === 'string' || typeof tag === 'number') {
          return String(tag).trim();
        }

        if (tag && typeof tag === 'object') {
          return String(tag.tag_name || tag.name || '').trim();
        }

        return '';
      })
      .filter(Boolean)
      .slice(0, 4)
    : [];

  return {
    id: Number(pkg?.diagnostic_package_id) || `package-${index}`,
    theme: index % 2 === 0 ? 'teal' : 'pink',
    badges: badges.length > 0 ? badges : [MISSING_VALUE],
    title: String(pkg?.package_name || MISSING_VALUE),
    chips: mappedTags.length > 0 ? mappedTags : [MISSING_VALUE],
    metrics: {
      parameters: pkg?.no_of_tests != null ? String(pkg.no_of_tests) : MISSING_VALUE,
      reportsIn: '48-72 hrs',
      fasting: '10-12 hrs',
    },
    pricing: {
      now,
      old,
      off: toDiscountText(pkg?.discount_percent, now, old),
    },
    apiData: pkg,
  };
};

const normalizeFilterChipRows = (rows) => {
  const source = Array.isArray(rows) ? rows : [];

  const normalized = source
    .map((row, index) => {
      const chipKey = String(row?.chip_key || row?.key || '').trim();
      const displayName = String(row?.display_name || row?.name || chipKey).trim();

      if (!chipKey || !displayName) {
        return null;
      }

      return {
        filter_chip_id: row?.filter_chip_id ?? row?.id ?? `${chipKey}-${index}`,
        chip_key: chipKey,
        display_name: displayName,
      };
    })
    .filter(Boolean);

  const uniqueByKey = Array.from(
    new Map(normalized.map((chip) => [String(chip.chip_key).toLowerCase(), chip])).values()
  );

  return [ALL_FILTER, ...uniqueByKey.filter((chip) => String(chip.chip_key).toLowerCase() !== 'all')];
};

const toNormalizedPackageTagValues = (pkg) => {
  const values = new Set();

  getPackageFilterChips(pkg?.apiData || {}).forEach((value) => {
    const normalized = String(value).trim().toLowerCase();
    if (normalized) {
      values.add(normalized);
    }
  });

  const rawTags = Array.isArray(pkg?.apiData?.tags) ? pkg.apiData.tags : [];
  rawTags.forEach((tag) => {
    if (typeof tag === 'string' || typeof tag === 'number') {
      const value = String(tag).trim().toLowerCase();
      if (value) {
        values.add(value);
      }
      return;
    }

    if (tag && typeof tag === 'object') {
      [tag?.tag_name, tag?.name, tag?.filter_chip, tag?.chip_key, tag?.display_name]
        .map((item) => String(item || '').trim().toLowerCase())
        .filter(Boolean)
        .forEach((item) => values.add(item));
    }
  });

  const genderSuitability = String(pkg?.apiData?.gender_suitability || '').trim().toLowerCase();
  if (genderSuitability === 'male' || genderSuitability === 'both') {
    values.add('male');
  }
  if (genderSuitability === 'female' || genderSuitability === 'both') {
    values.add('female');
  }

  if (pkg?.apiData?.is_most_popular) {
    values.add('popular');
    values.add('most popular');
  }

  return values;
};

const CustomPackageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M10.6683 6.66646C10.6683 8.13823 9.47342 9.33313 8.00165 9.33313C6.52987 9.33313 5.33498 8.13823 5.33498 6.66646M2.07031 4.02246H13.933" stroke="#E6F6F4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.26667 3.64434C2.09357 3.87514 2 4.15585 2 4.44434V13.333C2 14.0689 2.59745 14.6663 3.33333 14.6663H12.6667C13.4026 14.6663 14 14.0689 14 13.333V4.44434C14 4.15585 13.9064 3.87514 13.7333 3.64434L12.4 1.86634C12.1482 1.5306 11.753 1.33301 11.3333 1.33301H4.66667C4.24699 1.33301 3.85181 1.5306 3.6 1.86634L2.26667 3.64434" stroke="#E6F6F4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const OpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M5.83203 5.8335H14.1654V14.1668M5.83203 14.1668L14.1654 5.8335" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ComplimentaryConsultationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8.99238 2.44343C8.86732 2.30376 8.71421 2.19203 8.54305 2.11554C8.37189 2.03905 8.18652 1.99951 7.99905 1.99951C7.81157 1.99951 7.6262 2.03905 7.45504 2.11554C7.28388 2.19203 7.13077 2.30376 7.00571 2.44343L6.53905 2.96476C6.40567 3.11376 6.24049 3.23085 6.05574 3.30736C5.87098 3.38387 5.67138 3.41784 5.47171 3.40676L4.77171 3.36809C4.58448 3.35777 4.39718 3.38706 4.22204 3.45404C4.0469 3.52102 3.88785 3.6242 3.75529 3.75682C3.62273 3.88944 3.51963 4.04854 3.45273 4.22371C3.38583 4.39889 3.35664 4.5862 3.36705 4.77343L3.40571 5.47276C3.41669 5.67231 3.38267 5.87178 3.30616 6.05642C3.22965 6.24105 3.11262 6.40612 2.96371 6.53943L2.44238 7.00609C2.3026 7.13115 2.19078 7.2843 2.11422 7.45552C2.03766 7.62675 1.99809 7.8122 1.99809 7.99976C1.99809 8.18732 2.03766 8.37277 2.11422 8.54399C2.19078 8.71522 2.3026 8.86836 2.44238 8.99343L2.96371 9.46009C3.11271 9.59347 3.2298 9.75865 3.30631 9.9434C3.38282 10.1282 3.41679 10.3278 3.40571 10.5274L3.36705 11.2274C3.35673 11.4147 3.38601 11.602 3.45299 11.7771C3.51998 11.9522 3.62315 12.1113 3.75577 12.2438C3.8884 12.3764 4.04749 12.4795 4.22267 12.5464C4.39784 12.6133 4.58515 12.6425 4.77238 12.6321L5.47171 12.5934C5.67127 12.5824 5.87074 12.6165 6.05537 12.693C6.24001 12.7695 6.40508 12.8865 6.53838 13.0354L7.00505 13.5568C7.13011 13.6965 7.28325 13.8084 7.45448 13.8849C7.6257 13.9615 7.81115 14.001 7.99871 14.001C8.18627 14.001 8.37172 13.9615 8.54295 13.8849C8.71417 13.8084 8.86732 13.6965 8.99238 13.5568L9.45905 13.0354C9.59242 12.8864 9.7576 12.7693 9.94236 12.6928C10.1271 12.6163 10.3267 12.5823 10.5264 12.5934L11.2264 12.6321C11.4136 12.6424 11.6009 12.6131 11.7761 12.5461C11.9512 12.4792 12.1102 12.376 12.2428 12.2434C12.3754 12.1107 12.4785 11.9516 12.5454 11.7765C12.6123 11.6013 12.6415 11.414 12.631 11.2268L12.5924 10.5274C12.5814 10.3279 12.6154 10.1284 12.6919 9.94377C12.7684 9.75913 12.8855 9.59406 13.0344 9.46076L13.5557 8.99409C13.6955 8.86903 13.8073 8.71588 13.8839 8.54466C13.9604 8.37344 14 8.18799 14 8.00043C14 7.81287 13.9604 7.62742 13.8839 7.45619C13.8073 7.28497 13.6955 7.13182 13.5557 7.00676L13.0344 6.54009C12.8854 6.40672 12.7683 6.24154 12.6918 6.05678C12.6153 5.87202 12.5813 5.67242 12.5924 5.47276L12.631 4.77276C12.6413 4.58558 12.6119 4.39836 12.5449 4.22329C12.4779 4.04823 12.3747 3.88927 12.2421 3.75678C12.1094 3.62429 11.9504 3.52126 11.7753 3.4544C11.6001 3.38754 11.4129 3.35836 11.2257 3.36876L10.5264 3.40743C10.3268 3.4184 10.1274 3.38438 9.94272 3.30788C9.75809 3.23137 9.59302 3.11433 9.45971 2.96543L8.99238 2.44343Z" stroke="white" strokeWidth="1.33333"/>
    <path d="M9.66406 6.3335H9.6574V6.34016H9.66406V6.3335ZM6.33073 9.66683H6.32406V9.6735H6.33073V9.66683Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M6 6L10 10" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SearchIcon = ({ stroke = 'white' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 21L16.65 16.65" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const formatPrice = (value) => {
  if (!Number.isFinite(Number(value)) || Number(value) <= 0) {
    return MISSING_VALUE;
  }

  return `₹${Number(value).toLocaleString('en-IN')}`;
};

const normalizeBadgeToken = (value) => String(value || '').trim().toLowerCase();

const PackagesPage = ({ onNavigateHome, onOpenPackageDetails, onOpenCreateCustomPackage, onNavigateToDoctors, onNavigateToSuperClub, customPackageCard }) => {
  const [activeFilterKey, setActiveFilterKey] = useState('all');
  const [filterChips, setFilterChips] = useState([ALL_FILTER]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPatientOverlayOpen, setIsPatientOverlayOpen] = useState(false);
  const [packageCardsFromApi, setPackageCardsFromApi] = useState([]);
  const [bookingPackage, setBookingPackage] = useState(null);
  const normalizedQuery = searchQuery.trim().toLowerCase();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (isPatientOverlayOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isPatientOverlayOpen]);

  useEffect(() => {
    let mounted = true;

    const loadDiagnosticPackageCards = async () => {
      try {
        const rows = await listDiagnosticPackages();

        if (!mounted) {
          return;
        }

        const mappedRows = (Array.isArray(rows) ? rows : []).map(mapDiagnosticPackageToCard);
        setPackageCardsFromApi(mappedRows);
      } catch {
        if (mounted) {
          setPackageCardsFromApi([]);
        }
      }
    };

    loadDiagnosticPackageCards();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadFilterChips = async () => {
      try {
        const rows = await listPublicDiagnosticPackageFilterChips({ accessToken: getAccessToken() });

        if (!mounted) {
          return;
        }

        const normalized = normalizeFilterChipRows(rows);
        setFilterChips(normalized.length > 0 ? normalized : [ALL_FILTER]);
      } catch {
        if (mounted) {
          setFilterChips([ALL_FILTER]);
        }
      }
    };

    loadFilterChips();

    return () => {
      mounted = false;
    };
  }, []);

  const sourceCards = useMemo(() => {
    return packageCardsFromApi;
  }, [packageCardsFromApi]);

  const visibleCards = useMemo(() => {
    const filteredCards = sourceCards.filter((pkg) => {
      const selectedChip = filterChips.find((chip) => String(chip?.chip_key || '').toLowerCase() === activeFilterKey);
      const selectedKey = String(selectedChip?.chip_key || activeFilterKey || 'all').trim().toLowerCase();
      const selectedLabel = String(selectedChip?.display_name || '').trim().toLowerCase();

      if (selectedKey === 'all') {
        return true;
      }

      const packageValues = toNormalizedPackageTagValues(pkg);
      return packageValues.has(selectedKey) || (selectedLabel ? packageValues.has(selectedLabel) : false);
    });

    const searchFilteredCards = filteredCards.filter((pkg) => {
      if (!normalizedQuery) {
        return true;
      }

      const titleText = String(pkg?.title || '').toLowerCase();
      const badgesText = Array.isArray(pkg?.badges) ? pkg.badges.join(' ').toLowerCase() : '';
      const chipsText = Array.isArray(pkg?.chips) ? pkg.chips.join(' ').toLowerCase() : '';
      const tagsText = Array.isArray(pkg?.apiData?.tags)
        ? pkg.apiData.tags
          .map((tag) => {
            if (typeof tag === 'string' || typeof tag === 'number') {
              return String(tag);
            }
            if (tag && typeof tag === 'object') {
              return String(tag.tag_name || tag.name || tag.filter_chip || tag.chip_key || tag.display_name || '');
            }
            return '';
          })
          .join(' ')
          .toLowerCase()
        : '';

      return titleText.includes(normalizedQuery)
        || badgesText.includes(normalizedQuery)
        || chipsText.includes(normalizedQuery)
        || tagsText.includes(normalizedQuery);
    });

    if (!customPackageCard) {
      return searchFilteredCards;
    }

    const shouldIncludeCustomCard = !normalizedQuery
      || String(customPackageCard?.title || '').toLowerCase().includes(normalizedQuery)
      || String(customPackageCard?.chips || '').toLowerCase().includes(normalizedQuery);

    return shouldIncludeCustomCard
      ? [...searchFilteredCards, { ...customPackageCard }]
      : searchFilteredCards;
  }, [activeFilterKey, customPackageCard, filterChips, normalizedQuery, sourceCards]);

  useEffect(() => {
    const availableKeys = new Set(
      (Array.isArray(filterChips) ? filterChips : [])
        .map((chip) => String(chip?.chip_key || '').trim().toLowerCase())
        .filter(Boolean)
    );

    if (!availableKeys.has(activeFilterKey)) {
      setActiveFilterKey('all');
    }
  }, [activeFilterKey, filterChips]);

  const handleNav = (itemId) => {
    if (itemId === 'home' && onNavigateHome) {
      onNavigateHome();
      return;
    }

    if (itemId === 'super-sync' && onNavigateToDoctors) {
      onNavigateToDoctors();
      return;
    }

    if (itemId === 'super-club' && onNavigateToSuperClub) {
      onNavigateToSuperClub();
    }
  };

  const selectedFilterChip = filterChips.find(
    (chip) => String(chip?.chip_key || '').trim().toLowerCase() === activeFilterKey
  ) || null;
  const selectedFilterKey = normalizeBadgeToken(selectedFilterChip?.chip_key || activeFilterKey);
  const selectedFilterLabel = normalizeBadgeToken(selectedFilterChip?.display_name);
  const shouldHighlightFilterBadge = selectedFilterKey !== 'all';

  const getBadgeClass = (badge) => {
    if (badge === 'Custom Built') {
      return 'packages-card__badge--custom';
    }

    if (!shouldHighlightFilterBadge) {
      return 'packages-card__badge--type';
    }

    const badgeToken = normalizeBadgeToken(badge);
    const isSelectedFilterBadge = badgeToken
      && (badgeToken === selectedFilterKey || (selectedFilterLabel && badgeToken === selectedFilterLabel));

    return isSelectedFilterBadge ? 'packages-card__badge--popular' : 'packages-card__badge--type';
  };

  return (
    <div className={`packages-page ${isSearchOpen ? 'packages-page--search-open' : ''}`}>
      <div className="packages-page__fixed-top">
        <header className="packages-page__header">
          <h1 className="packages-page__title">Explore Packages</h1>
          <div className="packages-page__header-actions">
            <button
              type="button"
              className="packages-page__icon-btn"
              onClick={() => setIsSearchOpen((prev) => !prev)}
              aria-label="Search"
            >
              <SearchIcon />
            </button>
          </div>
        </header>

        <div className={`packages-page__search-row packages-page__search-row--animated ${isSearchOpen ? 'is-open' : ''}`} aria-hidden={!isSearchOpen}>
          <SearchIcon stroke="rgba(255, 255, 255, 0.72)" />
          <input
            type="text"
            className="packages-page__search-input"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search"
            aria-label="Search packages"
          />
        </div>

        <section className="packages-page__custom-row" aria-label="Package search and custom package">
          <button
            type="button"
            className="packages-page__custom-btn"
            aria-label="Create custom package"
            data-tour="packages-custom"
            onClick={() => {
              if (onOpenCreateCustomPackage) {
                onOpenCreateCustomPackage();
              }
            }}
          >
            <span>Create Custom Package</span>
            <CustomPackageIcon />
          </button>
        </section>

        <section className="packages-page__filters" aria-label="Package filters">
          {filterChips.map((filter) => {
            const filterKey = String(filter?.chip_key || 'all').trim().toLowerCase();
            const label = String(filter?.display_name || filter?.chip_key || 'All').trim() || 'All';

            return (
            <button
              key={String(filter?.filter_chip_id || filterKey)}
              type="button"
              className={`packages-page__filter-pill${activeFilterKey === filterKey ? ' is-active' : ''}`}
              onClick={() => setActiveFilterKey(filterKey)}
            >
              {label}
            </button>
            );
          })}
        </section>
      </div>

      <div className="packages-page__content">
        <section className="packages-page__cards" aria-label="Packages list">
          {visibleCards.map((pkg) => (
            <article
              key={pkg.id}
              className={`packages-card packages-card--${pkg.theme}`}
              onClick={() => onOpenPackageDetails && onOpenPackageDetails(pkg)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  if (onOpenPackageDetails) {
                    onOpenPackageDetails(pkg);
                  }
                }
              }}
            >
              <div className="packages-card__badges">
                {(pkg.badges || []).map((badge, index) => {
                  const badgeClass = getBadgeClass(badge);
                  return (
                    <span key={`${pkg.id}-${badge}-${index}`} className={`packages-card__badge ${badgeClass}`}>
                      {badge}
                    </span>
                  );
                })}
              </div>

              <div className="packages-card__title-row">
                <h2 className="packages-card__title">{pkg.title}</h2>
                <button
                  type="button"
                  className="packages-card__open-btn"
                  aria-label="Open package details"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (onOpenPackageDetails) {
                      onOpenPackageDetails(pkg);
                    }
                  }}
                >
                  <OpenIcon />
                </button>
              </div>

              <div className="packages-card__feature-chips">
                {(pkg.chips || []).map((chip, chipIndex) => (
                  <span key={`${pkg.id}-chip-${chipIndex}`} className="packages-card__feature-chip">{chip}</span>
                ))}
              </div>

              <div className="packages-card__metrics">
                <div className="packages-card__metric">
                  <span className="packages-card__metric-value">{pkg.metrics?.parameters}</span>
                  <span className="packages-card__metric-label">Parameters</span>
                </div>
                <div className="packages-card__metric-separator" aria-hidden="true" />
                <div className="packages-card__metric">
                  <span className="packages-card__metric-value">{pkg.metrics?.reportsIn}</span>
                  <span className="packages-card__metric-label">Reports in</span>
                </div>
                <div className="packages-card__metric-separator" aria-hidden="true" />
                <div className="packages-card__metric">
                  <span className="packages-card__metric-value">{pkg.metrics?.fasting}</span>
                  <span className="packages-card__metric-label">Fasting</span>
                </div>
              </div>

              <div className="packages-card__book-row">
                <div className="packages-card__book-perks">
                  <span className="packages-card__book-perk-pill">
                    <ComplimentaryConsultationIcon />
                    <span>Complimentary Nutritionist Consultation</span>
                  </span>
                </div>
                <div className="packages-card__book-main">
                  <div className="packages-card__price-wrap">
                    <div className="packages-card__price-top">
                      <span className="packages-card__price-now">{formatPrice(pkg.pricing?.now)}</span>
                      {pkg.pricing?.off ? <span className="packages-card__off-pill">{pkg.pricing.off}</span> : null}
                    </div>
                    <span className="packages-card__price-old">{formatPrice(pkg.pricing?.old)}</span>
                  </div>
                  <button
                    type="button"
                    className="packages-card__book-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      setBookingPackage(pkg);
                      setIsPatientOverlayOpen(true);
                    }}
                  >
                    BOOK
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>

      {isPatientOverlayOpen ? (
        <Suspense fallback={null}>
          <PatientSelectionOverlay
            open={isPatientOverlayOpen}
            onClose={() => {
              setIsPatientOverlayOpen(false);
              setBookingPackage(null);
            }}
            initialPackage={bookingPackage}
          />
        </Suspense>
      ) : null}

      {!isPatientOverlayOpen ? <NavBar defaultActive="packages" onNavigate={handleNav} /> : null}
    </div>
  );
};

export default PackagesPage;