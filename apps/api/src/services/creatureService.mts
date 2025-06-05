import type {Creature, Size, Alignment} from '@demesne/types';
import fetch from 'node-fetch';
import logger from '../utils/logger.mts';

const DND_API_BASE = 'https://dnd5eapi.co/api';
const FETCH_SIZE = 3;

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

const parsePassivePerception = (senses: string[]): number => {
    const passivePerception = senses.find(s => s.includes('passive Perception'));
    if (passivePerception) {
        const match = passivePerception.match(/\d+/);
        return match ? parseInt(match[0]) : 10;
    }
    return 10;
};

// Transform D&D API monster data to our Creature type
const transformMonster = (monster: {
  index: string;
  name: string;
  desc?: string[];
  size?: string;
  type?: string;
  subtype?: string;
  alignment?: string;
  armor_class?: Array<{ value: number }>;
  hit_points?: number;
  speed?: { walk?: number };
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  proficiencies?: Array<{ proficiency: { name: string }; value: number }>;
  damage_vulnerabilities?: string[];
  damage_resistances?: string[];
  damage_immunities?: string[];
  condition_immunities?: Array<{ name: string }>;
  senses?: string[];
  languages?: Array<{ name: string }>;
  challenge_rating?: string;
  xp?: number;
  special_abilities?: Array<{ name: string; desc: string }>;
  actions?: Array<{ name: string; desc: string }>;
  legendary_actions?: Array<{ name: string; desc: string }>;
}): Creature => {
    // Combine special abilities, actions, and legendary actions into a single description
    const specialAbilities = monster.special_abilities?.map(ability => `${ability.name}. ${ability.desc}`).join('\n\n') || '';
    const actions = monster.actions?.map(action => `${action.name}. ${action.desc}`).join('\n\n') || '';
    const legendaryActions = monster.legendary_actions?.map(action => `${action.name}. ${action.desc}`).join('\n\n') || '';
    
    const fullDescription = [
        specialAbilities,
        actions,
        legendaryActions
    ].filter(Boolean).join('\n\n');

    return {
        id: monster.index,
        name: monster.name,
        description: fullDescription || 'No description available.',
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
            strength: 0,
            dexterity: 0,
            constitution: 0,
            intelligence: 0,
            wisdom: 0,
            charisma: 0
        },
        senses: {
            darkvision: parseSense(Array.isArray(monster.senses) ? monster.senses : [], 'darkvision'),
            blindsight: parseSense(Array.isArray(monster.senses) ? monster.senses : [], 'blindsight'),
            tremorsense: parseSense(Array.isArray(monster.senses) ? monster.senses : [], 'tremorsense'),
            truesight: parseSense(Array.isArray(monster.senses) ? monster.senses : [], 'truesight'),
            passivePerception: parsePassivePerception(Array.isArray(monster.senses) ? monster.senses : [])
        },
        languages: Array.isArray(monster.languages) ? monster.languages.map(l => l.name) : [],
        challengeRating: {
            rating: parseFloat(monster.challenge_rating || '0'),
            xp: monster.xp || 0
        },
        creatureType: {
            size: (monster.size as Size) || 'Medium',
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
        
        const data = await response.json() as { results: Array<{ index: string }> };
        if (!data.results || !Array.isArray(data.results)) {
            const errorMessage = 'Invalid API response format: missing or invalid results array';
            logger.error(errorMessage);
            throw new Error(errorMessage);
        }
        
        // Randomly select FETCH_SIZE monsters
        const shuffledResults = data.results.sort(() => 0.5 - Math.random());
        const selectedMonsters = shuffledResults.slice(0, FETCH_SIZE);
        
        logger.info(`Found ${data.results.length} monsters, fetching details for ${FETCH_SIZE} random ones...`);
        // Then fetch details for each selected monster
        const monsterPromises = selectedMonsters.map(async (monster: { index: string }) => {
            try {
                const monsterResponse = await fetch(`${DND_API_BASE}/monsters/${monster.index}`);
                if (!monsterResponse.ok) {
                    logger.warn(`Failed to fetch details for monster ${monster.index}: ${monsterResponse.status} ${monsterResponse.statusText}`);
                    return null;
                }
                const monsterData = await monsterResponse.json() as Parameters<typeof transformMonster>[0];
                logger.info(`Monster ${monster.index} description:`, monsterData.desc);
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