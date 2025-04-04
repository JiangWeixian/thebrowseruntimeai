const { aiou } = require('@aiou/eslint-config')

module.exports = aiou(
  {
    ssr: false,
  },
  [
    {
      ignores: ['**/auto-imports.d.ts', 'scripts/**', 'extension/**'],
    },
    {
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
)
