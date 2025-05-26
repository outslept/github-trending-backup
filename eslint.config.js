import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'app',
  ignores: ['data/**'],
}, {
  rules: {
    'node/prefer-global/process': 'off',
  },
})
