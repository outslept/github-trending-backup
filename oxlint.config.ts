import { defineConfig } from 'oxlint';

export default defineConfig({
  options: {
    typeAware: true,
    typeCheck: true,
  },
  env: {
    browser: true,
    es2024: true,
  },
  plugins: ['typescript', 'react', 'jsx-a11y', 'import', 'unicorn', 'oxc'],
  categories: {
    correctness: 'error',
    suspicious: 'error',
    perf: 'warn',
  },
  ignorePatterns: ['dist/**', 'build/**', 'coverage/**', 'node_modules/**', '*.min.js'],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'no-var': 'error',
    'prefer-const': 'error',

    'typescript/no-explicit-any': 'error',
    'typescript/consistent-type-imports': [
      'warn',
      { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
    ],
    'no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
    ],

    'react/react-in-jsx-scope': 'off',
    'react/rules-of-hooks': 'error',
    'react/exhaustive-deps': 'warn',
    'react/self-closing-comp': 'warn',
    'react/jsx-no-target-blank': 'error',
    'react/jsx-key': 'error',
    'react/no-array-index-key': 'warn',

    'import/no-cycle': 'error',
    'import/no-self-import': 'error',
    'import/no-duplicates': 'error',

    'unicorn/prefer-node-protocol': 'error',
    'unicorn/no-abusive-eslint-disable': 'error',
  },
  overrides: [
    {
      files: ['*.config.{js,ts,mjs,mts}', 'scripts/**/*.{js,ts}'],
      env: {
        node: true,
      },
      rules: {
        'no-console': 'off',
      },
    },
    {
      files: ['**/*.{test,spec}.{ts,tsx}'],
      plugins: ['typescript', 'vitest'],
      rules: {
        'typescript/no-explicit-any': 'off',
      },
    },
  ],
});
