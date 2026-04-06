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
        dateRanges: [{ startDate: '365daysAgo', endDate: 'today' }],
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
         // YYYYMMDD -> YYYY-MM-DD
         const formattedDate = dateStr.length === 8
           ? `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`
           : dateStr;
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

    if (type === 'monthly') {
      const year = parseInt(new URL(request.url).searchParams.get('year') || String(new Date().getFullYear()));
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'yearMonth' }],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'totalUsers' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' }
        ],
        orderBys: [{ dimension: { dimensionName: 'yearMonth' }, desc: false }]
      });

      const monthlyData = response.rows?.map(row => {
        const ym = row.dimensionValues?.[0].value || '';
        // YYYYMM -> YYYY-MM
        const formattedDate = ym.length === 6
          ? `${ym.substring(0, 4)}-${ym.substring(4, 6)}`
          : ym;
        return {
          date: formattedDate,
          views: parseInt(row.metricValues?.[0].value || '0'),
          visitors: parseInt(row.metricValues?.[1].value || '0'),
          bounceRate: parseFloat(row.metricValues?.[2].value || '0') * 100,
          avgSessionDuration: parseFloat(row.metricValues?.[3].value || '0')
        };
      }) || [];

      return NextResponse.json({ monthlyData });
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
        
        // source / medium 한글 변환
        const sourceLabel = (() => {
          const raw = source.toLowerCase();
          const [src, med] = raw.split(' / ').map((s: string) => s.trim());

          // 직접 유입
          if (src === '(direct)' || med === '(none)') return '직접 유입 (URL 입력 등)';
          // not set
          if (src === '(not set)' || raw === '(not set)') return '기타';

          // 소스별 한글명
          const sourceMap: Record<string, string> = {
            'google': 'Google',
            'naver': '네이버',
            'daum': '다음',
            'bing': '빙',
            'yahoo': '야후',
            'instagram': 'Instagram',
            'ig': 'Instagram',
            'facebook': 'Facebook',
            'facebook.com': 'Facebook',
            'youtube': 'YouTube',
            'youtube.com': 'YouTube',
            'kakao': '카카오',
            'kakaotalk': '카카오톡',
            'twitter': 'Twitter',
            't.co': 'Twitter',
            'linkedin': 'LinkedIn',
            'tiktok': 'TikTok',
            'band': '밴드',
            'blog.naver.com': '네이버 블로그',
            'cafe.naver.com': '네이버 카페',
          };

          // 매체별 한글명
          const mediumMap: Record<string, string> = {
            'organic': '자연검색',
            'cpc': '검색광고 (CPC)',
            'paid': '유료광고',
            'paid search': '유료검색',
            'paid social': '유료SNS',
            'referral': '링크 유입',
            'social': 'SNS',
            'email': '이메일',
            'display': '디스플레이광고',
            'affiliate': '제휴',
            'video': '동영상',
            'push': '푸시알림',
          };

          const srcName = sourceMap[src] || source.split(' / ')[0];
          const medName = mediumMap[med] || (med && med !== '(none)' ? med : '');

          return medName ? `${srcName} (${medName})` : srcName;
        })();
        source = sourceLabel;

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
         if (!kw || kw === '(not set)' || kw === '(none)') return false;
         // 순수 숫자로만 된 광고 ID 필터링 (6자리 이상)
         if (/^\d{6,}$/.test(kw)) return false;
         return true;
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
