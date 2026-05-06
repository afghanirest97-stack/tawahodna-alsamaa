module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'amiri': ['Amiri', 'serif'],
        'cairo': ['Cairo', 'sans-serif'],
      },
      colors: {
        'islamic-green': '#1a5f2a',
        'islamic-gold': '#c9a03d',
        'islamic-dark': '#2c2c2c',
        'islamic-cream': '#fdf8ed',
        'arabic-blue': '#1e3a5f',
      }
    },
  },
  plugins: [],
}