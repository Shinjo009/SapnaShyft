import packageGenderFemaleIcon from '../images/PackagesPage/Female icon.svg';
import packageGenderMaleIcon from '../images/PackagesPage/Male icon.svg';

const normalizeUrl = (value) => {
  const text = String(value || '').trim();
  return text.length > 0 ? text : null;
};

export const getPackageGenderSuitability = (pkg) => {
  const apiPkg = pkg?.apiData && typeof pkg.apiData === 'object' ? pkg.apiData : pkg;
  const gender = String(apiPkg?.gender_suitability || '').trim().toLowerCase();

  if (gender === 'male' || gender === 'female') {
    return gender;
  }

  return null;
};

const FALLBACK_GENDER_ICONS = {
  male: packageGenderMaleIcon,
  female: packageGenderFemaleIcon,
};

export const getPackageGenderIconSrc = (pkg) => {
  const gender = getPackageGenderSuitability(pkg);
  if (!gender) {
    return null;
  }

  const apiPkg = pkg?.apiData && typeof pkg.apiData === 'object' ? pkg.apiData : pkg;
  const apiIcon = normalizeUrl(
    apiPkg?.gender_icon_url
    || apiPkg?.gender_icon
    || (gender === 'male' ? apiPkg?.male_icon_url : null)
    || (gender === 'female' ? apiPkg?.female_icon_url : null),
  );

  if (apiIcon) {
    return apiIcon;
  }

  return FALLBACK_GENDER_ICONS[gender] || null;
};
