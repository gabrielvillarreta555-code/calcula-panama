import { test, expect } from '@playwright/test';

test('muestra de rendimiento de Blue en Chromium', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/calculadoras/vacaciones/');
  const sample = await page.evaluate(() => new Promise<{ frames: number; elapsed: number; worst: number }>(resolve => {
    let frames = 0, start = 0, previous = 0, worst = 0;
    function tick(now: number) {
      if (!start) { start = now; previous = now; }
      worst = Math.max(worst, now - previous);
      previous = now;
      frames++;
      if (now - start >= 2000) resolve({ frames, elapsed: now - start, worst });
      else requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }));
  console.log(`BLUE_PERF frames=${sample.frames} duration_ms=${Math.round(sample.elapsed)} fps=${(sample.frames * 1000 / sample.elapsed).toFixed(1)} max_gap_ms=${sample.worst.toFixed(1)}`);
  expect(sample.frames).toBeGreaterThan(0);
});
