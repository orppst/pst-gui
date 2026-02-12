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

test('random prerecorded test', async ({ page }) => {
    await page.goto('http://localhost:8080/pst/gui/tool/');
    await page.getByRole('textbox', { name: 'Username or email' }).click();
    await page.getByRole('textbox', { name: 'Username or email' }).fill('tacchair');
    await page.getByRole('textbox', { name: 'Password' }).fill('tacchair');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByRole('button', { name: 'TAC Management' }).click();
    await page.getByRole('button', { name: 'Cycle 19' }).click();
    await page.getByRole('link', { name: 'Details' }).click();
    await page.getByRole('textbox', { name: 'Title' }).fill('A test cycle called number 19');
    await page.getByRole('textbox', { name: 'Unique code' }).fill('EM0019');
    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByRole('link', { name: 'TAC and Reviewers' }).click();
    await page.getByRole('button', { name: 'Add Reviewer' }).click();
    await page.getByRole('textbox', { name: 'email' }).click();
    await page.getByRole('textbox', { name: 'email' }).fill('reviewer@unreal.not.email');
    await page.getByRole('textbox', { name: 'Name' }).click();
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByRole('link', { name: 'Assign Reviewers' }).click();
    await page.getByRole('link', { name: 'Reviews' }).click();
    await page.getByRole('link', { name: 'Accept Proposals' }).click();
    await page.getByRole('button').nth(3).click();
    await page.getByRole('menuitem', { name: 'Profile' }).click();
    await page.getByRole('textbox', { name: 'Last Name' }).fill('Halley (Chair)');
    await page.getByRole('button', { name: 'Save' }).first().click();
});
