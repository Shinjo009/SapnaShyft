import React, { useEffect, useMemo, useState } from 'react';
import './CreateCustomPackagePage.css';
import {
  listDiagnosticPackageFilterChips,
  listDiagnosticTestGroupTests,
  listDiagnosticTestGroups,
} from '../../services/diagnosticPackagesService';
import { getAccessToken } from '../../utils/authStorage';
import liverIcon from '../../images/Liver.svg';
import haematologyIcon from '../../images/Haemotology.svg';
import kidneyIcon from '../../images/Kidney.svg';
import vitaminsIcon from '../../images/Vitamins.svg';
import lipidIcon from '../../images/Lipid.svg';
import ironIcon from '../../images/Iron.svg';
import thyroidIcon from '../../images/Thyroid.svg';
import diabetesIcon from '../../images/Diabetes.svg';
import inflammationIcon from '../../images/Inflammation.svg';
import sleepIcon from '../../images/Sleep.svg';
import hormonesIcon from '../../images/Hormones.svg';
import allergiesIcon from '../../images/Allergies_HAC.svg';
import cardiacIcon from '../../images/Cardiac-RA.svg';
import ferritinIcon from '../../images/Ferritin.svg';
import homaIcon from '../../images/HOMA.svg';
import insulinIcon from '../../images/Insulin.svg';
import urineIcon from '../../images/Urine.svg';

const ORGAN_ICON_KEYWORDS = [
  ['haematology', haematologyIcon],
  ['hematology', haematologyIcon],
  ['hemogram', haematologyIcon],
  ['cbc', haematologyIcon],
  ['liver', liverIcon],
  ['kidney', kidneyIcon],
  ['renal', kidneyIcon],
  ['vitamin', vitaminsIcon],
  ['lipid', lipidIcon],
  ['cholesterol', lipidIcon],
  ['iron', ironIcon],
  ['ferritin', ferritinIcon],
  ['thyroid', thyroidIcon],
  ['diabetes', diabetesIcon],
  ['hba1c', diabetesIcon],
  ['glucose', diabetesIcon],
  ['sugar', diabetesIcon],
  ['inflammation', inflammationIcon],
  ['sleep', sleepIcon],
  ['hormone', hormonesIcon],
  ['testosterone', hormonesIcon],
  ['estrogen', hormonesIcon],
  ['allerg', allergiesIcon],
  ['cardiac', cardiacIcon],
  ['heart', cardiacIcon],
  ['homa', homaIcon],
  ['insulin', insulinIcon],
  ['urine', urineIcon],
];

const getCategoryIcon = (name) => {
  const key = String(name || '').trim().toLowerCase();
  if (!key) {
    return liverIcon;
  }
  for (const [keyword, icon] of ORGAN_ICON_KEYWORDS) {
    if (key.includes(keyword)) {
      return icon;
    }
  }
  return liverIcon;
};

const ALL_CHIP = {
  filter_chip_id: 'all',
  chip_key: 'all',
  display_name: 'All',
  display_order: -1,
  chip_for: 'custom_package',
  status: 'active',
};

const toNumericPrice = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return 0;
  }

  return Math.round(numeric);
};

const normalizeTagList = (rawTags) => {
  if (!Array.isArray(rawTags)) {
    return [];
  }

  return rawTags
    .map((tag) => {
      if (typeof tag === 'string' || typeof tag === 'number') {
        return String(tag).trim();
      }

      if (tag && typeof tag === 'object') {
        return String(tag?.tag_name || tag?.name || tag?.filter_chip || '').trim();
      }

      return '';
    })
    .filter(Boolean);
};

const normalizeTests = (rawTests) => {
  if (!Array.isArray(rawTests)) {
    return [];
  }

  return rawTests
    .map((test) => {
      if (typeof test === 'string' || typeof test === 'number') {
        return String(test).trim();
      }

      if (test && typeof test === 'object') {
        return String(
          test?.test_name
          || test?.name
          || test?.parameter_name
          || test?.title
          || ''
        ).trim();
      }

      return '';
    })
    .filter(Boolean);
};

