/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        google: {
          blue: '#1a73e8',
          red: '#ea4335',
          yellow: '#fbbc04',
          green: '#0f9d58',
          dark: '#202124',
          gray: '#5f6368',
          border: '#dadce0',
          surface: '#f8f9fa',
        },
        warm: {
          bg: '#FAF7F2',
          surface: '#F4EFE6',
          border: '#E5DEC9',
          borderSubtle: '#EDE8DC',
          text: '#1C1917',
          muted: '#6B645C',
          accent: '#C25E34',
        },
        swiss: {
          bg: '#FFFFFF',
          dark: '#0A0A0A',
          muted: '#71717A',
          border: '#E4E4E7',
          subtle: '#F4F4F5',
        },
        colorful: {
          navy: '#0F172A',
          indigo: '#1E1B4B',
          softBlue: '#EFF6FF',
          lavender: '#F5F3FF',
          lightCyan: '#F0F9FF',
          softPink: '#FDF2F8',
          softPeach: '#FFF7ED',
          border: '#E2E8F0',
          borderSubtle: '#EDE9FE',
          accentBlue: '#2563EB',
          accentIndigo: '#4F46E5',
          accentPurple: '#7C3AED',
          accentPink: '#DB2777',
          accentCoral: '#F97316',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
        serif: [
          '"Newsreader"',
          'Georgia',
          'Cambria',
          '"Times New Roman"',
          'Times',
          'serif'
        ],
        mono: [
          '"JetBrains Mono"',
          '"SF Mono"',
          'Consolas',
          'Menlo',
          'monospace'
        ],
      },
    },
  },
  plugins: [],
}
