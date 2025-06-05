import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSpells } from '../services/spellService.mjs';
import fetch from 'node-fetch';

// Mock fetch
vi.mock('node-fetch', () => ({
  default: vi.fn()
}));

// Mock logger
vi.mock('../utils/logger.mjs', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }
}));

describe('spellService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSpells', () => {
    it('should fetch spells from the API', async () => {
      const mockSpells = {
        results: [
          { index: 'fireball', name: 'Fireball' },
          { index: 'magic-missile', name: 'Magic Missile' },
          { index: 'cure-wounds', name: 'Cure Wounds' }
        ]
      };

      const mockSpellDetails = {
        index: 'fireball',
        name: 'Fireball',
        desc: ['A bright streak flashes from your pointing finger...'],
        level: 3,
        school: { name: 'Evocation' },
        classes: [{ name: 'Wizard' }]
      };

      (fetch as unknown as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSpells)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSpellDetails)
        });

      const spells = await getSpells();
      expect(spells).toHaveLength(1);
      expect(spells[0].name).toBe('Fireball');
      expect(spells[0].level).toBe(3);
    });

    it('should handle API errors', async () => {
      (fetch as unknown as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error'
        });

      await expect(getSpells()).rejects.toThrow('API responded with status: 500 Internal Server Error');
    });

    it('should handle invalid API response format', async () => {
      (fetch as unknown as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({})
        });

      await expect(getSpells()).rejects.toThrow('Invalid API response format: missing or invalid results array');
    });

    it('should handle individual spell fetch failures', async () => {
      const mockSpells = {
        results: [
          { index: 'valid-spell', name: 'Valid Spell' },
          { index: 'invalid-spell', name: 'Invalid Spell' }
        ]
      };

      (fetch as unknown as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSpells)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ index: 'valid-spell', name: 'Valid Spell' })
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found'
        });

      const spells = await getSpells();
      expect(spells).toHaveLength(1);
      expect(spells[0].name).toBe('Valid Spell');
    });
  });
}); 