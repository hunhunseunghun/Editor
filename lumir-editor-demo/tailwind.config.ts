/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    // Include lumir-editor package for Tailwind classes
    './lumir-editor/dist/**/*.{js,mjs}',
  ],
  theme: {
    extend: {
      colors: {
        dnd_preview_blue: '#D4E0ED',
      },
    },
  },
  plugins: [],
};