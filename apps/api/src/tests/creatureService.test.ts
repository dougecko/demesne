import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCreatures, createCreature } from '../services/creatureService.mjs';
import { mockCreatures } from './mockData.js';
import fetch from 'node-fetch';

// Mock node-fetch
vi.mock('node-fetch', () => ({
    default: vi.fn()
}));

// Mock the parseSense function
const parseSense = (senses: string[] | undefined, senseName: string, fallback: number | undefined = undefined): number | undefined => {
  const match = senses?.find((s) => s.includes(senseName))?.match(/\d+/)?.[0] ?? '';
  const value = parseInt(match, 10);
  return isNaN(value) ? fallback : value;
};

describe('parseSense', () => {
  it('should return the correct value when the sense is found', () => {
    const senses = ['darkvision 60 ft.', 'blindsight 30 ft.'];
    expect(parseSense(senses, 'darkvision')).toBe(60);
  });

  it('should return undefined when the sense is not found', () => {
    const senses = ['blindsight 30 ft.'];
    expect(parseSense(senses, 'darkvision')).toBeUndefined();
  });

  it('should return the fallback value when the sense is not found and fallback is provided', () => {
    const senses = ['blindsight 30 ft.'];
    expect(parseSense(senses, 'darkvision', 10)).toBe(10);
  });
});

describe('creatureService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getCreatures', () => {
        it('should fetch creatures from the API', async () => {
            // Prepare mock data to match the expected API shape
            const monsterList = {
                results: mockCreatures.map((c) => ({ index: c.id }))
            };
            // Map each id to the corresponding mockCreature
            const monsterDetails = Object.fromEntries(
                mockCreatures.map((c) => [c.id, {
                    index: c.id,
                    name: c.name,
                    desc: c.description,
                    strength: c.stats.strength.value,
                    dexterity: c.stats.dexterity.value,
                    constitution: c.stats.constitution.value,
                    intelligence: c.stats.intelligence.value,
                    wisdom: c.stats.wisdom.value,
                    charisma: c.stats.charisma.value,
                    armor_class: [{ value: c.armorClass }],
                    hit_points: c.hitPoints,
                    speed: { walk: c.speed },
                    proficiencies: [],
                    senses: [
                        c.senses.darkvision ? `darkvision ${c.senses.darkvision} ft.` : undefined,
                        c.senses.passivePerception ? `passive Perception ${c.senses.passivePerception}` : undefined
                    ].filter(Boolean),
                    languages: c.languages.map((l) => ({ name: l })),
                    challenge_rating: c.challengeRating.rating.toString(),
                    xp: c.challengeRating.xp,
                    size: c.creatureType.size,
                    type: c.creatureType.type,
                    subtype: c.creatureType.subtype,
                    alignment: c.creatureType.alignment
                }])
            );
            // Mock fetch: first call returns monster list, subsequent calls return monster details
            (fetch as unknown as { mockImplementation: Function; mockResolvedValue: Function }).mockImplementation((url: string) => {
                if (url.endsWith('/monsters')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve(monsterList)
                    });
                }
                const id = url.split('/').pop();
                if (monsterDetails[id!]) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve(monsterDetails[id!])
                    });
                }
                return Promise.resolve({
                    ok: false,
                    status: 404,
                    statusText: 'Not Found'
                });
            });

            const result = await getCreatures();
            expect(result).toEqual(
                expect.arrayContaining(
                    mockCreatures.map((c) => expect.objectContaining({ id: c.id, name: c.name }))
                )
            );
            expect(fetch).toHaveBeenCalledWith('https://dnd5eapi.co/api/monsters');
        });

        it('should handle API errors', async () => {
            (fetch as unknown as { mockResolvedValue: Function }).mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            });

            await expect(getCreatures()).rejects.toThrow('API responded with status: 500 Internal Server Error');
        });

        it('should handle invalid API response format', async () => {
            (fetch as unknown as { mockResolvedValue: Function }).mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ invalid: 'format' })
            });

            await expect(getCreatures()).rejects.toThrow('Invalid API response format: missing or invalid results array');
        });

        it('should handle individual monster fetch failures', async () => {
            const monsterList = {
                results: [
                    { index: 'valid-monster' },
                    { index: 'invalid-monster' }
                ]
            };

            (fetch as unknown as { mockImplementation: Function; mockResolvedValue: Function }).mockImplementation((url: string) => {
                if (url.endsWith('/monsters')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve(monsterList)
                    });
                }
                const id = url.split('/').pop();
                if (id === 'valid-monster') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({
                            index: 'valid-monster',
                            name: 'Valid Monster',
                            desc: 'A valid monster',
                            strength: 10,
                            dexterity: 10,
                            constitution: 10,
                            intelligence: 10,
                            wisdom: 10,
                            charisma: 10,
                            armor_class: [{ value: 10 }],
                            hit_points: 10,
                            speed: { walk: 30 },
                            proficiencies: [],
                            senses: [],
                            languages: [],
                            challenge_rating: '1',
                            xp: 100,
                            size: 'Medium',
                            type: 'humanoid',
                            alignment: 'neutral'
                        })
                    });
                }
                return Promise.resolve({
                    ok: false,
                    status: 404,
                    statusText: 'Not Found'
                });
            });

            const result = await getCreatures();
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('valid-monster');
        });
    });
}); 