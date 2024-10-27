const { test, expect, describe } = require('@playwright/test');

describe('Kollaboraatioterminaali', () => {

    test('Etusivu aukeaa', async ({ page }) => {
        await page.goto('https://kollabterm.fly.dev/');
        expect(await page.title()).toBe('Collaboration terminal');
        expect (await page.locator('text=Collaboration terminal (Change name?)').isVisible()).toBeTruthy();
    });

    test('Käyttäjä voi kirjautua sisään', async ({ page }) => {

        await page.goto('https://kollabterm.fly.dev/');
        expect (await page.locator('text=Log in').isVisible()).toBeTruthy();
        await page.click('text=Log in');
        const textboxes = await page.getByRole('textbox').all();
        await textboxes[0].fill('test');
        await textboxes[1].fill('test');
        await page.getByRole('button', {name: 'Login'}).click();
        await expect(page.getByText('Welcome test!')).toBeVisible();
    })

    test('Käyttäjä voi kirjautua ulos', async ({ page }) => {

        await page.goto('https://kollabterm.fly.dev/');
        expect (await page.locator('text=Log in').isVisible()).toBeTruthy();
        await page.click('text=Log in');
        const textboxes = await page.getByRole('textbox').all();
        await textboxes[0].fill('test');
        await textboxes[1].fill('test');
        await page.getByRole('button', {name: 'Login'}).click();
        await expect(page.getByText('Welcome test!')).toBeVisible();
        await page.click('text=Log out');
        await expect(page.getByText('Welcome test!')).not.toBeVisible();
        expect (await page.locator('text=Log in').isVisible()).toBeTruthy();
    })
})
