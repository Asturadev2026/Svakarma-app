// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * E2E: Login + Permissions on the Expo web build.
 *
 * The backend is fully MOCKED via route interception, so these tests are
 * deterministic and need no running API/DB. Routes match by path suffix, so
 * they work regardless of the configured API host.
 */

const DEMO_OTP = '123456';

/** Mock every API the Login → OTP → Permissions → Home flow touches. */
async function mockApi(page) {
  // Send OTP → returns the demo code (mock-provider behaviour).
  await page.route('**/api/auth/send-otp', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'OTP sent (mock provider).',
        provider: 'mock',
        messageSid: 'SM_test_123',
        devOtp: DEMO_OTP,
      }),
    })
  );

  // Verify OTP → returns a token + user.
  await page.route('**/api/auth/verify-otp', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'OTP verified successfully.',
        token: 'test-jwt-token',
        user: { id: 'u_test', phone: '9876543210', name: 'Complete Your Profile', companyName: '', location: '', profileCompletion: 0 },
      }),
    })
  );

  // Onboarding check → "complete" so the flow routes to the Permissions screen.
  await page.route('**/api/profile/check-onboarding', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, onboardingComplete: true }),
    })
  );

  // Home/dashboard data (after Permissions → Continue lands on MainTabs/Home).
  await page.route('**/api/home/summary', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, preApproved: { eligibleAmount: 850000, expiresInDays: 14 }, activeLoan: null }),
    })
  );
  await page.route('**/api/cibil', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { score: 742, status: 'EXCELLENT', maxScore: 900 } }),
    })
  );
  await page.route('**/api/profile', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          personalDetails: { fullName: 'Test User', email: null, mobile: '9876543210', pan: null, aadhaar: null },
          businessDetails: { businessName: '', city: null, state: null, annualTurnover: null },
          sectionsStatus: {}, references: [],
          kycStatus: { completionPercentage: 0, panUploaded: false, aadhaarUploaded: false },
        },
      }),
    })
  );
}

/** Splash → Login → Send OTP → OTP verify → lands on Permissions. */
async function loginToPermissions(page) {
  await page.goto('/');
  await page.getByText('Get Started', { exact: false }).click();          // Splash → Login

  await expect(page.getByText('Welcome')).toBeVisible();
  await page.getByPlaceholder('98765 43210').fill('9876543210');
  await page.getByText('Send OTP', { exact: true }).click();              // → OTP screen

  await expect(page.getByText('Verify Mobile')).toBeVisible();
  // Mock returns devOtp, which the screen auto-fills; ensure the field has it.
  const otpInput = page.getByPlaceholder('• • • • • •');
  await expect(otpInput).toHaveValue(DEMO_OTP);
  await page.getByText('Verify & Proceed', { exact: true }).click();      // → Permissions

  await expect(page.getByText('A few permissions')).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test.describe('Login', () => {
  test('Splash → Login renders the phone entry', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Get Started', { exact: false }).click();
    await expect(page.getByText('Welcome')).toBeVisible();
    await expect(page.getByText(/registered mobile number/i)).toBeVisible();
    await expect(page.getByText('+91')).toBeVisible();
  });

  test('sends OTP and shows the demo code on the OTP screen', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Get Started', { exact: false }).click();
    await page.getByPlaceholder('98765 43210').fill('9876543210');
    await page.getByText('Send OTP', { exact: true }).click();

    await expect(page.getByText('Verify Mobile')).toBeVisible();
    await expect(page.getByText('DEMO MODE', { exact: false })).toBeVisible();
    await expect(page.getByPlaceholder('• • • • • •')).toHaveValue(DEMO_OTP);
  });

  test('verifying the OTP routes to Permissions', async ({ page }) => {
    await loginToPermissions(page);
    await expect(page.getByText('A few permissions')).toBeVisible();
  });
});

test.describe('Permissions', () => {
  test('shows the three permission cards and privacy note', async ({ page }) => {
    await loginToPermissions(page);
    await expect(page.getByText('Location')).toBeVisible();
    await expect(page.getByText('Contacts')).toBeVisible();
    await expect(page.getByText('Notifications')).toBeVisible();
    await expect(page.getByText(/Account Aggregator framework/i)).toBeVisible();
    await expect(page.getByText('Continue', { exact: true })).toBeVisible();
  });

  test('Continue proceeds to the Home dashboard', async ({ page }) => {
    await loginToPermissions(page);
    await page.getByText('Continue', { exact: true }).click();
    // MainTabs default tab is Home → greeting renders.
    await expect(page.getByText('Namaste,')).toBeVisible({ timeout: 20_000 });
  });
});
