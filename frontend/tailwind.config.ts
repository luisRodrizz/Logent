import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'logent-blue': '#1017D8',
        'logent-green': '#28E000',
        border: '#E2E8F0',
        card: '#FFFFFF',
        muted: '#64748B',
        primary: '#1017D8',
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
