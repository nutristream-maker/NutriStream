/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'primary': '#00A9FF',
                'secondary': '#89CFF3',
                'accent': '#A0E9FF',
                'light': '#CDF5FD',
                'dark-bg': '#0F172A',
                'dark-card': '#1E293B',
            }
        },
    },
    plugins: [],
}
