// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          cool: "#99a68c",
        },
      },
      fontFamily: {
        pixel: ['"Pixelify Sans"', 'sans-serif'],
        poppins: ['"Poppins"', 'sans-serif'],
        sixtyfour: ['"Sixtyfour"', 'sans-serif'],
        sixtyfour: ['"Sixtyfour"', 'sans-serif'],
      },
      keyframes: {
        'neon-glow': {
          '0%, 100%': {
            textShadow: '0 0 10px #e594b2ff, 0 0 20px #e594b2ff, 0 0 40px #e594b2ff',
          },
          '50%': {
            textShadow: '0 0 20px #df6f8aff, 0 0 40px #df6f8aff, 0 0 60px #df6f8aff',
          },
        },
        // New green neon glow pulse
        'neon-glow-purple': {
          '0%, 100%': {
            textShadow: '0 0 10px #89AAE6, 0 0 20px #89AAE6, 0 0 40px #89AAE6', 
          },
          '50%': {
            textShadow: '0 0 20px #A6ACDA, 0 0 40px #A6ACDA, 0 0 60px #A6ACDA', 
          },
        },
      },
      animation: {
        'neon-pulse': 'neon-glow 3s infinite alternate',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'neon-pulse-purple': 'neon-glow-purple 3s infinite alternate', // new animation
      },
    },
  },
  plugins: [],
};
