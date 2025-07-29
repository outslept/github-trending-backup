// @ts-check

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import { includeIgnoreFile } from '@eslint/compat';
import { fileURLToPath } from 'node:url';
import eslintReact from '@eslint-react/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import vitest from 'eslint-plugin-vitest';
import importX from 'eslint-plugin-import-x';
import prettierConfig from 'eslint-config-prettier';

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

export default tseslint.config(
  includeIgnoreFile(gitignorePath, 'Imported .gitignore patterns'),

  {
    ignores: ['data/**', 'routeTree.gen.ts'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    files: ['**/*.{js,mjs,cjs,ts,tsx,jsx}'],
    plugins: {
      'import-x': importX,
    },
    settings: {
      'import-x/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.eslint.json',
        },
        node: true,
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/prefer-reduce-type-parameter': 'error',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      '@typescript-eslint/prefer-includes': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',

      'import-x/no-duplicates': 'error',
      'import-x/no-unresolved': 'error',
      'import-x/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc' },
        },
      ],

      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'error',
    },
  },

  {
    files: ['**/*.{jsx,tsx}'],
    ...eslintReact.configs['recommended-type-checked'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
    },
  },

  {
    files: ['**/*.{test,spec}.{js,ts,jsx,tsx}', '**/__tests__/**'],
    plugins: { vitest },
    rules: {
      ...vitest.configs.recommended.rules,

      'vitest/expect-expect': 'error',
      'vitest/no-disabled-tests': 'warn',
      'vitest/no-focused-tests': 'error',
      'vitest/prefer-to-be': 'error',
      'vitest/prefer-to-have-length': 'error',
      'vitest/consistent-test-it': ['error', { fn: 'it' }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
    settings: {
      vitest: { typecheck: true },
    },
  },

  prettierConfig,
);
