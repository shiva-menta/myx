module.exports = {
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
    'guard-for-in': 'off'
  },
};