const normalizeGroupRow = (row, index) => {
  const title = String(
    row?.test_group_name
    || row?.group_name
    || row?.name
    || row?.title
    || `Test Group ${index + 1}`
  ).trim();

  const groupId = Number(row?.diagnostic_test_group_id ?? row?.test_group_id ?? row?.group_id ?? row?.id);
  const safeGroupId = Number.isFinite(groupId) && groupId > 0 ? groupId : null;
  const idValue = (safeGroupId ?? title) || index;
  const id = `test-group-${String(idValue).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || index}`;

  const salePrice = toNumericPrice(
    row?.sale_price
    ?? row?.discounted_price
    ?? row?.offer_price
    ?? row?.price
    ?? 0
  );
  const oldPriceCandidate = toNumericPrice(
    row?.old_price
    ?? row?.original_price
    ?? row?.mrp
    ?? row?.list_price
    ?? salePrice
  );

  const oldPrice = oldPriceCandidate >= salePrice ? oldPriceCandidate : salePrice;
  const tags = normalizeTagList(row?.tags ?? row?.filter_chips ?? row?.chips ?? []);

  const tests = normalizeTests(
    row?.tests
    ?? row?.diagnostic_tests
    ?? row?.parameters
    ?? row?.test_items
    ?? []
  );

  const rawCount = Number(
    row?.test_count
    ?? row?.tests_count
    ?? row?.parameter_count
    ?? row?.parameters_count
    ?? row?.num_tests
  );
  const parameterCount = Number.isFinite(rawCount) && rawCount > 0
    ? Math.round(rawCount)
    : tests.length;

  return {
    id,
    groupId: safeGroupId,
    title,
    salePrice,
    oldPrice,
    tags,
    tests,
    parameterCount,
    /** Skip expand-time fetch when the list endpoint already included parameters. */
    testsLoaded: tests.length > 0,
  };
};

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SearchIcon = ({ stroke = 'white' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 21L16.65 16.65" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M17 18C17.5304 18 18.0391 18.2107 18.4142 18.5858C18.7893 18.9609 19 19.4696 19 20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22C16.4696 22 15.9609 21.7893 15.5858 21.4142C15.2107 21.0391 15 20.5304 15 20C15 18.89 15.89 18 17 18ZM1 2H4.27L5.21 4H20C20.2652 4 20.5196 4.10536 20.7071 4.29289C20.8946 4.48043 21 4.73478 21 5C21 5.17 20.95 5.34 20.88 5.5L17.3 11.97C16.96 12.58 16.3 13 15.55 13H8.1L7.2 14.63L7.17 14.75C7.17 14.8163 7.19634 14.8799 7.24322 14.9268C7.29011 14.9737 7.3537 15 7.42 15H19V17H7C6.46957 17 5.96086 16.7893 5.58579 16.4142C5.21071 16.0391 5 15.5304 5 15C5 14.65 5.09 14.32 5.24 14.04L6.6 11.59L3 4H1V2ZM7 18C7.53043 18 8.03914 18.2107 8.41421 18.5858C8.78929 18.9609 9 19.4696 9 20C9 20.5304 8.78929 21.0391 8.41421 21.4142C8.03914 21.7893 7.53043 22 7 22C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20C5 18.89 5.89 18 7 18Z" fill="white" />
  </svg>
);

const ChevronDownIcon = ({ color = 'white' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M5 7.5L10 12.5L15 7.5" stroke={color} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronUpIcon = ({ color = 'white' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M15 12.5L10 7.5L5 12.5" stroke={color} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path d="M8.33268 2.5L3.74935 7.08333L1.66602 5" stroke="#90DF9E" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
    <circle cx="4" cy="4" r="4" fill="#90DF9E" />
  </svg>
);

const SummaryArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M12 10L8 6L4 10" stroke="#E6F6F4" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CloseCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="#8C9B99" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const formatMoney = (value) => `₹${value}/-`;

const normalizeFilterChips = (rows) => {
  const source = Array.isArray(rows) ? rows : [];

  const normalized = source
    .map((row, index) => {
      const chipKey = String(row?.chip_key || row?.key || '').trim();
      const displayName = String(row?.display_name || row?.name || chipKey).trim();

      if (!chipKey || !displayName) {
        return null;
      }

      const orderRaw = Number(row?.display_order);

      return {
        filter_chip_id: row?.filter_chip_id ?? row?.id ?? `${chipKey}-${index}`,
        chip_key: chipKey,
        display_name: displayName,
        display_order: Number.isFinite(orderRaw) ? orderRaw : null,
        chip_for: row?.chip_for || 'custom_package',
        status: row?.status || 'active',
      };
    })
    .filter(Boolean);

  return [ALL_CHIP, ...normalized];
};

const CreateCustomPackagePage = ({ onBack, onCreatePackage }) => {
  const [filterChips, setFilterChips] = useState([ALL_CHIP]);
  const [activeChipKey, setActiveChipKey] = useState('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState('');
  const [testLoadingById, setTestLoadingById] = useState({});

  const normalizedQuery = searchQuery.trim().toLowerCase();

  useEffect(() => {
    let isActive = true;

    const loadFilterChips = async () => {
      try {
        const rows = await listDiagnosticPackageFilterChips({
          accessToken: getAccessToken(),
        });

        if (!isActive) {
          return;
        }

        const nextChips = normalizeFilterChips(rows);
        setFilterChips(nextChips);
      } catch {
        if (!isActive) {
          return;
        }

        setFilterChips([ALL_CHIP]);
      }
    };

    loadFilterChips();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadGroups = async () => {
      try {
        setIsLoadingCategories(true);
        setCategoriesError('');

        const rows = await listDiagnosticTestGroups(
          activeChipKey === 'all' ? undefined : activeChipKey,
          {
          accessToken: getAccessToken(),
          }
        );
        const normalizedRows = (Array.isArray(rows) ? rows : [])
          .map((row, index) => normalizeGroupRow(row, index))
          .filter((row) => row.salePrice > 0);

        if (!isActive) {
          return;
        }

        // Paint groups immediately, then kick off a parallel pre-fetch of every group's
        // parameters so the "X parameters" count and the pills inside each card are
        // accurate from the moment the user lands on the page (no need to expand first).
        setCategoryData(normalizedRows);

        setExpandedIds((prev) => {
          const next = new Set(
            Array.from(prev).filter((id) => normalizedRows.some((row) => row.id === id))
          );
          return next;
        });

        setSelectedIds((prev) => {
          const next = new Set(
            Array.from(prev).filter((id) => normalizedRows.some((row) => row.id === id))
          );
          return next;
        });

        const idsToPrefetch = normalizedRows
          .filter((row) => row.groupId && !row.testsLoaded)
          .map((row) => row.id);

        if (idsToPrefetch.length > 0) {
          void fetchTestsForCategoryIds(idsToPrefetch, normalizedRows);
        }
      } catch (error) {
        if (!isActive) {
          return;
        }

        setCategoryData([]);
        setCategoriesError(error?.message || 'Failed to load tests. Please try again.');
      } finally {
        if (isActive) {
          setIsLoadingCategories(false);
        }
      }
    };

    loadGroups();

    return () => {
      isActive = false;
    };
    // `fetchTestsForCategoryIds` is stable for the duration of this effect; we only
    // want this to re-run when the active filter chip changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChipKey]);

  const visibleCategories = useMemo(() => {
    return categoryData.filter((category) => {
      if (!normalizedQuery) {
        return true;
      }

      const testText = category.tests.join(' ').toLowerCase();
      return category.title.toLowerCase().includes(normalizedQuery) || testText.includes(normalizedQuery);
    });
  }, [categoryData, normalizedQuery]);

  const selectedCategories = useMemo(() => {
    return categoryData.filter((item) => selectedIds.has(item.id));
  }, [categoryData, selectedIds]);

  const selectedCount = selectedCategories.length;
  const totalSale = selectedCategories.reduce((sum, item) => sum + item.salePrice, 0);
  const totalOld = selectedCategories.reduce((sum, item) => sum + item.oldPrice, 0);
  const selectedParameters = selectedCategories.reduce(
    (sum, item) => sum + (item.parameterCount || item.tests.length),
    0,
  );

  const selectedTokens = selectedCategories.map((item) => ({
    id: item.id,
    label: item.title.split(' ')[0],
  }));
  const visibleTokens = selectedTokens;

  const fetchTestsForCategoryIds = async (categoryIds, sourceCategories) => {
    const uniqueIds = Array.from(new Set((Array.isArray(categoryIds) ? categoryIds : []).filter(Boolean)));
    if (uniqueIds.length === 0) {
      return;
    }

    // `sourceCategories` lets the caller pass freshly-loaded rows (e.g. right after the
    // list endpoint resolves) so we don't have to wait for `categoryData` state to commit.
    const source = Array.isArray(sourceCategories) && sourceCategories.length > 0
      ? sourceCategories
      : categoryData;
    const categoriesToFetch = source.filter(
      (category) => uniqueIds.includes(category.id) && category.groupId && !category.testsLoaded && !testLoadingById[category.id]
    );

    if (categoriesToFetch.length === 0) {
      return;
    }

    const authPayload = { accessToken: getAccessToken() };

    setTestLoadingById((prev) => {
      const next = { ...prev };
      categoriesToFetch.forEach((category) => {
        next[category.id] = true;
      });
      return next;
    });

    const results = await Promise.all(
      categoriesToFetch.map(async (category) => {
        try {
          const rows = await listDiagnosticTestGroupTests(category.groupId, authPayload);
          return {
            id: category.id,
            tests: normalizeTests(rows),
          };
        } catch {
          return {
            id: category.id,
            tests: [],
          };
        }
      })
    );

    setCategoryData((prev) => prev.map((item) => {
      const result = results.find((entry) => entry.id === item.id);

      if (!result) {
        return item;
      }

      return {
        ...item,
        tests: result.tests.length > 0 ? result.tests : item.tests,
        testsLoaded: true,
      };
    }));

    setTestLoadingById((prev) => {
      const next = { ...prev };
      categoriesToFetch.forEach((category) => {
        delete next[category.id];
      });
      return next;
    });
  };

  const toggleExpanded = (id) => {
    const isOpening = !expandedIds.has(id);
    if (isOpening) {
      void fetchTestsForCategoryIds([id]);
    }

    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelected = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        // Pre-fetch parameters so the selected list / totals can show pills without expanding the card.
        void fetchTestsForCategoryIds([id]);
      }
      return next;
    });
  };

  const removeSelected = (id) => {
    setSelectedIds((prev) => {
      if (!prev.has(id)) {
        return prev;
      }

      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  return (
    <div className={`create-custom-page ${isSearchOpen ? 'create-custom-page--search-open' : ''} ${isViewAllOpen ? 'create-custom-page--view-all-open' : ''}`}>
      <div className="create-custom-page__fixed-top">
        <header className="create-custom-page__header">
          <div className="create-custom-page__header-left">
            <button type="button" className="create-custom-page__icon-btn" onClick={onBack} aria-label="Go back">
              <BackIcon />
            </button>
            <h1 className="create-custom-page__title">Custom Package</h1>
          </div>

          <div className="create-custom-page__header-actions">
            <button
              type="button"
              className="create-custom-page__icon-btn"
              onClick={() => setIsSearchOpen((prev) => !prev)}
              aria-label="Search"
            >
              <SearchIcon />
            </button>
            <button type="button" className="create-custom-page__icon-btn" aria-label="Open cart">
              <CartIcon />
            </button>
          </div>
        </header>

        <div className={`create-custom-page__search-row create-custom-page__search-row--animated ${isSearchOpen ? 'is-open' : ''}`} aria-hidden={!isSearchOpen}>
          <SearchIcon stroke="rgba(255, 255, 255, 0.72)" />
          <input
            type="text"
            className="create-custom-page__search-input"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search"
            aria-label="Search tests"
          />
        </div>

        <div className="create-custom-page__pills" role="tablist" aria-label="Category filters">
          {filterChips.map((chip) => {
            const isActive = chip.chip_key === activeChipKey;
            return (
              <button
                key={chip.filter_chip_id}
                type="button"
                className={`create-custom-page__pill ${isActive ? 'is-active' : ''}`}
                onClick={() => setActiveChipKey(chip.chip_key)}
                role="tab"
                aria-selected={isActive}
              >
                {chip.display_name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="create-custom-page__content">
        <div className="create-custom-page__cards">
          {isLoadingCategories ? (
            <article className="create-custom-page__card">
              <div className="create-custom-page__card-top">
                <div className="create-custom-page__card-info">
                  <p className="create-custom-page__card-title">Loading tests...</p>
                </div>
              </div>
            </article>
          ) : null}

          {!isLoadingCategories && categoriesError ? (
            <article className="create-custom-page__card">
              <div className="create-custom-page__card-top">
                <div className="create-custom-page__card-info">
                  <p className="create-custom-page__card-title">{categoriesError}</p>
                </div>
              </div>
            </article>
          ) : null}

          {!isLoadingCategories && !categoriesError && visibleCategories.length === 0 ? (
            <article className="create-custom-page__card">
              <div className="create-custom-page__card-top">
                <div className="create-custom-page__card-info">
                  <p className="create-custom-page__card-title">No tests found for this filter.</p>
                </div>
              </div>
            </article>
          ) : null}

          {visibleCategories.map((category) => {
            const isExpanded = expandedIds.has(category.id);
            const isSelected = selectedIds.has(category.id);
            const isTestsLoading = Boolean(testLoadingById[category.id]);
            const discount = category.oldPrice > 0
              ? Math.max(0, Math.round(((category.oldPrice - category.salePrice) / category.oldPrice) * 100))
              : 0;
            const parameterCount = category.parameterCount || category.tests.length;
            const categoryIcon = getCategoryIcon(category.title);

            return (
              <article
                key={category.id}
                className={`create-custom-page__card ${isSelected ? 'is-selected' : ''}`}
              >
                <div className="create-custom-page__card-top">
                  <div className="create-custom-page__card-heading">
                    <span className="create-custom-page__card-icon" aria-hidden="true">
                      <span
                        className="create-custom-page__card-icon-img"
                        style={{ '--card-icon-url': `url(${categoryIcon})` }}
                      />
                    </span>
                    <p className="create-custom-page__card-title">{category.title}</p>
                  </div>

                  <button
                    type="button"
                    className="create-custom-page__expand-btn"
                    aria-label={`Toggle details for ${category.title}`}
                    aria-expanded={isExpanded}
                    onClick={() => toggleExpanded(category.id)}
                  >
                    {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  </button>
                </div>

                {isExpanded ? (
                  <div className="create-custom-page__tests-grid">
                    {isTestsLoading ? (
                      <span className="create-custom-page__test-item">Loading tests...</span>
                    ) : null}
                    {!isTestsLoading && category.tests.length === 0 ? (
                      <span className="create-custom-page__test-item">No tests available</span>
                    ) : null}
                    {category.tests.map((test) => (
                      <span key={`${category.id}-${test}`} className="create-custom-page__test-item">
                        {test}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="create-custom-page__card-bottom">
                  <div className="create-custom-page__card-info">
                    <span className="create-custom-page__card-parameters">
                      {parameterCount} parameter{parameterCount === 1 ? '' : 's'}
                    </span>
                    <div className="create-custom-page__price-row">
                      <span className="create-custom-page__price-now">Rs. {category.salePrice}</span>
                      <span className="create-custom-page__price-old">Rs. {category.oldPrice}</span>
                      <span className="create-custom-page__price-off">{discount}% off</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`create-custom-page__add-btn ${isSelected ? 'is-added' : ''}`}
                    aria-pressed={isSelected}
                    onClick={() => toggleSelected(category.id)}
                  >
                    {isSelected ? (
                      <>
                        <span className="create-custom-page__add-btn-circle" aria-hidden="true">
                          <CheckIcon />
                        </span>
                        Added
                      </>
                    ) : (
                      'Add'
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <footer
        className="create-custom-page__summary"
        onWheel={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onTouchMove={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        {isViewAllOpen ? (
          <div className="create-custom-page__selected-list" aria-label="Selected tests">
            {selectedCategories.map((item) => (
              <article className="create-custom-page__selected-card" key={item.id}>
                <div className="create-custom-page__selected-card-top">
                  <h3 className="create-custom-page__selected-card-title">{item.title}</h3>
                  <div className="create-custom-page__selected-card-right">
                    <span className="create-custom-page__selected-card-price">{formatMoney(item.salePrice)}</span>
                    <button
                      type="button"
                      className="create-custom-page__selected-card-remove"
                      aria-label={`Remove ${item.title}`}
                      onClick={() => removeSelected(item.id)}
                    >
                      <CloseCircleIcon />
                    </button>
                  </div>
                </div>

                <div className="create-custom-page__selected-card-tests">
                  {testLoadingById[item.id] ? (
                    <span className="create-custom-page__selected-card-test">Loading tests...</span>
                  ) : null}
                  {!testLoadingById[item.id] && item.tests.length === 0 ? (
                    <span className="create-custom-page__selected-card-test">No tests available</span>
                  ) : null}
                  {item.tests.map((test) => (
                    <span className="create-custom-page__selected-card-test" key={`${item.id}-${test}`}>
                      <DotIcon />
                      {test}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="create-custom-page__summary-tags">
            {visibleTokens.map((token) => (
              <span className="create-custom-page__summary-tag" key={token.id}>
                {token.label}
                <button type="button" aria-label={`Remove ${token.label}`} onClick={() => removeSelected(token.id)}>
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="create-custom-page__summary-row">
          <div className="create-custom-page__summary-copy">
            <span className="create-custom-page__summary-selected">{selectedCount} selected</span>
            <span className="create-custom-page__summary-dot">•</span>
            <span className="create-custom-page__summary-total">{formatMoney(totalSale)}</span>
            <span className="create-custom-page__summary-old">{formatMoney(totalOld)}</span>
          </div>

          <button
            type="button"
            className="create-custom-page__view-all"
            onClick={() => {
              const isOpening = !isViewAllOpen;
              if (isOpening) {
                void fetchTestsForCategoryIds(Array.from(selectedIds));
              }
              setIsViewAllOpen((prev) => !prev);
            }}
          >
            <span>View All</span>
            <SummaryArrowIcon />
          </button>
        </div>

        <button
          type="button"
          className="create-custom-page__create-btn"
          onClick={() => {
            if (onCreatePackage) {
              const offPercent = totalOld > 0 ? Math.max(0, Math.round(((totalOld - totalSale) / totalOld) * 100)) : 0;
              onCreatePackage({
                selectedCount,
                selectedParameters,
                selectedTests: selectedCategories.map((item) => item.title),
                totalSale,
                totalOld,
                offText: offPercent > 0 ? `${offPercent}% OFF` : '',
              });
            }
          }}
        >
          Create Package
        </button>
      </footer>
    </div>
  );
};

export default CreateCustomPackagePage;
