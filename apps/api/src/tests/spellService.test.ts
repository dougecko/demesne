import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSpells } from '../services/spellService.mjs';
import fetch from 'node-fetch';
import type { SpellAPIResponse } from '../types/dndApi';
import { transformSpell } from '../services/spellService.mjs';

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

  describe('transformSpell', () => {
    it('transforms a basic spell correctly', () => {
      const mockSpell: SpellAPIResponse = {
        index: 'test-spell',
        name: 'Test Spell',
        desc: ['This is a test spell description.', 'It has multiple paragraphs.'],
        higher_level: ['At higher levels, this spell does more damage.'],
        range: '60 feet',
        components: ['V', 'S', 'M'],
        material: 'A pinch of dust',
        ritual: false,
        duration: '1 minute',
        concentration: true,
        casting_time: '1 action',
        level: 3,
        attack_type: 'ranged',
        damage: {
          damage_type: { index: 'fire', name: 'Fire', url: '' },
          damage_at_slot_level: {
            '3': '3d6',
            '4': '4d6',
            '5': '5d6'
          }
        },
        school: { index: 'evocation', name: 'Evocation', url: '' },
        classes: [
          { index: 'wizard', name: 'Wizard', url: '' },
          { index: 'sorcerer', name: 'Sorcerer', url: '' }
        ],
        subclasses: [
          { index: 'draconic', name: 'Draconic', url: '' }
        ],
        url: ''
      };

      const result = transformSpell(mockSpell);

      expect(result).toEqual({
        id: 'test-spell',
        name: 'Test Spell',
        description: 'This is a test spell description.\n\nIt has multiple paragraphs.',
        higherLevel: 'At higher levels, this spell does more damage.',
        range: '60 feet',
        components: ['V', 'S', 'M'],
        material: 'A pinch of dust',
        ritual: false,
        duration: '1 minute',
        concentration: true,
        castingTime: '1 action',
        level: 3,
        attackType: 'ranged',
        damage: {
          type: 'Fire',
          atSlotLevel: {
            '3': '3d6',
            '4': '4d6',
            '5': '5d6'
          }
        },
        school: 'Evocation',
        classes: ['Wizard', 'Sorcerer'],
        subclasses: ['Draconic']
      });
    });

    it('handles missing optional fields', () => {
      const mockSpell: SpellAPIResponse = {
        index: 'minimal-spell',
        name: 'Minimal Spell',
        desc: ['A simple spell.'],
        range: 'Self',
        components: ['V'],
        ritual: false,
        duration: 'Instantaneous',
        concentration: false,
        casting_time: '1 action',
        level: 0,
        school: { index: 'abjuration', name: 'Abjuration', url: '' },
        classes: [
          { index: 'cleric', name: 'Cleric', url: '' }
        ],
        subclasses: [],
        url: ''
      };

      const result = transformSpell(mockSpell);

      expect(result).toEqual({
        id: 'minimal-spell',
        name: 'Minimal Spell',
        description: 'A simple spell.',
        higherLevel: undefined,
        range: 'Self',
        components: ['V'],
        material: undefined,
        ritual: false,
        duration: 'Instantaneous',
        concentration: false,
        castingTime: '1 action',
        level: 0,
        attackType: undefined,
        damage: undefined,
        school: 'Abjuration',
        classes: ['Cleric'],
        subclasses: []
      });
    });

    it('handles spells with multiple paragraphs in description', () => {
      const mockSpell: SpellAPIResponse = {
        index: 'multi-paragraph-spell',
        name: 'Multi-Paragraph Spell',
        desc: [
          'First paragraph.',
          'Second paragraph.',
          'Third paragraph.'
        ],
        range: 'Touch',
        components: ['V', 'S'],
        ritual: true,
        duration: '8 hours',
        concentration: false,
        casting_time: '1 minute',
        level: 1,
        school: { index: 'divination', name: 'Divination', url: '' },
        classes: [
          { index: 'wizard', name: 'Wizard', url: '' }
        ],
        subclasses: [],
        url: ''
      };

      const result = transformSpell(mockSpell);

      expect(result.description).toBe('First paragraph.\n\nSecond paragraph.\n\nThird paragraph.');
    });
  });
}); 