const hacIconContext = require.context('../images', false, /_HAC\.svg$/);

const HAC_ICON_SRC_BY_KEY = {};

hacIconContext.keys().forEach((relativePath) => {
  const fileName = relativePath.replace('./', '');
  const baseName = fileName.replace(/\.svg$/i, '');
  HAC_ICON_SRC_BY_KEY[baseName.toLowerCase()] = hacIconContext(relativePath);
});

const normalizeIconKey = (value) => {
  let key = String(value || '').trim();
  if (!key) {
    return '';
  }

  key = key.split('/').pop() || key;
  key = key.replace(/\.svg$/i, '');

  if (!/_HAC$/i.test(key)) {
    key = `${key}_HAC`;
  }

  return key;
};

const iconKeyToLabel = (iconKey) => {
  const base = normalizeIconKey(iconKey).replace(/_HAC$/i, '');
  if (!base) {
    return '';
  }

  return base
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .trim();
};

const toHealthAreaEntry = (entry, index) => {
  if (typeof entry === 'string' || typeof entry === 'number') {
    const raw = String(entry).trim();
    if (!raw) {
      return null;
    }

    if (raw.includes(':')) {
      const separatorIndex = raw.indexOf(':');
      const label = raw.slice(0, separatorIndex).trim();
      const iconKey = normalizeIconKey(raw.slice(separatorIndex + 1));
      if (!iconKey) {
        return null;
      }

      return {
        id: iconKey.toLowerCase(),
        label: label || iconKeyToLabel(iconKey),
        iconKey,
      };
    }

    const iconKey = normalizeIconKey(raw);
    if (!iconKey) {
      return null;
    }

    const looksLikeIconKey = /_HAC$/i.test(iconKey) || /^[A-Za-z0-9]+$/.test(raw.replace(/\.svg$/i, ''));
    if (!looksLikeIconKey && raw.includes(' ')) {
      return null;
    }

    return {
      id: iconKey.toLowerCase(),
      label: iconKeyToLabel(iconKey),
      iconKey,
    };
  }

  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const iconKey = normalizeIconKey(
    entry.icon_key
    ?? entry.iconKey
    ?? entry.icon
    ?? entry.file
    ?? entry.slug
    ?? entry.key
    ?? '',
  );

  if (!iconKey) {
    return null;
  }

  const label = String(
    entry.label
    ?? entry.name
    ?? entry.display_name
    ?? entry.title
    ?? '',
  ).trim() || iconKeyToLabel(iconKey);

  return {
    id: String(entry.id || iconKey).toLowerCase(),
    label,
    iconKey,
  };
};

export const parseHealthAreasCovered = (raw) => {
  if (raw == null || raw === '') {
    return [];
  }

  if (Array.isArray(raw)) {
    return raw
      .map((entry, index) => toHealthAreaEntry(entry, index))
      .filter(Boolean);
  }

  const trimmed = String(raw).trim();
  if (!trimmed) {
    return [];
  }

  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((entry, index) => toHealthAreaEntry(entry, index))
          .filter(Boolean);
      }
      if (parsed && typeof parsed === 'object') {
        const fromObject = toHealthAreaEntry(parsed, 0);
        return fromObject ? [fromObject] : [];
      }
    } catch {
      // Fall through to delimiter parsing.
    }
  }

  if (/[,|;]/.test(trimmed)) {
    return trimmed
      .split(/[,|;]+/)
      .map((part) => part.trim())
      .filter(Boolean)
      .map((entry, index) => toHealthAreaEntry(entry, index))
      .filter(Boolean);
  }

  const single = toHealthAreaEntry(trimmed, 0);
  return single ? [single] : [];
};

export const getHacIconSrc = (iconKey) => {
  const normalized = normalizeIconKey(iconKey).toLowerCase();
  return HAC_ICON_SRC_BY_KEY[normalized] || null;
};

export const mapHealthAreasForDisplay = (raw) => (
  parseHealthAreasCovered(raw)
    .map((area) => ({
      id: area.id,
      label: area.label,
      iconSrc: getHacIconSrc(area.iconKey),
    }))
    .filter((area) => area.label && area.iconSrc)
);
