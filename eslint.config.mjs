import globals from 'globals'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginReact from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.strict,
    pluginReact.configs.flat.recommended,
    pluginReact.configs.flat['jsx-runtime'],
    {
        plugins: {
            'react-hooks': reactHooks,
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        rules: {
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'error',
        },
    },
    {
        files: ['**/*.{ts,tsx}'],
        rules: {
            'react/prop-types': 0,
        },
    },
    {
        files: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
        languageOptions: {
            globals: {
                ...globals.vitest,
            },
        },
    }
)
