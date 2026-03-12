import { post } from './authService';
import { SIGNUP_BEARER_TOKEN } from '../config/appConfig';

const formatDate = (date) => date.toISOString().split('T')[0];

const getDateOfBirthFromAge = (ageValue) => {
  const age = Number.parseInt(ageValue, 10);

  if (Number.isNaN(age) || age <= 0) {
    return undefined;
  }

  const today = new Date();
  const dateOfBirth = new Date(today.getFullYear() - age, today.getMonth(), today.getDate());

  return formatDate(dateOfBirth);
};

export const buildCreateUserPayload = (formData) => ({
  first_name: formData.firstName.trim(),
  last_name: formData.lastName.trim(),
  phone: formData.phone.trim(),
  email: formData.email.trim(),
  date_of_birth: getDateOfBirthFromAge(formData.age),
  gender: formData.gender.trim(),
  city: formData.city.trim(),
  referred_by: formData.organization?.trim() || undefined,
  status: 'active',
});

export const createUser = (formData) => {
  const headers = SIGNUP_BEARER_TOKEN
    ? { Authorization: `Bearer ${SIGNUP_BEARER_TOKEN}` }
    : {};

  return post('/users', buildCreateUserPayload(formData), headers);
};
