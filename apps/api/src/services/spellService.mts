import type { Spell } from '@demesne/types';
import type { SpellAPIResponse, APIListResponse } from '../types/dndApi';
import fetch from 'node-fetch';
import { logger } from '../utils/logger.js';

const DND_API_BASE = 'https://dnd5eapi.co/api';
const FETCH_SIZE = 3;

export function transformSpell(spell: SpellAPIResponse): Spell {
  return {
    id: spell.index,
    name: spell.name,
    description: spell.desc.join('\n\n'),
    higherLevel: spell.higher_level?.[0],
    range: spell.range,
    components: spell.components,
    material: spell.material,
    ritual: spell.ritual,
    duration: spell.duration,
    concentration: spell.concentration,
    castingTime: spell.casting_time,
    level: spell.level,
    attackType: spell.attack_type,
    damage: spell.damage ? {
      type: spell.damage.damage_type?.name ?? 'Unknown',
      atSlotLevel: spell.damage.damage_at_slot_level
    } : undefined,
    school: spell.school.name,
    classes: spell.classes.map(c => c.name),
    subclasses: spell.subclasses.map(s => s.name)
  };
}

export const getSpells = async (): Promise<Spell[]> => {
  try {
    logger.info('Fetching spell list from D&D 5e API...');
    // First, get the list of all spells
    const response = await fetch(`${DND_API_BASE}/spells`);
    if (!response.ok) {
      const errorMessage = `API responded with status: ${response.status} ${response.statusText}`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    const data = await response.json() as APIListResponse;
    if (!data.results || !Array.isArray(data.results)) {
      const errorMessage = 'Invalid API response format: missing or invalid results array';
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    // Randomly select FETCH_SIZE spells
    const shuffledResults = data.results.sort(() => 0.5 - Math.random());
    const selectedSpells = shuffledResults.slice(0, FETCH_SIZE);
    
    logger.info(`Found ${data.results.length} spells, fetching details for ${FETCH_SIZE} random ones...`);
    // Then fetch details for each selected spell
    const spellPromises = selectedSpells.map(async (spell) => {
      try {
        const spellResponse = await fetch(`${DND_API_BASE}/spells/${spell.index}`);
        if (!spellResponse.ok) {
          logger.warn(`Failed to fetch details for spell ${spell.index}: ${spellResponse.status} ${spellResponse.statusText}`);
          return null;
        }
        const spellData = await spellResponse.json() as SpellAPIResponse;
        logger.info(`Spell ${spell.index} description:`, spellData.desc);
        return transformSpell(spellData);
      } catch (error) {
        logger.error(`Error fetching details for spell ${spell.index}:`, error);
        return null;
      }
    });

    const spells = (await Promise.all(spellPromises)).filter((s): s is Spell => s !== null);
    logger.info(`Successfully fetched ${spells.length} spells`);
    return spells;
  } catch (error) {
    logger.error('Error fetching spells:', error);
    throw error;
  }
};

export const createSpell = async (data: Omit<Spell, 'id'>): Promise<Spell> => {
  return {
    id: Date.now().toString(),
    ...data
  };
};

// Mock data for spells
const mockSpells: Spell[] = [
    {
        id: 'fireball',
        name: 'Fireball',
        description: 'A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame.',
        level: 3,
        school: 'evocation',
        castingTime: '1 action',
        range: '150 feet',
        components: ['V', 'S', 'M'],
        material: 'a tiny ball of bat guano and sulfur',
        duration: 'Instantaneous',
        ritual: false,
        concentration: false,
        damage: {
            type: 'fire',
            atSlotLevel: {
                '3': '8d6',
                '4': '9d6',
                '5': '10d6',
                '6': '11d6',
                '7': '12d6',
                '8': '13d6',
                '9': '14d6'
            }
        },
        classes: ['sorcerer', 'wizard'],
        subclasses: ['dragon', 'phoenix']
    },
    {
        id: 'magic-missile',
        name: 'Magic Missile',
        description: 'You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within range.',
        level: 1,
        school: 'evocation',
        castingTime: '1 action',
        range: '120 feet',
        components: ['V', 'S'],
        duration: 'Instantaneous',
        ritual: false,
        concentration: false,
        damage: {
            type: 'force',
            atSlotLevel: {
                '1': '1d4+1',
                '2': '2d4+2',
                '3': '3d4+3',
                '4': '4d4+4',
                '5': '5d4+5',
                '6': '6d4+6',
                '7': '7d4+7',
                '8': '8d4+8',
                '9': '9d4+9'
            }
        },
        classes: ['sorcerer', 'wizard'],
        subclasses: ['dragon', 'phoenix']
    }
];

export const getMockSpells = async (): Promise<Spell[]> => {
    logger.debug('Fetching spells');
    return mockSpells;
};

export const createMockSpell = async (spell: Spell): Promise<Spell> => {
    logger.debug('Creating new spell:', spell);
    // In a real application, this would save to a database
    return spell;
}; 