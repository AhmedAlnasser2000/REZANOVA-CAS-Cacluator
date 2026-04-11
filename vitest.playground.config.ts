import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['playground/**/*.lab.test.ts'],
    reporters: ['default'],
  },
})
