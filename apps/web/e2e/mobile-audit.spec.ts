import { test, expect, Page } from '@playwright/test'
import { staticPages, PageToAudit } from './pages'

/**
 * Mobile Visual Audit
 *
 * Tests each page for:
 * 1. Horizontal overflow (scroll lateral indesejado)
 * 2. Screenshot capture for visual review
 * 3. Console errors that might indicate problems
 */

// Collect console errors for each page
const consoleErrors: Map<string, string[]> = new Map()

// Check for horizontal overflow
async function checkHorizontalOverflow(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    return document.body.scrollWidth > window.innerWidth
  })
}

// Get overflow amount in pixels
async function getOverflowAmount(page: Page): Promise<number> {
  return await page.evaluate(() => {
    return document.body.scrollWidth - window.innerWidth
  })
}

// Wait for page to be fully loaded
async function waitForPageLoad(page: Page): Promise<void> {
  // Wait for network to be idle
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
    // Fallback if network never becomes idle (streaming, etc)
  })

  // Additional wait for any animations
  await page.waitForTimeout(500)
}

// Test setup - collect console errors
test.beforeEach(async ({ page }, testInfo) => {
  const pageName = testInfo.title

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const errors = consoleErrors.get(pageName) || []
      errors.push(msg.text())
      consoleErrors.set(pageName, errors)
    }
  })
})

// Test public pages (no auth required)
test.describe('Public Pages - Mobile Audit', () => {
  const publicPagesToTest = staticPages.filter((p) => !p.requiresAuth)

  for (const pageInfo of publicPagesToTest) {
    test(`${pageInfo.name} (${pageInfo.path})`, async ({ page }) => {
      await auditPage(page, pageInfo)
    })
  }
})

// Test dashboard pages (auth required)
test.describe('Dashboard Pages - Mobile Audit', () => {
  const dashboardPagesToTest = staticPages.filter((p) => p.requiresAuth)

  for (const pageInfo of dashboardPagesToTest) {
    test(`${pageInfo.name} (${pageInfo.path})`, async ({ page }) => {
      await auditPage(page, pageInfo)
    })
  }
})

// Main audit function
async function auditPage(page: Page, pageInfo: PageToAudit): Promise<void> {
  const testInfo = test.info()

  // Navigate to page
  const response = await page.goto(pageInfo.path, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  })

  // Check response status
  expect(response?.status(), `Page ${pageInfo.path} should load successfully`).toBeLessThan(400)

  // Wait for page to fully load
  await waitForPageLoad(page)

  // Take screenshot
  const screenshotName = pageInfo.name.toLowerCase().replace(/\s+/g, '-')
  await page.screenshot({
    path: `playwright-report/screenshots/${screenshotName}.png`,
    fullPage: true,
  })

  // Attach screenshot to report
  await testInfo.attach(`${pageInfo.name} - Full Page`, {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  })

  // Check for horizontal overflow
  const hasOverflow = await checkHorizontalOverflow(page)

  if (hasOverflow) {
    const overflowAmount = await getOverflowAmount(page)

    // Attach viewport screenshot showing overflow area
    await testInfo.attach(`${pageInfo.name} - Overflow Detected`, {
      body: await page.screenshot(),
      contentType: 'image/png',
    })

    // Log overflow warning (but don't fail - just report)
    console.warn(`⚠️ Overflow detected on ${pageInfo.path}: ${overflowAmount}px extra width`)

    // Add annotation to report
    testInfo.annotations.push({
      type: 'warning',
      description: `Horizontal overflow: ${overflowAmount}px`,
    })
  }

  // Report console errors if any
  const errors = consoleErrors.get(testInfo.title)
  if (errors && errors.length > 0) {
    testInfo.annotations.push({
      type: 'warning',
      description: `Console errors: ${errors.length}`,
    })
    console.warn(`⚠️ Console errors on ${pageInfo.path}:`, errors)
  }

  // Soft assertion for overflow (warns but doesn't fail)
  expect.soft(hasOverflow, `Page ${pageInfo.path} should not have horizontal overflow`).toBe(false)
}

// Summary test at the end
test.afterAll(async () => {
  console.log('\n')
  console.log('='.repeat(60))
  console.log('MOBILE AUDIT SUMMARY')
  console.log('='.repeat(60))
  console.log('\n')

  if (consoleErrors.size > 0) {
    console.log('Pages with console errors:')
    for (const [pageName, errors] of consoleErrors) {
      console.log(`  - ${pageName}: ${errors.length} error(s)`)
    }
  } else {
    console.log('No console errors detected')
  }

  console.log('\n')
  console.log('View full report: npx playwright show-report')
  console.log('='.repeat(60))
  console.log('\n')
})
