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

test('create a proposal and see it in TAC management', async ({ page }) => {
        await page.goto('http://localhost:8080/pst/gui/tool/');
        await page.getByRole('textbox', { name: 'Username or email' }).click();
        await page.getByRole('textbox', { name: 'Username or email' }).fill('tacchair');
        await page.getByRole('textbox', { name: 'Username or email' }).press('Tab');
        await page.getByRole('textbox', { name: 'Password' }).fill('tacchair');
        await page.getByRole('button', { name: 'Sign In' }).click();
        await page.getByRole('button', { name: 'Create new proposal' }).click();
        await page.getByPlaceholder('Give your proposal a title').click();
        await page.getByPlaceholder('Give your proposal a title').fill('Recorded proposal');
        await page.getByRole('textbox', { name: 'Summary' }).click();
        await page.getByRole('textbox', { name: 'Summary' }).fill('This is one I recorded earlier');
        await page.getByRole('button', { name: 'Save' }).click();
        await page.getByRole('link', { name: 'Recorded proposal' }).click();
        await page.getByRole('link', { name: 'Title, Summary, Kind' }).click();
        await page.getByRole('link', { name: 'Investigators' }).click();
        await page.getByRole('button', { name: 'Add' }).click();
        await page.getByRole('textbox', { name: 'email' }).click();
        await page.getByRole('textbox', { name: 'email' }).fill('reviewer@unreal.not.email');
        await page.getByRole('button', { name: 'Save' }).click();
        await page.getByRole('link', { name: 'Justifications' }).click();
        await page.getByRole('group', { name: 'Scientific Text' }).getByRole('textbox').click();
        await page.getByRole('group', { name: 'Scientific Text' }).getByRole('textbox').fill(' Science justification');
        await page.getByRole('button', { name: 'Save' }).click();
        await page.getByRole('tab', { name: 'Technical Justification' }).click();
        await page.getByRole('group', { name: 'Technical Text' }).getByRole('textbox').click();
        await page.getByRole('group', { name: 'Technical Text' }).getByRole('textbox').fill(' Technical jargon');
        await page.getByRole('button', { name: 'Save' }).click();
        await page.getByRole('button', { name: 'Compile to PDF' }).click();
        await page.getByLabel('LaTeX Compilation Status').getByRole('button').filter({ hasText: /^$/ }).click();
        await page.getByRole('link', { name: 'Targets' }).click();
        await page.getByRole('button', { name: 'Add One Target' }).click();
        await page.getByRole('textbox', { name: 'Search value' }).click();
        await page.getByRole('textbox', { name: 'Search value' }).fill('M77');
        await page.getByRole('option', { name: 'M 77' }).click();
        await page.getByRole('button', { name: 'Save' }).click();
        await page.getByRole('link', { name: 'Technical Goals' }).click();
        await page.getByRole('button', { name: 'Add' }).click();
        await page.getByRole('textbox', { name: 'Angular resolution:' }).click();
        await page.getByRole('textbox', { name: 'Angular resolution:' }).fill('5');
        await page.getByRole('textbox', { name: 'Largest scale:' }).click();
        await page.getByRole('textbox', { name: 'Largest scale:' }).fill('6');
        await page.getByRole('textbox', { name: 'Sensitivity:' }).click();
        await page.getByRole('textbox', { name: 'Sensitivity:' }).fill('5');
        await page.getByRole('textbox', { name: 'Dynamic range:' }).click();
        await page.getByRole('textbox', { name: 'Dynamic range:' }).fill('4');
        await page.getByRole('textbox', { name: 'Spectral point:' }).click();
        await page.getByRole('textbox', { name: 'Spectral point:' }).fill('2');
        await page.locator('#mantine-j8afinkml').click();
        await page.getByRole('option', { name: 'μas' }).click();
        await page.locator('#mantine-26gfl4mzk').click();
        await page.locator('div').filter({ hasText: /^unit:$/ }).nth(2).click();
        await page.locator('div').filter({ hasText: /^unit:$/ }).nth(4).click();
        await page.getByRole('option', { name: 'μJy' }).click();
        await page.getByRole('option', { name: 'μJy' }).click();
        await page.getByRole('button', { name: 'Save' }).click();
        await page.getByRole('button', { name: 'Edit' }).click();
        await page.getByRole('tab', { name: 'Spectral Windows' }).click();
        await page.getByLabel('Spectral Windows').getByRole('button', { name: 'Add' }).click();
        await page.getByRole('textbox', { name: 'Start:' }).click();
        await page.getByRole('textbox', { name: 'Start:' }).fill('3');
        await page.locator('#mantine-ugaptvf7d').click();
        await page.getByRole('option', { name: 'MHz' }).click();
        await page.getByRole('textbox', { name: 'End:' }).click();
        await page.getByRole('textbox', { name: 'End:' }).fill('5');
        await page.getByRole('textbox', { name: 'unit:' }).nth(1).click();
        await page.getByRole('option', { name: 'MHz' }).click();
        await page.getByRole('textbox', { name: 'Polarization:' }).click();
        await page.getByRole('option', { name: 'U' }).click();
        await page.locator('#mantine-13yu9cqjn').click();
        await page.getByRole('option', { name: 'GHz' }).click();
        await page.getByRole('textbox', { name: 'Resolution:' }).click();
        await page.getByRole('textbox', { name: 'Resolution:' }).fill('3');
        await page.getByRole('button', { name: 'Save' }).click();
        await page.getByRole('button', { name: 'Cancel' }).click();
        await page.getByRole('link', { name: 'Observations' }).click();
        await page.locator('div').filter({ hasText: /^Add$/ }).click();
        await page.locator('div').filter({ hasText: /^Add$/ }).click();
        await page.getByRole('button', { name: 'Add' }).click();
        await page.getByRole('textbox', { name: 'Type:' }).click();
        await page.getByRole('group', { name: 'Observation Type' }).dblclick();
        await page.getByRole('textbox', { name: 'Type:' }).click();
        await page.getByRole('group', { name: 'Observation Type' }).click();
        await page.getByRole('cell', { name: 'M' }).click();
        await page.getByRole('cell', { name: '5 μas' }).click();
        await page.getByRole('textbox', { name: 'Type:' }).click();
        await page.getByRole('option', { name: 'Target' }).click();
        await page.getByRole('tab', { name: 'Timing Windows (optional)' }).click();
        await page.getByLabel('Timing Windows (optional)').getByRole('button', { name: 'Add' }).click();
        await page.getByRole('textbox', { name: 'start time - YYYY/MM/DD HH:mm' }).click();
        await page.getByRole('button', { name: '16 February' }).click();
        await page.getByText('end', { exact: true }).click();
        await page.getByRole('textbox', { name: 'end time - YYYY/MM/DD HH:mm' }).click();
        await page.getByRole('button', { name: '23 February' }).click();
        await page.getByRole('textbox', { name: 'add optional note' }).click();
        await page.getByRole('textbox', { name: 'add optional note' }).fill('Nothing to say here');
        await page.getByRole('button', { name: 'Save' }).click();
        await page.getByRole('link', { name: 'Documents' }).click();
        await page.getByRole('link', { name: 'Submit' }).click();
        await page.getByRole('textbox', { name: 'Please select a proposal cycle' }).click();
        await page.getByRole('option', { name: 'Cycle' }).click();
        await page.getByRole('button', { name: 'Next step' }).click();
        await page.getByRole('button', { name: 'Next step' }).click();
        await page.locator('.m_84c9523a > div > div').first().click();
        await page.getByRole('group', { name: 'Observing Mode Details' }).getByPlaceholder('select mode').click();
        await page.locator('#mantine-ncs7mkf1v').getByText('L-Band: full e-MERLIN at L-').click();
        await page.getByRole('button', { name: 'Set for all' }).click();
        await page.getByRole('button', { name: 'Next step' }).click();
        await page.getByRole('button', { name: 'Submit proposal', exact: true }).click();
        await page.getByRole('button', { name: 'Done' }).click();
        await page.getByRole('button', { name: 'TAC Management' }).click();
        await page.getByRole('button', { name: 'Cycle 19' }).click();
        await page.getByRole('link', { name: 'Overview' }).click();
        await page.getByRole('button', { name: 'EM0111' }).click();
        await page.getByRole('textbox', { name: 'Proposal code' }).click();
        await page.getByRole('textbox', { name: 'Proposal code' }).click();
        await page.getByRole('textbox', { name: 'Proposal code' }).fill('Test1');
        await page.getByRole('textbox', { name: 'Proposal code' }).press('Enter');
        await page.getByRole('button', { name: 'Save' }).click();
        await page.getByRole('button').nth(3).click();
        await page.getByRole('menuitem', { name: 'log out' }).click();
});