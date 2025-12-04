/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    screens: {
      'xs': "320px",
      'sm': "425px",
      'sm500': "500px",
      'md600': "600px",
      'sm651': "651px",
      'md': "768px",
      'lg': "1024px",
      'xl': "1280px",
      "2xl": "1440px",
      "3xl": "1650px",
      "4xl": "1920px",
      "5xl": "2560px",
    },
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
  plugins: [
    // Add plugin for scrollbar hiding
    function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-hide": {
          /* IE and Edge */
          "-ms-overflow-style": "none",
 
          /* Firefox */
          "scrollbar-width": "none",
 
          /* Safari and Chrome */
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
      });
    },
  ],
 
}

