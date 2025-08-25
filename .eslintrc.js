/**
 * ESLint Configuration for Space Invaders JS V100
 * 
 * Purpose:
 * - Enforce consistent code style and quality standards
 * - Prevent common JavaScript errors and anti-patterns
 * - Ensure security best practices
 * - Optimize performance through static analysis
 * 
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2025: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'plugin:security/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:jest/recommended',
    'plugin:jsdoc/recommended',
    'plugin:prettier/recommended'
  ],
  plugins: [
    'security',
    'import',
    'jest',
    'jsdoc',
    'prettier',
    'promise'
  ],
  parserOptions: {
    ecmaVersion: 2025,
    sourceType: 'module',
    ecmaFeatures: {
      impliedStrict: true
    }
  },
  rules: {
    // Error Prevention
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-undef': 'error',
    'no-var': 'error',
    
    // Security
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-unsafe-regex': 'error',
    
    // Performance
    'no-await-in-loop': 'error',
    'no-loop-func': 'error',
    'prefer-const': 'error',
    
    // Code Style
    'arrow-body-style': ['error', 'as-needed'],
    'prefer-arrow-callback': 'error',
    'prefer-template': 'error',
    'quotes': ['error', 'single', { avoidEscape: true }],
    
    // Modern JavaScript
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'prefer-destructuring': ['error', { object: true, array: false }],
    
    // Documentation
    'jsdoc/require-jsdoc': ['error', {
      require: {
        FunctionDeclaration: true,
        MethodDefinition: true,
        ClassDeclaration: true
      }
    }],
    'jsdoc/require-description': 'error',
    'jsdoc/require-param-description': 'error',
    'jsdoc/require-returns-description': 'error',
    
    // Import/Export
    'import/first': 'error',
    'import/no-duplicates': 'error',
    'import/order': ['error', {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always'
    }],
    
    // Promise Handling
    'promise/always-return': 'error',
    'promise/no-return-wrap': 'error',
    'promise/param-names': 'error',
    'promise/catch-or-return': 'error',
    
    // Game-specific
    'complexity': ['error', 10],
    'max-depth': ['error', 3],
    'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }]
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js']
      }
    },
    jsdoc: {
      mode: 'typescript'
    }
  },
  overrides: [
    {
      files: ['tests/**/*.js'],
      rules: {
        'max-lines-per-function': 'off',
        'jsdoc/require-jsdoc': 'off'
      }
    }
  ]
};