import type {Creature, Size, Alignment} from '@demesne/types';
import fetch from 'node-fetch';
import logger from '../utils/logger.mts';

const DND_API_BASE = 'https://dnd5eapi.co/api';

// Helper function to create attribute value and modifier
const createValue = (value: number) => ({
    value: value,
    modifier: Math.floor((value - 10) / 2)
});

// Helper to extract a sense value from the senses array
function parseSense(senses: string[] | undefined, senseName: string, fallback: number | undefined = undefined): number | undefined {
  const match = senses?.find((s) => s.includes(senseName))?.match(/\d+/)?.[0] ?? '';
  const value = parseInt(match, 10);
  return isNaN(value) ? fallback : value;
}

// Transform D&D API monster data to our Creature type
const transformMonster = (monster: {
  index: string;
  name: string;
  desc?: string;
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  armor_class?: Array<{ value: number }>;
  hit_points?: number;
  speed?: { walk?: number };
  proficiencies?: Array<{ proficiency: { name: string }; value: number }>;
  strength_save?: number;
  dexterity_save?: number;
  constitution_save?: number;
  intelligence_save?: number;
  wisdom_save?: number;
  charisma_save?: number;
  senses?: string[];
  languages?: Array<{ name: string }>;
  challenge_rating?: string;
  xp?: number;
  size?: string;
  type?: string;
  subtype?: string;
  alignment?: string;
}): Creature => {
    return {
        id: monster.index,
        name: monster.name,
        description: monster.desc || 'No description available.',
        stats: {
            strength: createValue(monster.strength || 10),
            dexterity: createValue(monster.dexterity || 10),
            constitution: createValue(monster.constitution || 10),
            intelligence: createValue(monster.intelligence || 10),
            wisdom: createValue(monster.wisdom || 10),
            charisma: createValue(monster.charisma || 10)
        },
        armorClass: monster.armor_class?.[0]?.value || 10,
        hitPoints: monster.hit_points || 0,
        speed: monster.speed?.walk || 30,
        skills: monster.proficiencies
            ?.filter((p) => p.proficiency.name.startsWith('Skill: '))
            .map((p) => `${p.proficiency.name.replace('Skill: ', '')} +${p.value}`) || [],
        savingThrows: {
            strength: monster.strength_save || 0,
            dexterity: monster.dexterity_save || 0,
            constitution: monster.constitution_save || 0,
            intelligence: monster.intelligence_save || 0,
            wisdom: monster.wisdom_save || 0,
            charisma: monster.charisma_save || 0
        },
        senses: {
            darkvision: parseSense(monster.senses, 'darkvision'),
            blindsight: parseSense(monster.senses, 'blindsight'),
            tremorsense: parseSense(monster.senses, 'tremorsense'),
            truesight: parseSense(monster.senses, 'truesight'),
            passivePerception: parseSense(monster.senses, 'passive Perception', 10) ?? 10
        },
        languages: (monster.languages?.map((l) => l.name).filter((name): name is string => typeof name === 'string')) || [],
        challengeRating: {
            rating: parseFloat(monster.challenge_rating ?? '0') || 0,
            xp: monster.xp || 0
        },
        creatureType: {
            size: typeof monster.size === 'string' ? (monster.size as Size) : 'Medium',
            type: typeof monster.type === 'string' ? monster.type : 'unknown',
            subtype: typeof monster.subtype === 'string' ? monster.subtype : undefined,
            alignment: typeof monster.alignment === 'string' ? (monster.alignment as Alignment) : 'unaligned'
        }
    };
};

export const getCreatures = async (): Promise<Creature[]> => {
    try {
        logger.info('Fetching monster list from D&D 5e API...');
        // First, get the list of all monsters
        const response = await fetch(`${DND_API_BASE}/monsters`);
        if (!response.ok) {
            const errorMessage = `API responded with status: ${response.status} ${response.statusText}`;
            logger.error(errorMessage);
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        if (!data.results || !Array.isArray(data.results)) {
            const errorMessage = 'Invalid API response format: missing or invalid results array';
            logger.error(errorMessage);
            throw new Error(errorMessage);
        }
        
        logger.info(`Found ${data.results.length} monsters, fetching details for first 20...`);
        // Then fetch details for each monster (limit to first 20 for performance)
        const monsterPromises = data.results.slice(0, 20).map(async (monster: { index: string }) => {
            try {
                const monsterResponse = await fetch(`${DND_API_BASE}/monsters/${monster.index}`);
                if (!monsterResponse.ok) {
                    logger.warn(`Failed to fetch details for monster ${monster.index}: ${monsterResponse.status} ${monsterResponse.statusText}`);
                    return null;
                }
                const monsterData = await monsterResponse.json();
                return transformMonster(monsterData);
            } catch (error) {
                logger.error(`Error fetching details for monster ${monster.index}:`, error);
                return null;
            }
        });

        const creatures = (await Promise.all(monsterPromises)).filter((c: Creature | null): c is Creature => c !== null);
        logger.info(`Successfully fetched ${creatures.length} creatures`);
        return creatures;
    } catch (error) {
        logger.error('Error fetching creatures:', error);
        throw error;
    }
};

export const createCreature = async (data: Omit<Creature, 'id'>): Promise<Creature> => {
    return {
        id: Date.now().toString(),
        ...data
    };
};