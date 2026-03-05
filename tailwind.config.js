/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        lato: ['Lato', 'sans-serif'],
      },
      fontSize: {
        'heading': ['20px', { lineHeight: '24px', fontWeight: '700' }],
        'body-large': ['20px', { lineHeight: '30px', fontWeight: '600', letterSpacing: '0.891px' }],
        'button': ['14px', { fontWeight: '600', letterSpacing: '0.28px' }],
        'label': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'link': ['10px', { fontWeight: '500', letterSpacing: '0.05px' }],
      },
      colors: {
        'label-gray': '#999',
        'input-bg': 'rgba(4, 251, 206, 0.10)',
        'input-border': 'rgba(221, 219, 219, 0.20)',
        'input-focus': 'rgba(4, 251, 206, 0.40)',
        'button-border': '#969696',
      },
      borderWidth: {
        'input': '0.838px',
      },
    },
  },
  plugins: [],
}
