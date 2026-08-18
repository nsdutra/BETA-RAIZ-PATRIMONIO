import { test, expect } from '@playwright/test';

// Requer ambiente de staging com usuário trial de teste.
// Variáveis esperadas: RAIZ_APP_URL, RAIZ_TEST_EMAIL, RAIZ_TEST_PASSWORD.
test.skip(!process.env.RAIZ_APP_URL, 'Configure ambiente de staging.');

test('primeiro acesso exibe onboarding sem bloquear o app', async ({ page }) => {
  await page.goto(process.env.RAIZ_APP_URL);
  await page.getByPlaceholder(/e-mail/i).fill(process.env.RAIZ_TEST_EMAIL);
  await page.getByPlaceholder(/senha/i).fill(process.env.RAIZ_TEST_PASSWORD);
  await page.getByRole('button', { name: /entrar/i }).click();
  await expect(page.getByText('Sua conta está pronta')).toBeVisible();
  await expect(page.getByRole('button', { name: /agora não/i })).toBeVisible();
});
