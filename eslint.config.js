const { aiou } = require('@aiou/eslint-config')

module.exports = aiou(
  {
    ssr: false,
  },
  [
    {
      ignores: ['**/auto-imports.d.ts', 'scripts/**', 'extension/**', '**/manifest.json'],
    },
    {
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
)
