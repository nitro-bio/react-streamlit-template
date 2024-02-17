/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors");

const brandColor = colors.emerald;
const noirColor = colors.slate;
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@ninjha01/nitro-ui/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        noir: noirColor,
        brand: brandColor,
      },
    },
    ringColor: {
      brand: brandColor[500],
      noir: noirColor[500],
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("daisyui"),
  ],
  daisyui: {
    logs: false,
    theme: false,
    themes: [
      {
        mytheme: {
          primary: brandColor["500"],
          secondary: "#463AA2",
          accent: "#C148AC",
          neutral: "#021431",
          "base-100": "#f3f4f6",
          info: "#93E7FB",
          success: "#81CFD1",
          warning: "#EFD7BB",
          error: "#E58B8B",
        },
      },
    ],
  },
};
