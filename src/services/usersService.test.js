import { buildCreateUserPayload } from './usersService';

describe('buildCreateUserPayload', () => {
  it('includes a numeric age for the users create endpoint', () => {
    const payload = buildCreateUserPayload({
      firstName: '  Jane ',
      lastName: ' Doe  ',
      phone: ' 9876543210 ',
      email: ' jane@example.com ',
      age: '29',
      gender: ' female ',
      city: ' Bengaluru ',
      organization: ' ENG123 ',
    });

    expect(payload).toMatchObject({
      age: 29,
      first_name: 'Jane',
      last_name: 'Doe',
      phone: '9876543210',
      email: 'jane@example.com',
      gender: 'female',
      city: 'Bengaluru',
      referred_by: 'ENG123',
      status: 'active',
    });
    expect(payload.date_of_birth).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('omits age and date_of_birth when age is invalid', () => {
    const payload = buildCreateUserPayload({
      firstName: 'Jane',
      lastName: 'Doe',
      phone: '9876543210',
      email: 'jane@example.com',
      age: '0',
      gender: 'female',
      city: 'Bengaluru',
    });

    expect(payload.age).toBeUndefined();
    expect(payload.date_of_birth).toBeUndefined();
  });
});