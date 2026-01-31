import { test as setup } from '@playwright/test'

const authFile = '.auth/user.json'

/**
 * Interactive Auth Setup
 *
 * This script opens a browser for you to manually log in.
 * After login, the session is saved to .auth/user.json for reuse.
 *
 * Run with: npx playwright test --project=setup
 */
setup('authenticate', async ({ page }) => {
  // Navigate to auth page
  await page.goto('/auth')

  // Pause for manual login
  // You'll need to:
  // 1. Enter your email
  // 2. Click send magic link
  // 3. Open email and click the link
  // 4. Wait for redirect to dashboard
  console.log('\n')
  console.log('='.repeat(60))
  console.log('INTERACTIVE LOGIN')
  console.log('='.repeat(60))
  console.log('\n')
  console.log('1. Enter your email in the browser')
  console.log('2. Click the magic link in your email')
  console.log('3. Wait for redirect to /dashboard')
  console.log('4. Press "Resume" in Playwright Inspector to save session')
  console.log('\n')
  console.log('='.repeat(60))

  // Pause execution - resume manually after login
  await page.pause()

  // Verify we're logged in by checking for dashboard
  await page.waitForURL(/dashboard/, { timeout: 120000 })

  // Save authenticated state
  await page.context().storageState({ path: authFile })

  console.log('\n')
  console.log('Session saved to', authFile)
  console.log('You can now run: npx playwright test mobile-audit')
  console.log('\n')
})
