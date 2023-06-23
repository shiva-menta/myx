module.exports = {
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": [
    "plugin:react/recommended",
    "airbnb",
    "plugin:@typescript-eslint/recommended"
  ],
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'react/jsx-filename-extension': 'off',
    'no-undef': 'off',
    'no-else-return': 'off',
    'no-unused-vars': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'react/button-has-type': 'off',
    'no-restricted-globals': 'off',
    'camelcase': 'off',
    'no-param-reassign': 'off',
    'import/no-dynamic-require': 'off',
    'global-require': 'off',
    'no-restricted-syntax': 'off',
    'no-await-in-loop': 'off',
    'guard-for-in': 'off',
    'react/jsx-props-no-spreading': 'off',
    'prefer-destructuring': 'off',
    'class-methods-use-this': 'off',
    'no-promise-executor-return': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
  },
};