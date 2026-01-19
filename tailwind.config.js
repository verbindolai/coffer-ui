/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#08080c',
        'bg-secondary': '#0f0f14',
        'bg-tertiary': '#16161e',
        'bg-elevated': '#0f0f14',
        'bg-card': 'rgba(255, 255, 255, 0.02)',
        'text-primary': 'rgba(255, 255, 255, 0.95)',
        'text-secondary': 'rgba(255, 255, 255, 0.6)',
        'text-muted': 'rgba(255, 255, 255, 0.4)',
        'accent': '#00d4aa',
        'accent-muted': 'rgba(0, 212, 170, 0.1)',
        'accent-gold': '#F7931A',
        'accent-gold-dim': 'rgba(247, 147, 26, 0.15)',
        'accent-teal': '#14B8A6',
        'accent-emerald': '#10B981',
        'accent-cyan': '#00D9FF',
        'positive': '#22C55E',
        'negative': '#EF4444',
        'border-subtle': 'rgba(255, 255, 255, 0.06)',
        'border-medium': 'rgba(255, 255, 255, 0.1)',
        'border-active': 'rgba(255, 255, 255, 0.15)',
      },
      fontFamily: {
        'sans': ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs': ['0.72rem', { lineHeight: '1.2' }],
        'sm': ['0.8rem', { lineHeight: '1.4' }],
        'base': ['0.875rem', { lineHeight: '1.5' }],
        'lg': ['1rem', { lineHeight: '1.5' }],
        'xl': ['1.125rem', { lineHeight: '1.4' }],
        '2xl': ['1.35rem', { lineHeight: '1.3' }],
        '3xl': ['1.6rem', { lineHeight: '1.2' }],
      },
      borderRadius: {
        'DEFAULT': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.03) inset',
        'gold-glow': '0 0 20px rgba(247, 147, 26, 0.35)',
        'cyan-glow': '0 0 12px rgba(0, 217, 255, 0.5)',
        'emerald-glow': '0 0 16px rgba(16, 185, 129, 0.5)',
      },
      backdropBlur: {
        'xs': '4px',
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
      },
    },
  },
  plugins: [],
}
