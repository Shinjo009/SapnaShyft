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
      reportsIn: '24-48 hrs',
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
  const [isPatientOverlayOpen, setIsPatientOverlayOpen] = useState(false);
  const [packageCardsFromApi, setPackageCardsFromApi] = useState([]);
  const [bookingPackage, setBookingPackage] = useState(null);

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

    if (!customPackageCard) {
      return filteredCards;
    }

    return [...filteredCards, { ...customPackageCard }];
  }, [activeFilterKey, customPackageCard, filterChips, sourceCards]);

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
    <div className="packages-page">
      <div className="packages-page__fixed-top">
        <header className="packages-page__header">
          <h1 className="packages-page__title">Explore Packages</h1>
        </header>

        <section className="packages-page__search-row" aria-label="Package search and custom package">
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