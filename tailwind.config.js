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
          300: "#838383",
        },
      },
    },
  },
  plugins: [],
});
