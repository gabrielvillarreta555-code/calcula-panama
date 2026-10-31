import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BLUE_GUIDES } from './blue-help';

const pages = {
  salary: 'salario-neto',
  thirteenth: 'decimo-tercer-mes',
  vacation: 'vacaciones',
  termination: 'liquidacion-laboral'
} as const;

describe('guías de Blue', () => {
  for (const [key, page] of Object.entries(pages) as [keyof typeof pages, string][]) {
    it(`mantiene los accesos de ${page} apuntando a campos existentes`, () => {
      const source = readFileSync(`src/pages/calculadoras/${page}.astro`, 'utf8');
      const guide = BLUE_GUIDES[key];
      expect(guide.topics.length).toBeGreaterThanOrEqual(4);
      for (const topic of guide.topics) {
        expect(topic.title.trim()).not.toBe('');
        expect(topic.text.trim()).not.toBe('');
        if (topic.target) {
          expect(source).toContain(`id="${topic.target}"`);
          expect(topic.targetLabel).toBeTruthy();
          expect(topic.focusHint).toBeTruthy();
        }
      }
    });
  }
});
