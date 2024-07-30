import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'], // remove unused styles in production
  theme: {
    extend: {
      screens: {
        '2xl': '1920px',
      },
      fontFamily: {
        'neue-montreal': ['var(--font-neue-montreal-variable)', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        black: '#1d1d1d',
        offWhite: '#f4f3f0',
      },
    },
  },
} satisfies Config
