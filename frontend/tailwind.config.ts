import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: '#E2E8F0',
        card: '#FFFFFF',
        muted: '#64748B',
        primary: '#2563EB',
        accent: '#14B8A6',
        background: '#F8FAFC',
        foreground: '#0F172A',
        sidebar: '#0F172A',
      },
      boxShadow: {
        soft: '0 18px 50px rgb(15 23 42 / 0.08)',
      },
    },
  },
  plugins: [],
} satisfies Config
