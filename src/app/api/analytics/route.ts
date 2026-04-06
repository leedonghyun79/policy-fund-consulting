import { NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const propertyId = process.env.GA_PROPERTY_ID;
const privateKey = process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n');

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GA_CLIENT_EMAIL,
    private_key: privateKey,
  },
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';

    if (!propertyId || !privateKey) {
      return NextResponse.json({ error: 'GA credentials not configured' }, { status: 500 });
    }

    if (type === 'overview') {
      const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'totalUsers' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' }
        ],
        orderBys: [{ dimension: { dimensionName: 'date' }, desc: true }]
      });

      const rawVisitorData = response.rows?.map(row => {
         const dateStr = row.dimensionValues?.[0].value || '';
         const formattedDate = dateStr.length === 8 ? `${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}` : dateStr;
         return {
           date: formattedDate,
           views: parseInt(row.metricValues?.[0].value || '0'),
           visitors: parseInt(row.metricValues?.[1].value || '0'),
           bounceRate: parseFloat(row.metricValues?.[2].value || '0') * 100,
           avgSessionDuration: parseFloat(row.metricValues?.[3].value || '0')
         };
      }) || [];

      const visitorData = rawVisitorData.reverse();
      return NextResponse.json({ visitorData });
    }

    if (type === 'referrers') {
      const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'sessionSourceMedium' }],
        metrics: [{ name: 'sessions' }, { name: 'bounceRate' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 50
      });

      const totalSessions = response.rows?.reduce((acc, row) => acc + parseInt(row.metricValues?.[0].value || '0'), 0) || 1;

      const referrerSites = response.rows?.map(row => {
        let source = row.dimensionValues?.[0].value || '직접 유입(URL 입력 등)';
        
        // (direct) / (none) 또는 유사한 이름을 한글로 변환
        if (source === '(direct) / (none)' || source === 'Direct' || source === '(none)') {
          source = '직접 유입(URL 입력 등)';
        } else if (source === '(not set)') {
          source = '분류 중(데이터 수집 중)';
        }

        const sessions = parseInt(row.metricValues?.[0].value || '0');
        const bounceRate = parseFloat(row.metricValues?.[1].value || '0') * 100;
        const rate = totalSessions > 0 ? ((sessions / totalSessions) * 100).toFixed(1) + '%' : '0%';
        
        return {
          site: source,
          views: sessions,
          rate,
          bounceRate: bounceRate.toFixed(1) + '%'
        };
      }) || [];

      return NextResponse.json({ referrerSites });
    }

    if (type === 'keywords') {
      const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'sessionManualTerm' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 50
      });

      const keywords = response.rows?.filter(row => {
         const kw = row.dimensionValues?.[0].value;
         return kw && kw !== '(not set)' && kw !== '(none)';
      }).map(row => {
         return {
           keyword: row.dimensionValues?.[0].value || 'Unknown',
           clicks: parseInt(row.metricValues?.[0].value || '0')
         };
      }) || [];

      return NextResponse.json({ keywords });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

  } catch (error: any) {
    console.error('GA Data Fetch Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
