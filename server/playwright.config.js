const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e-tests',
  use: {
    headless: true,
    baseURL: 'https://kollabterm.fly.dev',
    viewport: { width: 1280, height: 720 },
  },
  reporter: 'list',
});
