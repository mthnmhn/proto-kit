/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      /* Zluri Color Scales */
      colors: {
        /* Grey Scale */
        grey: {
          50: '#FFFFFF',
          75: '#FDFDFD',
          100: '#F8F8F8',
          200: '#E6E6E6',
          300: '#D5D5D5',
          400: '#B1B1B1',
          500: '#909090',
          600: '#6C6C6C',
          700: '#464646',
          800: '#222222',
          900: '#000000',
        },
        /* Blue Scale (Primary) */
        blue: {
          50: '#E5F2FF',
          100: '#D6EBFF',
          200: '#BDDCFF',
          300: '#99C9FF',
          400: '#66A8FF',
          500: '#3388FF',
          600: '#0066FF',
          700: '#0052CC',
          800: '#003D99',
          900: '#002966',
          1000: '#001433',
        },
        /* Green Scale (Success) */
        green: {
          50: '#E1FEE2',
          100: '#BEFDC0',
          200: '#9FFEA4',
          300: '#64FD6E',
          400: '#32E244',
          500: '#20BA31',
          600: '#229F2E',
          700: '#187E22',
          800: '#12691B',
          900: '#0B4E11',
          1000: '#052D08',
        },
        /* Red Scale (Error/Destructive) */
        red: {
          50: '#FDF1F2',
          100: '#FAD9D9',
          200: '#F9C8C7',
          300: '#F7B7B6',
          400: '#F48A86',
          500: '#F2574E',
          600: '#E33F30',
          700: '#A82B20',
          800: '#6F1912',
          900: '#4D0E09',
          1000: '#2F0603',
        },
        /* Orange Scale (Warning) */
        orange: {
          50: '#FFEDE7',
          100: '#FFD9CB',
          200: '#FFC7B1',
          300: '#FFB594',
          400: '#FFA372',
          500: '#F68009',
          600: '#D66B06',
          700: '#9D4D00',
          800: '#6D3400',
          900: '#4A2200',
          1000: '#331600',
        },
        /* Yellow Scale */
        yellow: {
          50: '#FEF9D7',
          100: '#FEEFA1',
          200: '#FFE881',
          300: '#FFE32F',
          400: '#EED104',
          500: '#D3B200',
          600: '#A88800',
          700: '#856900',
          800: '#705700',
          900: '#543F00',
          1000: '#2A1E00',
        },
        /* Semantic tokens (referencing CSS variables) */
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        success: {
          DEFAULT: 'var(--success)',
          foreground: 'var(--success-foreground)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          foreground: 'var(--warning-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
      },
      /* Zluri Font Sizes with Line Heights */
      fontSize: {
        '4xs': ['11px', { lineHeight: '18px' }],
        '3xs': ['12px', { lineHeight: '20px' }],
        '2xs': ['14px', { lineHeight: '24px' }],
        'xs': ['16px', { lineHeight: '28px' }],
        'sm': ['20px', { lineHeight: '32px' }],
        'md': ['24px', { lineHeight: '36px' }],
        'lg': ['28px', { lineHeight: '40px' }],
        'xl': ['32px', { lineHeight: '44px' }],
        '2xl': ['40px', { lineHeight: '52px' }],
        '3xl': ['64px', { lineHeight: '84px' }],
      },
      /* Zluri Font Families */
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        mono: ['Fragment Mono', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
