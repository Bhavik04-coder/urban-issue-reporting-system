// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Warm greige with olive tint
        'warm-greige': '#F5F1E8',
        // Base color for cards (light warm grey)
        'base-gray': '#F8F5F0',
        // Tan accent color
        'tan': '#D4B996',
        // Elegant bronze
        'bronze': '#CD7F32',
        // Pale lavender
        'lavender': '#E6E6FA',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-tan': 'linear-gradient(to top, rgba(212, 185, 150, 0.3), transparent)',
      },
    },
  },
  plugins: [],
}