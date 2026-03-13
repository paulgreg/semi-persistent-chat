import { defineConfig } from 'vitest/config'
import eslint from 'vite-plugin-eslint'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [
        eslint(),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
    ],
    test: {
        globals: true,
        include: ['**/*.test.js', '**/*.test.jsx'],
        environment: 'jsdom',
    },
})
