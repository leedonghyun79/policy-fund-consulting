import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const alt = '비티씨 | 정책자금 컨설팅'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Actual SVG Logo scaled up */}
        <div style={{ display: 'flex', width: '280px', height: '280px', marginRight: '60px' }}>
          <svg width="280" height="280" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#1E40AF"/>
            <path d="M9 7H16.5C18.9853 7 21 9.01472 21 11.5C21 13.9853 18.9853 16 16.5 16H9V7Z" fill="white"/>
            <path d="M9 16H18.5C20.9853 16 23 18.0147 23 20.5C23 22.9853 20.9853 25 18.5 25H9V16Z" fill="white"/>
            <path d="M11 11H15V13H11V11Z" fill="#1E40AF"/>
            <path d="M11 19H17V21H11V19Z" fill="#1E40AF"/>
            <rect x="23" y="5" width="4" height="12" rx="1" fill="#3B82F6"/>
            <path d="M21 12L25 4L29 12H21Z" fill="#60A5FA"/>
          </svg>
        </div>

        {/* Brand Text */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '110px', fontWeight: 900, color: '#1E40AF', letterSpacing: '-4px', lineHeight: 1.1 }}>
            비티씨
          </div>
          <div style={{ fontSize: '54px', fontWeight: 700, color: '#374151', marginTop: '10px', letterSpacing: '-1px' }}>
            정책자금 컨설팅센터
          </div>
        </div>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
