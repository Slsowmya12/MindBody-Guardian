/** @type {import('tailwindcss').Config} */
module.exports = {
  // content: ["./app.{js,jsx,ts,tsx}", "./<custom directory>/**/*.{js,jsx,ts,tsx}"],
  content: [
    
    "./app-example/**/*.{js,jsx,ts,tsx}","./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

