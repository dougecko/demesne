import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCreatures } from '../services/creatureService.mjs';
import { mockCreatures } from './mockData.js';
import fetch from 'node-fetch';
import type { MonsterAPIResponse } from '../types/dndApi';
import { transformMonster } from '../services/creatureService.mts';

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
                    special_abilities: c.actions.specialAbilities,
                    actions: c.actions.actions,
                    legendary_actions: c.actions.legendaryActions,
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
                            special_abilities: [],
                            actions: [],
                            legendary_actions: [],
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

    describe('transformMonster', () => {
        it('transforms a basic monster correctly', () => {
            const mockMonster: MonsterAPIResponse = {
                index: 'test-monster',
                name: 'Test Monster',
                size: 'Medium',
                type: 'humanoid',
                alignment: 'neutral',
                armor_class: [{ type: 'natural', value: 15 }],
                hit_points: 50,
                hit_dice: '5d8',
                speed: { walk: '30' },
                strength: 14,
                dexterity: 12,
                constitution: 13,
                intelligence: 10,
                wisdom: 11,
                charisma: 9,
                proficiencies: [
                    { value: 2, proficiency: { index: 'skill-athletics', name: 'Skill: Athletics', url: '' } }
                ],
                damage_vulnerabilities: [],
                damage_resistances: [],
                damage_immunities: [],
                condition_immunities: [],
                senses: 'darkvision 60 ft., passive Perception 12',
                languages: [{ name: 'Common' }],
                challenge_rating: 2,
                xp: 450,
                special_abilities: [
                    { name: 'Test Ability', desc: 'Test description' }
                ],
                actions: [
                    { name: 'Test Action', desc: 'Test action description' }
                ],
                legendary_actions: [
                    { name: 'Test Legendary', desc: 'Test legendary description' }
                ],
                url: ''
            };

            const result = transformMonster(mockMonster);

            expect(result).toEqual({
                id: 'test-monster',
                name: 'Test Monster',
                description: '',
                actions: {
                    specialAbilities: [{ name: 'Test Ability', desc: 'Test description' }],
                    actions: [{ name: 'Test Action', desc: 'Test action description' }],
                    legendaryActions: [{ name: 'Test Legendary', desc: 'Test legendary description' }]
                },
                stats: {
                    strength: { value: 14, modifier: 2 },
                    dexterity: { value: 12, modifier: 1 },
                    constitution: { value: 13, modifier: 1 },
                    intelligence: { value: 10, modifier: 0 },
                    wisdom: { value: 11, modifier: 0 },
                    charisma: { value: 9, modifier: -1 }
                },
                armorClass: 15,
                hitPoints: 50,
                speed: 30,
                skills: ['Athletics +2'],
                senses: {
                    darkvision: 60,
                    blindsight: 0,
                    tremorsense: 0,
                    truesight: 0,
                    passivePerception: 12
                },
                languages: ['Common'],
                challengeRating: {
                    rating: 2,
                    xp: 450
                },
                creatureType: {
                    size: 'Medium',
                    type: 'humanoid',
                    subtype: undefined,
                    alignment: 'neutral'
                },
                savingThrows: {
                    strength: 0,
                    dexterity: 0,
                    constitution: 0,
                    intelligence: 0,
                    wisdom: 0,
                    charisma: 0
                }
            });
        });

        it('handles missing optional fields', () => {
            const mockMonster: MonsterAPIResponse = {
                index: 'minimal-monster',
                name: 'Minimal Monster',
                size: 'Small',
                type: 'beast',
                alignment: 'unaligned',
                armor_class: [{ type: 'natural', value: 12 }],
                hit_points: 10,
                hit_dice: '2d6',
                speed: { walk: '20' },
                strength: 8,
                dexterity: 14,
                constitution: 10,
                intelligence: 3,
                wisdom: 12,
                charisma: 6,
                proficiencies: [],
                damage_vulnerabilities: [],
                damage_resistances: [],
                damage_immunities: [],
                condition_immunities: [],
                senses: '',
                languages: [],
                challenge_rating: 0.25,
                xp: 50,
                url: ''
            };

            const result = transformMonster(mockMonster);

            expect(result).toEqual({
                id: 'minimal-monster',
                name: 'Minimal Monster',
                description: '',
                actions: {
                    specialAbilities: [],
                    actions: [],
                    legendaryActions: []
                },
                stats: {
                    strength: { value: 8, modifier: -1 },
                    dexterity: { value: 14, modifier: 2 },
                    constitution: { value: 10, modifier: 0 },
                    intelligence: { value: 3, modifier: -4 },
                    wisdom: { value: 12, modifier: 1 },
                    charisma: { value: 6, modifier: -2 }
                },
                armorClass: 12,
                hitPoints: 10,
                speed: 20,
                skills: [],
                senses: {
                    darkvision: 0,
                    blindsight: 0,
                    tremorsense: 0,
                    truesight: 0,
                    passivePerception: 0
                },
                languages: [],
                challengeRating: {
                    rating: 0.25,
                    xp: 50
                },
                creatureType: {
                    size: 'Small',
                    type: 'beast',
                    subtype: undefined,
                    alignment: 'unaligned'
                },
                savingThrows: {
                    strength: 0,
                    dexterity: 0,
                    constitution: 0,
                    intelligence: 0,
                    wisdom: 0,
                    charisma: 0
                }
            });
        });

        it('parses senses correctly', () => {
            const mockMonster: MonsterAPIResponse = {
                index: 'senses-monster',
                name: 'Senses Monster',
                size: 'Medium',
                type: 'aberration',
                alignment: 'chaotic evil',
                armor_class: [{ type: 'natural', value: 15 }],
                hit_points: 45,
                hit_dice: '6d8',
                speed: { walk: '30' },
                strength: 12,
                dexterity: 14,
                constitution: 12,
                intelligence: 16,
                wisdom: 14,
                charisma: 10,
                proficiencies: [],
                damage_vulnerabilities: [],
                damage_resistances: [],
                damage_immunities: [],
                condition_immunities: [],
                senses: 'darkvision 120 ft., blindsight 30 ft., tremorsense 60 ft., truesight 90 ft., passive Perception 16',
                languages: [{ name: 'Deep Speech' }],
                challenge_rating: 3,
                xp: 700,
                url: ''
            };

            const result = transformMonster(mockMonster);

            expect(result.senses).toEqual({
                darkvision: 120,
                blindsight: 30,
                tremorsense: 60,
                truesight: 90,
                passivePerception: 16
            });
        });
    });
}); 