/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "quizlet-blue": "#4255ff",
        "quizlet-dark": "#2e3856",
        "quizlet-light": "#f6f7fb",
        "quizlet-text": "#1a1d28",
      },
      transitionProperty: {
        transform: "transform",
      },
      transitionDuration: {
        400: "400ms",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        slideUp: "slideUp 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
