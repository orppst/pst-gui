import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('http://localhost:8080/pst/gui/tool/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Sign in to Opticon RadioNet Proposal Tool/);
});

test('login as PI', async ({ page }) => {
    await page.goto('http://localhost:8080/pst/gui/tool/');

    // enter username and password
    await page.locator('input[id="username"]').fill('pi');
    await page.locator('input[id="password"]').fill('pi');

    // Click the 'Sign In' button
    await page.locator('input[id="kc-login"]').click();

    // Expects page to have a heading with the name of Installation.
    await expect(page).toHaveTitle(/Polaris - Proposal Tool/);

    // Check we **cannot** see the TAC Management button
    await expect(page.getByRole('button', { name: 'TAC Management'})).toHaveCount(0);
});

test('login as TAC Chair', async ({ page }) => {
    await page.goto('http://localhost:8080/pst/gui/tool/');

    // enter username and password
    await page.locator('input[id="username"]').fill('tacchair');
    await page.locator('input[id="password"]').fill('tacchair');

    // Click the 'Sign In' button
    await page.locator('input[id="kc-login"]').click();

    // Expects page to have a heading with the name of Installation.
    await expect(page).toHaveTitle(/Polaris - Proposal Tool/);

    // Check we **can** see the TAC Management button
    await expect(page.getByRole('button', { name: 'TAC Management'})).toBeVisible()
});
