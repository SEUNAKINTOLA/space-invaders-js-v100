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
    'plugin:import/warnings'
  ],
  parserOptions: {
    ecmaVersion: 2025,
    sourceType: 'module',
    ecmaFeatures: {
      impliedStrict: true
    }
  },
  plugins: [
    'security',
    'import',
    'jest',
    'jsdoc'
  ],
  rules: {
    // Error Prevention
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-undef': 'error',
    'no-var': 'error',
    
    // Modern JavaScript Features
    'prefer-const': 'error',
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'prefer-template': 'error',
    
    // Security
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-unsafe-regex': 'error',
    
    // Performance
    'no-await-in-loop': 'error',
    'no-unused-expressions': 'error',
    
    // Code Style
    'arrow-body-style': ['error', 'as-needed'],
    'arrow-parens': ['error', 'as-needed'],
    'comma-dangle': ['error', 'never'],
    'curly': ['error', 'all'],
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    
    // Documentation
    'jsdoc/require-jsdoc': ['error', {
      require: {
        FunctionDeclaration: true,
        MethodDefinition: true,
        ClassDeclaration: true
      }
    }],
    'jsdoc/require-description': 'error',
    'jsdoc/require-param': 'error',
    'jsdoc/require-returns': 'error',
    
    // Import/Export
    'import/no-unresolved': 'error',
    'import/named': 'error',
    'import/default': 'error',
    'import/namespace': 'error',
    'import/no-cycle': 'error',
    'import/no-duplicates': 'error'
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js']
      }
    }
  },
  overrides: [
    {
      files: ['tests/**/*.js'],
      env: {
        jest: true
      },
      rules: {
        'no-unused-expressions': 'off',
        'max-lines-per-function': 'off'
      }
    }
  ]
};