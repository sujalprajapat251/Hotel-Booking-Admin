/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    screens: {
      'xs': "320px",
      'sm': "425px",
      'md600': "600px",
      'md': "768px",
      'lg': "1024px",
      'xl': "1280px",
      "2xl": "1440px",
      "3xl": "1650px",
      "4xl": "1920px",
      "5xl": "2560px",
    },
    extend: {},
  },
  plugins: [],
}

