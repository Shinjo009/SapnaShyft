/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Lato', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        lato: ['Lato', 'sans-serif'],
        sora: ['Sora', 'sans-serif'],
      },
      fontSize: {
        'heading': ['20px', { lineHeight: '24px', fontWeight: '700' }],
        'body-large': ['20px', { lineHeight: '30px', fontWeight: '600', letterSpacing: '0.891px' }],
        'button': ['15px', { fontWeight: '600', letterSpacing: '0.28px' }],
        'label': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'link': ['10px', { fontWeight: '500', letterSpacing: '0.05px' }],
      },
      colors: {
        'label-gray': '#999',
        'input-bg': 'rgba(255, 255, 255, 0.05)',
        'input-border': 'rgba(221, 219, 219, 0.20)',
        'input-focus': 'rgba(255, 255, 255, 0.20)',
        'button-border': '#969696',
      },
      borderWidth: {
        'input': '0.838px',
      },
    },
  },
  plugins: [],
}
