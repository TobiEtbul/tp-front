import { test, expect } from '@playwright/test';

test.describe('Flujo principal: login y catálogo', () => {
  test('un usuario no autenticado es redirigido al login al acceder a /catalog', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForURL('**/login');
    await expect(page).toHaveURL(/\/login/);
  });

  test('la página de login muestra el formulario correctamente', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toHaveText('Ingresar');
  });

  test('mostrar error con credenciales inválidas', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'fake@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Email o contraseña incorrectos')).toBeVisible({ timeout: 10000 });
  });

  test('la página principal muestra el botón de ingreso', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=CineLog')).toBeVisible();
  });
});
