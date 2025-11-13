/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F7DF9C',      // pale yellow
        secondary: '#E3C78A',    // tan
        tertiary: '#B79982',     // muted sand
        quaternary: '#A3876A',   // taupe brown
        quinary: '#876B56',      // brown
        senary: '#755647',       // deep brown
      },
    },
  },
  plugins: [],
}

