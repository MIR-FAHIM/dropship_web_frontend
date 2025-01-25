/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");
export default withMT({
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#158E72",
          400: "#EAFFFA",
        },
        background: {
          DEFAULT: "#F0F0F0",
        },
        border: {
          DEFAULT: "#F2F2F2",
        },
        text: {
          DEFAULT: "#F2F2F2",
          100: "#262626",
          300: "#838383",
        },
      },
    },
    fontFamily: {
      plex: ["IBM Plex Sans", "sans-serif"],
      DMSans: ["DM Sans", "sans-serif"],
    },
    screens: {
      sm: "640px",
      // => @media (min-width: 640px) { ... }

      md: "768px",
      // => @media (min-width: 768px) { ... }

      lg: "1024px",
      // => @media (min-width: 1024px) { ... }

      xl: "1280px",
      // => @media (min-width: 1280px) { ... }

      lm: "1366px", // laptop-medium
      // => @media (min-width: 1366px) { ... }

      ls: "1440px", // laptop-standard
      // => @media (min-width: 1440px) { ... }

      "2xl": "1536px",
      // => @media (min-width: 1536px) { ... }

      "3xl": "1920px",
      // => @media (min-width: 1920px) { ... }
    },
  },
  plugins: [],
});
