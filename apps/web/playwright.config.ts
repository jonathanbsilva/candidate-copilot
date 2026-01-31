import { defineConfig, devices } from '@playwright/test'

/**
 * Mobile Visual Audit Configuration
 *
 * Projects:
 * - setup: Interactive login to save session (run once)
 * - public-only-*: Test public pages without auth (quick test)
 * - mobile-audit-*: Full audit with auth on mobile devices
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Setup project - run interactively to save auth state (mobile viewport)
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: {
        headless: false, // Need headed mode for manual login
        browserName: 'chromium',
        viewport: { width: 390, height: 844 }, // iPhone 14 viewport
        isMobile: true,
        hasTouch: true,
      },
    },
    // Public pages only - iPhone viewport (no auth required)
    {
      name: 'public-only-iphone',
      testMatch: /mobile-audit\.spec\.ts/,
      grep: /Public Pages/,
      use: {
        // Use Chromium with iPhone viewport (no need for WebKit)
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        userAgent: devices['iPhone 14'].userAgent,
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },
    // Public pages only - Pixel viewport (no auth required)
    {
      name: 'public-only-pixel',
      testMatch: /mobile-audit\.spec\.ts/,
      grep: /Public Pages/,
      use: {
        ...devices['Pixel 5'],
      },
    },
    // Full audit - iPhone viewport (requires auth)
    {
      name: 'mobile-audit-iphone',
      testMatch: /mobile-audit\.spec\.ts/,
      use: {
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        userAgent: devices['iPhone 14'].userAgent,
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        storageState: '.auth/user.json',
      },
      dependencies: ['setup'],
    },
    // Full audit - Pixel 5 (requires auth)
    {
      name: 'mobile-audit-pixel',
      testMatch: /mobile-audit\.spec\.ts/,
      use: {
        ...devices['Pixel 5'],
        storageState: '.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
  // Development server - reuse existing or start new
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000,
  },
})
