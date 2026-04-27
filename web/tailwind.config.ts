import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        primary: {
          DEFAULT: '#FF6B35',
          light: '#FF8B5A',
          dark: '#E55A2B',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        border: 'var(--border)',
        ring: 'var(--ring)',
        streak: {
          fire: '#FF6B35',
          ice: '#3498DB',
          broken: '#95A5A6',
          gold: '#F39C12'
        },
        badge: {
          common: '#95A5A6',
          rare: '#3498DB',
          epic: '#9B59B6',
          legendary: '#F39C12'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
      },
      keyframes: {
        'pulse-fire': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.1)', opacity: '0.9' }
        },
        'shine': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' }
        },
        'confetti': {
          '0%': { transform: 'translateY(-100vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' }
        }
      },
      animation: {
        'pulse-fire': 'pulse-fire 2s ease-in-out infinite',
        'shine': 'shine 3s ease-in-out infinite',
        'confetti': 'confetti 3s ease-out forwards'
      }
    }
  },
  plugins: []
};

export default config;
