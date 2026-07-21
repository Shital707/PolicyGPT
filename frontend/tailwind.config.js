/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1B2A4A",
        parchment: "#F7F3EA",
        amber: "#C08A3E",
        slate: "#5B6472",
        sage: "#3D7A5C",
      },
      fontFamily: {
        display: ["Lora", "serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
