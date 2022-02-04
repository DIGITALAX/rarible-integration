module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        primary: ["Gilroy"],
        secondary: ["Oswald"],
      },
      spacing: {
        128: "32rem",
        100: "25rem",
      },
    },
  },
  plugins: [],
};
