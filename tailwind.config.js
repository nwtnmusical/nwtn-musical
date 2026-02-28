/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#d12200',
          dark: '#a51502',
          light: '#f8c5c0',
          secondary: '#cf2100',
        }
      },
    },
  },
  plugins: [],
}
