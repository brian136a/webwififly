// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // ← Scans all files in src for Tailwind classes
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Arial', 'Helvetica', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;