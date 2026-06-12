import { orderHomeBloodMarkersByHierarchy } from './homeBloodMarkerOrder';

const marker = (id, riskKey, profile) => ({
  id,
  riskKey,
  disease: profile,
  profile,
});

describe('orderHomeBloodMarkersByHierarchy', () => {
  it('shows one high from each profile up to the limit', () => {
    const markers = [
      marker('iron-1', 'high', 'Iron'),
      marker('iron-2', 'high', 'Iron'),
      marker('thyroid-1', 'high', 'Thyroid'),
      marker('liver-1', 'high', 'Liver'),
    ];

    const ordered = orderHomeBloodMarkersByHierarchy(markers, 3);

    expect(ordered.map((item) => item.id)).toEqual(['iron-1', 'thyroid-1', 'liver-1']);
  });

  it('fills with lower-risk markers only after higher tiers and never repeats a profile', () => {
    const markers = [
      marker('liver-1', 'high', 'Liver'),
      marker('liver-2', 'high', 'Liver'),
      marker('thyroid-low', 'low', 'Thyroid'),
      marker('iron-optimal', 'optimal', 'Iron'),
    ];

    const ordered = orderHomeBloodMarkersByHierarchy(markers, 3);

    expect(ordered.map((item) => item.id)).toEqual(['liver-1', 'thyroid-low', 'iron-optimal']);
  });

  it('does not show two markers from the same profile', () => {
    const markers = [
      marker('mono-low', 'low', 'Complete Hemogram'),
      marker('albumin-optimal', 'optimal', 'Liver'),
      marker('globulin-optimal', 'optimal', 'Liver'),
    ];

    const ordered = orderHomeBloodMarkersByHierarchy(markers, 3);

    expect(ordered.map((item) => item.id)).toEqual(['mono-low', 'albumin-optimal']);
  });
});
