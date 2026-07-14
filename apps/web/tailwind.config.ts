import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "hsl(10, 35%, 33%)",
          dark: "hsl(9, 43%, 25%)",
          light: "hsl(11, 27%, 51%)",
          50: "hsl(17, 100%, 95%)",
          100: "hsl(11, 100%, 93%)",
          200: "hsl(11, 76%, 85%)",
          300: "hsl(10, 58%, 76%)",
          400: "hsl(10, 37%, 63%)",
          500: "hsl(10, 26%, 50%)",
          600: "hsl(11, 31%, 40%)",
          700: "hsl(10, 38%, 31%)",
          800: "hsl(9, 42%, 22%)",
          900: "hsl(10, 48%, 15%)",
        },
        accent: {
          DEFAULT: "hsl(160, 35%, 33%)",
          dark: "hsl(162, 50%, 24%)",
          light: "hsl(158, 25%, 52%)",
        },
        neutral: {
          50: "hsl(0, 8%, 95%)",
          100: "hsl(0, 2%, 84%)",
          200: "hsl(0, 1%, 73%)",
          300: "hsl(0, 1%, 62%)",
          400: "hsl(0, 1%, 51%)",
          500: "hsl(0, 1%, 41%)",
          600: "hsl(0, 1%, 32%)",
          700: "hsl(0, 2%, 22%)",
          800: "hsl(0, 1%, 14%)",
          900: "hsl(0, 8%, 5%)",
        },
        success: {
          DEFAULT: "hsl(142, 65%, 36%)",
          light: "hsl(135, 66%, 67%)",
        },
        warning: {
          DEFAULT: "hsl(38, 90%, 50%)",
          light: "hsl(51, 100%, 70%)",
        },
        error: {
          DEFAULT: "hsl(0, 84%, 60%)",
          light: "hsl(6, 100%, 76%)",
        },
        info: {
          DEFAULT: "hsl(217, 90%, 60%)",
          light: "hsl(211, 100%, 80%)",
        },
        heading: "hsl(0, 1%, 14%)",
        body: "hsl(0, 2%, 22%)",
        muted: "hsl(0, 1%, 41%)",
        link: "hsl(10, 35%, 33%)",
        page: "hsl(0, 8%, 95%)",
        surface: "hsl(0, 0%, 100%)",
        sunken: "hsl(0, 2%, 84%)",
        border: {
          DEFAULT: "hsl(0, 0%, 90%)",
          focus: "hsl(10, 35%, 33%)",
        },
        overlay: "rgba(0, 0, 0, 0.4)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #5b2c24 0%, #37735f 100%)",
        "hero-gradient": "linear-gradient(135deg, #5b2c24 0%, #734137 50%, #37735f 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
