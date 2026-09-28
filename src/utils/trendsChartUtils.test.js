import {
  bloodParameterTrendSeries,
  indexAllBloodParameterTrends,
} from './trendsChartUtils';

describe('indexAllBloodParameterTrends', () => {
  const payload = {
    data: [
      {
        date: '2026-07-10',
        engagement_id: 4862,
        data_points: [
          { parameter: 'triglycerides', unit: 'mg/dL', value: 62.3 },
          { parameter: 'haemoglobin', unit: 'g/dL', value: 13.4 },
        ],
      },
      {
        date: '2026-07-09',
        engagement_id: 4861,
        data_points: [
          { parameter: 'ldl/hdl_cholestrol', unit: 'Ratio', value: 2.56 },
          { parameter: 'triglycerides', unit: 'mg/dL', value: 58.5 },
          { parameter: 'haemoglobin', unit: 'g/dL', value: 12.8 },
        ],
      },
    ],
    meta: { is_stale: false },
  };

  it('groups every parameter across engagements in date order', () => {
    const indexed = indexAllBloodParameterTrends(payload);

    expect(bloodParameterTrendSeries(indexed, 'triglycerides')).toEqual({
      parameter: 'triglycerides',
      unit: 'mg/dL',
      points: [
        { date: '2026-07-09', value: 58.5, engagementId: 4861 },
        { date: '2026-07-10', value: 62.3, engagementId: 4862 },
      ],
    });
    expect(bloodParameterTrendSeries(indexed, 'ldl/hdl_cholestrol')?.points).toEqual([
      { date: '2026-07-09', value: 2.56, engagementId: 4861 },
    ]);
  });

  it('looks up a Healthians card key through the Metsights alias', () => {
    const indexed = indexAllBloodParameterTrends(payload);

    expect(bloodParameterTrendSeries(indexed, 'Hemoglobin')?.points).toEqual([
      { date: '2026-07-09', value: 12.8, engagementId: 4861 },
      { date: '2026-07-10', value: 13.4, engagementId: 4862 },
    ]);
  });

  it('returns an empty index when there are no engagements', () => {
    expect(indexAllBloodParameterTrends({ data: [] })).toEqual({});
    expect(bloodParameterTrendSeries({}, 'albumin')).toBeNull();
  });
});
