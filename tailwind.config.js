// Tailwind CSS configuration for the project. This file enables the
// DaisyUI plugin and defines a custom palette that matches the Lessn
// branding used across the create-lesson pages.

import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  // ✅ broaden content globs a bit so purge never misses your files
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/lib/**/*.{js,jsx}",
    "./src/app/create-lesson/feature/**/*.{js,jsx}",
  ],

  // ✅ ensure these classes are always generated (even if referenced dynamically)
  safelist: [
    "rounded-tr-3xl",
    "rounded-bl-3xl",
    // optional larger radii if you decide to use them
    "rounded-tr-4xl",
    "rounded-bl-4xl",
    "rounded-3xl",
  ],

  theme: {
    extend: {
      colors: {
        "purple-primary": "#500078",
        "purple-secondary": "#9500DE",
        "green-primary": "#39C16C",
        "indigo-secondary": "#5A67D8",
        "blue-primary": "#1D4ED8",
      },
      fontFamily: {
        primary: ["Inter", "system-ui", "sans-serif"],
        wide: ["Inter", "system-ui", "sans-serif"],
        superBlack: ["Inter", "system-ui", "sans-serif"],
      },
      // optional: add even larger corner sizes
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
    },
  },

  plugins: [daisyui],

  daisyui: {
    themes: [
      {
        lessn: {
          primary: "#9500DE",
          secondary: "#500078",
          accent: "#39C16C",
          neutral: "#111827",
          "base-100": "#ffffff",
        },
      },
      "light",
    ],
  },
};

















// /** @type {import('tailwindcss').Config} */
// const config = {
//   content: [
//     "./app/**/*.{js,jsx,tsx}",
//     "./pages/**/*.{js,jsx,tsx}",
//     "./components/**/*.{js,jsx,tsx}",
//   ],
//   theme: {
//     extend: {
//       fontFamily: {
//         inter: ["Inter", "sans-serif"], 
//         mulish: ["Mulish", "sans-serif"],// Inter is the default font
//       },
//     },
//   },
//     plugins: [require('@tailwindcss/line-clamp')],

// };

// export default config;
