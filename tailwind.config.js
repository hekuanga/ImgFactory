/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // 启用 class 模式的深色模式
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'cream': {
          DEFAULT: '#F7F4E9',
          light: '#FCF7E3',
          lighter: '#FFF8E0',
        },
        'beige': {
          DEFAULT: '#E8DEBB',
          light: '#CFC3A7',
        },
        'rainbow': {
          red: '#EB333D',
          orange: '#F98F45',
          green: '#70B78B',
          blue: '#4B8AD1',
        },
      },
      backgroundColor: {
        'cream': '#F7F4E9',
        'cream-dark': '#1e293b',
      },
      fontFamily: {
        'display': ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'],
      },
    },
  },
  plugins: [],
}
