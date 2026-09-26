/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#070911",
        surface: "#0F1421",
        surfaceAlt: "#161C2B",
        border: "#232A3B",
        muted: "#8A93A8",
        flame1: "#1D6FE0",
        flame2: "#7DD3FC",
        teal: "#22D3EE",
        danger: "#FF6B6B",
      },
      backgroundImage: {
        ember: "linear-gradient(95deg, #1D6FE0, #7DD3FC)",
      },
    },
  },
  plugins: [],
};
