import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  react: true,
  nextjs: true,
  ignores: [
    'components/ui/**/*',
    'cloudflare-env.d.ts',
    '.codex/**/*',
  ],
  rules: {
    'no-console': ['error', { allow: ['info', 'table', 'warn', 'error'] }],
  },
})
