import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        okta: {
          blue: '#007DC1',
          'blue-hover': '#006AA8',
          'blue-dark': '#00297A',
          'blue-light': '#E6F4FB',
          charcoal: '#1d1d1d',
          'gray-mid': '#6b6b6b',
          border: '#dde0e7',
          bg: '#f4f4f4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', "'Segoe UI'", 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
