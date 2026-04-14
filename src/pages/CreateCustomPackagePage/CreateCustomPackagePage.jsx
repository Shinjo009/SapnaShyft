import React, { useEffect, useMemo, useState } from 'react';
import './CreateCustomPackagePage.css';
import {
  listDiagnosticPackageFilterChips,
  listDiagnosticTestGroupTests,
  listDiagnosticTestGroups,
} from '../../services/diagnosticPackagesService';
import { getAccessToken } from '../../utils/authStorage';

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

  return {
    id,
    groupId: safeGroupId,
    title,
    salePrice,
    oldPrice,
    tags,
    tests,
    testsLoaded: false,
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
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="11" viewBox="0 0 15 11" fill="none" aria-hidden="true">
    <path d="M13.9154 0.583374L4.7487 9.75004L0.582031 5.58337" stroke="#90DF9E" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
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

const PopupCloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="#8C9B99" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CloseCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="#8C9B99" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AiCenterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
    <path d="M17.5506 18.5788L16.4431 22.4525C16.0281 23.9025 13.9731 23.9025 13.5581 22.4525L12.4519 18.5788C12.3818 18.3337 12.2505 18.1106 12.0703 17.9303C11.8901 17.7501 11.6669 17.6188 11.4219 17.5488L7.54813 16.4425C6.09813 16.0275 6.09813 13.9725 7.54813 13.5575L11.4219 12.4513C11.6669 12.3812 11.8901 12.2499 12.0703 12.0697C12.2505 11.8895 12.3818 11.6663 12.4519 11.4213L13.5581 7.54751C13.9731 6.09751 16.0281 6.09751 16.4431 7.54751L17.5494 11.4213C17.6194 11.6663 17.7507 11.8895 17.931 12.0697C18.1112 12.2499 18.3343 12.3812 18.5794 12.4513L22.4531 13.5575C23.9031 13.9725 23.9031 16.0275 22.4531 16.4425L18.5794 17.5488C18.3343 17.6188 18.1112 17.7501 17.931 17.9303C17.7507 18.1106 17.6194 18.3337 17.5494 18.5788M24.4631 24.645L23.9931 26.53C23.9306 26.7825 23.5719 26.7825 23.5081 26.53L23.0369 24.645C23.0258 24.6013 23.0032 24.5613 22.9712 24.5294C22.9393 24.4975 22.8994 24.4748 22.8556 24.4638L20.9706 23.9925C20.7181 23.93 20.7181 23.5713 20.9706 23.5075L22.8556 23.0363C22.8994 23.0252 22.9393 23.0025 22.9712 22.9706C23.0032 22.9387 23.0258 22.8988 23.0369 22.855L23.5081 20.97C23.5706 20.7175 23.9294 20.7175 23.9931 20.97L24.4644 22.855C24.4754 22.8988 24.4981 22.9387 24.53 22.9706C24.5619 23.0025 24.6019 23.0252 24.6456 23.0363L26.5306 23.5075C26.7831 23.57 26.7831 23.9288 26.5306 23.9925L24.6456 24.4638C24.6019 24.4748 24.5619 24.4975 24.53 24.5294C24.4981 24.5613 24.4742 24.6013 24.4631 24.645ZM6.96313 7.14501L6.49312 9.03001C6.43062 9.28251 6.07063 9.28251 6.00813 9.03001L5.53687 7.14501C5.52584 7.10126 5.50316 7.0613 5.47125 7.02939C5.43934 6.99748 5.39938 6.9748 5.35562 6.96376L3.47063 6.49251C3.21812 6.43001 3.21812 6.07001 3.47063 6.00751L5.35562 5.53626C5.39938 5.52523 5.43934 5.50255 5.47125 5.47064C5.50316 5.43873 5.52584 5.39877 5.53687 5.35501L6.00813 3.47001C6.07063 3.21751 6.43062 3.21751 6.49312 3.47001L6.96438 5.35501C6.97541 5.39877 6.99809 5.43873 7.03 5.47064C7.06191 5.50255 7.10187 5.52523 7.14563 5.53626L9.03063 6.00751C9.28313 6.07001 9.28313 6.43001 9.03063 6.49251L7.14563 6.96376C7.10187 6.9748 7.06191 6.99748 7.03 7.02939C6.99809 7.0613 6.97416 7.10126 6.96313 7.14501Z" stroke="url(#ai-gradient-ccp)" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="ai-gradient-ccp" x1="15.0006" y1="3.28064" x2="15.0006" y2="26.7194" gradientUnits="userSpaceOnUse">
        <stop stopColor="#435FF6" />
        <stop offset="1" stopColor="#14AFAF" />
      </linearGradient>
    </defs>
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
  const [isAiPopupOpen, setIsAiPopupOpen] = useState(false);
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
          .map((row, index) => normalizeGroupRow(row, index));

        if (!isActive) {
          return;
        }

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
          if (next.size === 0 && normalizedRows[0]?.id) {
            next.add(normalizedRows[0].id);
          }
          return next;
        });
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
  const selectedParameters = selectedCategories.reduce((sum, item) => sum + item.tests.length, 0);

  const selectedTokens = selectedCategories.map((item) => ({
    id: item.id,
    label: item.title.split(' ')[0],
  }));
  const visibleTokens = selectedTokens;

  const fetchTestsForCategoryIds = async (categoryIds) => {
    const uniqueIds = Array.from(new Set((Array.isArray(categoryIds) ? categoryIds : []).filter(Boolean)));
    if (uniqueIds.length === 0) {
      return;
    }

    const categoriesToFetch = categoryData.filter(
      (category) => uniqueIds.includes(category.id) && category.groupId && !testLoadingById[category.id]
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

  const handleExploreSuggestedTests = () => {
    // AI suggestions currently point users to liver-related tests, which are under General health.
    setActiveChipKey('general_health');
    setSearchQuery('Liver');
    setIsSearchOpen(true);
    setIsAiPopupOpen(false);
  };

  return (
    <div className={`create-custom-page ${isSearchOpen ? 'create-custom-page--search-open' : ''} ${isAiPopupOpen ? 'create-custom-page--ai-open' : ''} ${isViewAllOpen ? 'create-custom-page--view-all-open' : ''}`}>
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

        {isSearchOpen ? (
          <div className="create-custom-page__search-row">
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
        ) : null}

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

            return (
              <article
                key={category.id}
                className={`create-custom-page__card ${isSelected ? 'is-selected' : ''}`}
              >
                <div className="create-custom-page__card-top">
                  <button
                    type="button"
                    className={`create-custom-page__checkbox ${isSelected ? 'is-selected' : ''}`}
                    aria-label={`Select ${category.title}`}
                    onClick={() => toggleSelected(category.id)}
                  >
                    {isSelected ? <CheckIcon /> : null}
                  </button>

                  <div className="create-custom-page__card-info">
                    <p className="create-custom-page__card-title">{category.title}</p>
                    <div className="create-custom-page__price-row">
                      <span className="create-custom-page__price-now">Rs. {category.salePrice}</span>
                      <span className="create-custom-page__price-old">Rs. {category.oldPrice}</span>
                      <span className="create-custom-page__price-off">{discount}% off</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="create-custom-page__expand-btn"
                    aria-label={`Toggle details for ${category.title}`}
                    onClick={() => toggleExpanded(category.id)}
                  >
                    {isExpanded ? (
                      <ChevronUpIcon color={isSelected ? '#90DF9E' : 'white'} />
                    ) : (
                      <ChevronDownIcon color={isSelected ? '#90DF9E' : 'white'} />
                    )}
                  </button>
                </div>

                {isExpanded ? (
                  <>
                    <div className="create-custom-page__divider" aria-hidden="true" />
                    <div className="create-custom-page__tests-grid">
                      {isTestsLoading ? (
                        <span className="create-custom-page__test-item">Loading tests...</span>
                      ) : null}
                      {!isTestsLoading && category.tests.length === 0 ? (
                        <span className="create-custom-page__test-item">No tests available</span>
                      ) : null}
                      {category.tests.map((test) => (
                        <span key={`${category.id}-${test}`} className="create-custom-page__test-item">
                          {isSelected ? <DotIcon /> : null}
                          {test}
                        </span>
                      ))}
                    </div>
                  </>
                ) : null}
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
        {!isViewAllOpen ? (
          <button
            className="create-custom-page__ai-fab"
            type="button"
            aria-label="AI assistant"
            onClick={() => setIsAiPopupOpen(true)}
          >
            <AiCenterIcon />
          </button>
        ) : null}

        {isAiPopupOpen && !isViewAllOpen ? (
          <section className="create-custom-page__ai-popup" aria-label="AI Suggested Tests">
            <div className="create-custom-page__ai-popup-header">
              <div className="create-custom-page__ai-popup-left">
                <span className="create-custom-page__ai-popup-iconbox" aria-hidden="true">
                  <AiCenterIcon />
                </span>
                <h3 className="create-custom-page__ai-popup-title">AI Suggested Tests</h3>
              </div>

              <button
                type="button"
                className="create-custom-page__ai-popup-close"
                aria-label="Close AI suggestions"
                onClick={() => setIsAiPopupOpen(false)}
              >
                <PopupCloseIcon />
              </button>
            </div>

            <div className="create-custom-page__ai-popup-points">
              {[1, 2].map((item) => (
                <p className="create-custom-page__ai-popup-point" key={item}>
                  <span className="create-custom-page__ai-popup-dot" aria-hidden="true" />
                  <span className="create-custom-page__ai-popup-label">Liver Test</span>
                  <span className="create-custom-page__ai-popup-copy"> - Your Liver markers were at high risk in previous Bio-AI Report</span>
                </p>
              ))}
            </div>

            <button type="button" className="create-custom-page__ai-popup-btn" onClick={handleExploreSuggestedTests}>Explore Tests</button>
          </section>
        ) : null}

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
                setIsAiPopupOpen(false);
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
