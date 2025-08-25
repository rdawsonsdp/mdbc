/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#1B3A57', // Deep navy blue from the book cover
        'secondary': '#D4AF37', // Rich gold color
        'background': '#F7F3E9', // Warm cream/ivory background
        'text': '#1B3A57', // Navy blue text
        'accent': '#8B6914', // Darker gold for accents
        'navy': {
          50: '#F0F4F8',
          100: '#D6E4ED',
          200: '#ADC8DA',
          300: '#7FA7C3',
          400: '#5284A7',
          500: '#1B3A57', // Main navy
          600: '#163149',
          700: '#12283B',
          800: '#0D1F2D',
          900: '#08161F',
        },
        'gold': {
          50: '#FEFCF0',
          100: '#FEF7D7',
          200: '#FDEEB0',
          300: '#FBE188',
          400: '#F8D560',
          500: '#D4AF37', // Main gold
          600: '#B8982F',
          700: '#9C8127',
          800: '#806A1F',
          900: '#644F17',
        },
        'cream': {
          50: '#FEFEFE',
          100: '#FDFCF8',
          200: '#F7F3E9', // Main background
          300: '#F1EBD9',
          400: '#EBE3C9',
          500: '#E5DBB9',
          600: '#DFD3A9',
          700: '#D9CB99',
          800: '#D3C389',
          900: '#CDBB79',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}