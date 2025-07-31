import { Gem } from 'lucide-react'

interface TitleProps {
  collapsed?: boolean
}

export function Title({ collapsed }: TitleProps) {
  return (
    <div
      style={{
        color: '#0F4D0F', // equivalent to Tailwind's text-green-600
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.5rem',
      }}
    >
      {!collapsed && (
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
          <p style={{ fontSize: '1.125rem', fontWeight: 'bold', margin: 0 }}>
            Fiscal
          </p>
        </h1>
      )}
      <span style={{ animation: 'pulse 2s infinite' }}>
        <Gem />
      </span>

      {/* Add keyframes manually since there's no Tailwind: */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        span[style*="animation: pulse"] {
          display: inline-block;
        }
      `}</style>
    </div>
  )
}
