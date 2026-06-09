import { orderHomeBloodMarkersByHierarchy } from './homeBloodMarkerOrder';

const marker = (id, riskKey, profile) => ({
  id,
  riskKey,
  disease: profile,
  profile,
});

describe('orderHomeBloodMarkersByHierarchy', () => {
  it('shows one high from each profile before taking a second high from any profile', () => {
    const markers = [
      marker('iron-1', 'high', 'Iron'),
      marker('iron-2', 'high', 'Iron'),
      marker('thyroid-1', 'high', 'Thyroid'),
      marker('thyroid-2', 'high', 'Thyroid'),
      marker('liver-1', 'high', 'Liver'),
      marker('liver-2', 'high', 'Liver'),
    ];

    const ordered = orderHomeBloodMarkersByHierarchy(markers).slice(0, 3);

    expect(ordered.map((item) => item.id)).toEqual(['iron-1', 'thyroid-1', 'liver-1']);
  });

  it('shows all highs from a single profile before any lower-risk markers', () => {
    const markers = [
      marker('liver-1', 'high', 'Liver'),
      marker('liver-2', 'high', 'Liver'),
      marker('liver-3', 'high', 'Liver'),
      marker('thyroid-low', 'low', 'Thyroid'),
      marker('iron-optimal', 'optimal', 'Iron'),
    ];

    const ordered = orderHomeBloodMarkersByHierarchy(markers).slice(0, 3);

    expect(ordered.map((item) => item.id)).toEqual(['liver-1', 'liver-2', 'liver-3']);
  });

  it('keeps lower-risk markers after all high-risk markers', () => {
    const markers = [
      marker('liver-1', 'high', 'Liver'),
      marker('thyroid-low', 'low', 'Thyroid'),
      marker('iron-optimal', 'optimal', 'Iron'),
    ];

    const ordered = orderHomeBloodMarkersByHierarchy(markers);

    expect(ordered.map((item) => item.id)).toEqual(['liver-1', 'thyroid-low', 'iron-optimal']);
  });
});
