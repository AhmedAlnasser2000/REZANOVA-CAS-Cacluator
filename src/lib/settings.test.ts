import { describe, expect, it } from 'vitest';
import { settingsSchema } from './schemas';
import { DEFAULT_SETTINGS } from '../types/calculator';

describe('settings schema', () => {
  it('applies defaults for new SX1 fields when parsing an older payload', () => {
    const parsed = settingsSchema.parse({
      angleUnit: 'deg',
      outputStyle: 'both',
      historyEnabled: true,
      autoSwitchToEquation: false,
    });

    expect(parsed).toEqual(DEFAULT_SETTINGS);
  });

  it('preserves an explicit full SX1 payload', () => {
    const parsed = settingsSchema.parse({
      angleUnit: 'rad',
      outputStyle: 'exact',
      historyEnabled: false,
      autoSwitchToEquation: true,
      uiScale: 130,
      mathScale: 115,
      resultScale: 145,
      highContrast: true,
      symbolicDisplayMode: 'powers',
      flattenNestedRootsWhenSafe: false,
    });

    expect(parsed.uiScale).toBe(130);
    expect(parsed.mathScale).toBe(115);
    expect(parsed.resultScale).toBe(145);
    expect(parsed.highContrast).toBe(true);
    expect(parsed.symbolicDisplayMode).toBe('powers');
    expect(parsed.flattenNestedRootsWhenSafe).toBe(false);
  });
});
