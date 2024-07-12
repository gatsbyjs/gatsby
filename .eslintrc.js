import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import babelParser from '@babel/eslint-parser';
import flowtype from 'eslint-plugin-flowtype';
import react from 'eslint-plugin-react';
import filenames from 'eslint-plugin-filenames';
import typescriptEslint from '@typescript-eslint/eslint-plugin';

const compat = new FlatCompat({
  baseDirectory: import.meta.url,
  resolvePluginsRelativeTo: import.meta.url,
});

export default [
  {
    files: ['*.js', '*.jsx'],
    languageOptions: {
      parser: babelParser,
      ecmaVersion: 2016,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
      babelOptions: {
        configFile: './.babelrc.js',
      },
    },
    plugins: {
      flowtype,
      react,
      filenames,
      '@babel': babelParser,
    },
    rules: {
      '@babel/no-unused-expressions': [
        'error',
        {
          allowTaggedTemplates: true,
        },
      ],
      'no-unused-expressions': 'off',
      '@babel/no-invalid-this': 'error',
      'no-invalid-this': 'off',
      'arrow-body-style': [
        'error',
        'as-needed',
        { requireReturnForObjectLiteral: true },
      ],
      'new-cap': 'off',
      'no-unused-vars': [
        'warn',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'consistent-return': ['error'],
      'filenames/match-regex': ['error', '^[a-z-\\d\\.]+$', true],
      'no-console': 'off',
      'no-inner-declarations': 'off',
      quotes: ['error', 'backtick'],
      'react/display-name': 'off',
      'react/jsx-key': 'warn',
      'react/no-unescaped-entities': 'off',
      'react/prop-types': 'off',
      'require-jsdoc': 'off',
      'valid-jsdoc': 'off',
      'prefer-promise-reject-errors': 'warn',
      'no-prototype-builtins': 'warn',
      'guard-for-in': 'warn',
      'spaced-comment': [
        'error',
        'always',
        { markers: ['/'], exceptions: ['*', '+'] },
      ],
      camelcase: [
        'error',
        {
          properties: 'never',
          ignoreDestructuring: true,
          allow: ['^unstable_'],
        },
      ],
    },
  },
  {
    files: ['*.ts', '*.tsx'],
    languageOptions: {
      parser: typescriptEslint.parser,
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      '@typescript-eslint/ban-ts-comment': [
        'warn',
        { 'ts-ignore': 'allow-with-description' },
      ],
      '@typescript-eslint/no-inferrable-types': [
        'error',
        { ignoreParameters: true },
      ],
      '@typescript-eslint/ban-types': [
        'error',
        {
          extendDefaults: true,
          types: {
            '{}': {
              fixWith: 'Record<string, unknown>',
            },
            object: {
              fixWith: 'Record<string, unknown>',
            },
          },
        },
      ],
      camelcase: 'off',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase'],
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allowSingleOrDouble',
          trailingUnderscore: 'allowSingleOrDouble',
        },
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'parameter',
          format: ['camelCase', 'PascalCase', 'snake_case'],
          leadingUnderscore: 'allowSingleOrDouble',
        },
        {
          selector: 'enumMember',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'typeAlias',
          format: ['camelCase', 'PascalCase'],
        },
        {
          selector: 'property',
          format: null,
        },
        {
          selector: 'objectLiteralProperty',
          format: null,
        },
        {
          selector: 'enum',
          format: ['PascalCase', 'UPPER_CASE'],
        },
        {
          selector: 'method',
          format: ['PascalCase', 'camelCase'],
          leadingUnderscore: 'allowSingleOrDouble',
        },
        {
          selector: 'interface',
          format: ['PascalCase'],
          prefix: ['I'],
        },
      ],
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-extra-semi': 'off',
      '@typescript-eslint/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'none',
          },
        },
      ],
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/consistent-type-definitions': [
        'error',
        'interface',
      ],
      '@typescript-eslint/no-use-before-define': [
        'error',
        { functions: false },
      ],
      quotes: 'off',
      '@typescript-eslint/quotes': [
        2,
        'backtick',
        {
          avoidEscape: true,
        },
      ],
      'flowtype/no-types-missing-file-annotation': 'off',
      '@typescript-eslint/array-type': ['error', { default: 'generic' }],
    },
  },
  {
    files: ['packages/**/gatsby-browser.js', 'packages/gatsby/cache-dir/**/*'],
    languageOptions: {
      ecmaVersion: 2016,
      sourceType: 'module',
    },
    env: {
      browser: true,
    },
    globals: {
      ___loader: false,
      ___emitter: false,
    },
  },
  {
    files: ['**/cypress/integration/**/*', '**/cypress/support/**/*'],
    globals: {
      cy: false,
      Cypress: false,
    },
  },
  {
    settings: {
      react: {
        version: '18.2.0',
      },
    },
  },
];