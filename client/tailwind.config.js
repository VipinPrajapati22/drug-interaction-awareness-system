export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        clinical: {
          50: "#f4f9ff",
          100: "#e8f3ff",
          500: "#1d78d8",
          600: "#155fb0",
          700: "#124f93",
          900: "#12355f"
        }
      },
      boxShadow: {
        soft: "0 18px 50px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};
