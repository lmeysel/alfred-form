module.exports = {
  parser: 'vue-eslint-parser',
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended', 'plugin:vue/vue3-essential'],
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
