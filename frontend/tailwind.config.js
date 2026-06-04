/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sacco: {
          DEFAULT: "#0e7c4a",
          dark: "#0a5634",
          light: "#e6f4ec",
          accent: "#f6c026",
        },
      },
    },
  },
  plugins: [],
};
