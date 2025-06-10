import type {Creature, Size, Alignment} from '@demesne/types';
import type {MonsterAPIResponse, APIListResponse} from '../types/dndApi';
import fetch from 'node-fetch';
import { logger } from '../utils/logger.js';

const DND_API_BASE = 'https://dnd5eapi.co/api';
const FETCH_SIZE = 3;

// Helper function to create attribute value and modifier
const createValue = (value: number) => ({
    value: value,
    modifier: Math.floor((value - 10) / 2)
});

// Helper to extract a sense value from the senses object
const parseSense = (senses: { [key: string]: any } | undefined, senseName: string, fallback: number | undefined = undefined): number | undefined => {
  logger.debug('parseSense input:', { senses, senseName, fallback });
  
  if (!senses) return fallback;
  
  // Map our sense names to the API's property names
  const senseMap: { [key: string]: string } = {
    'darkvision': 'darkvision',
    'blindsight': 'blindsight',
    'tremorsense': 'tremorsense',
    'truesight': 'truesight',
    'passive Perception': 'passive_perception'
  };
  
  const apiKey = senseMap[senseName];
  if (!apiKey || !senses[apiKey]) return fallback;
  
  // For passive perception, the value is already a number
  if (apiKey === 'passive_perception') {
    return senses[apiKey];
  }
  
  // For other senses, extract the number from the string (e.g., "60 ft." -> 60)
  const match = senses[apiKey].match(/(\d+)/);
  if (!match) return fallback;
  
  const value = parseInt(match[1], 10);
  return isNaN(value) ? fallback : value;
};

// Transform D&D API monster data to our Creature type
export const transformMonster = (monster: MonsterAPIResponse): Creature => {
  logger.debug('transformMonster input:', { 
    name: monster.name,
    senses: monster.senses
  });

  const description = monster.desc || '';
  const specialAbilities = monster.special_abilities || [];
  const actions = monster.actions || [];
  const legendaryActions = monster.legendary_actions || [];

  return {
    id: monster.index,
    name: monster.name,
    description,
    actions: {
      specialAbilities,
      actions,
      legendaryActions
    },
    stats: {
      strength: { value: monster.strength, modifier: Math.floor((monster.strength - 10) / 2) },
      dexterity: { value: monster.dexterity, modifier: Math.floor((monster.dexterity - 10) / 2) },
      constitution: { value: monster.constitution, modifier: Math.floor((monster.constitution - 10) / 2) },
      intelligence: { value: monster.intelligence, modifier: Math.floor((monster.intelligence - 10) / 2) },
      wisdom: { value: monster.wisdom, modifier: Math.floor((monster.wisdom - 10) / 2) },
      charisma: { value: monster.charisma, modifier: Math.floor((monster.charisma - 10) / 2) }
    },
    armorClass: monster.armor_class[0].value,
    hitPoints: monster.hit_points,
    speed: parseInt(monster.speed.walk || '0', 10),
    skills: (monster.proficiencies || [])
      .filter((p) => p.proficiency?.name?.startsWith('Skill: '))
      .map((p) => `${p.proficiency.name.replace('Skill: ', '')} +${p.value}`),
    senses: {
      darkvision: parseSense(monster.senses, 'darkvision') ?? 0,
      blindsight: parseSense(monster.senses, 'blindsight') ?? 0,
      tremorsense: parseSense(monster.senses, 'tremorsense') ?? 0,
      truesight: parseSense(monster.senses, 'truesight') ?? 0,
      passivePerception: parseSense(monster.senses, 'passive Perception') ?? 0
    },
    languages: monster.languages.map((l) => l.name),
    challengeRating: {
      rating: monster.challenge_rating,
      xp: monster.xp
    },
    creatureType: {
      size: monster.size as Size,
      type: monster.type,
      subtype: monster.subtype,
      alignment: monster.alignment as Alignment
    },
    savingThrows: {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0
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
        
        const data = await response.json() as APIListResponse;
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
        const monsterPromises = selectedMonsters.map(async (monster) => {
            try {
                const monsterResponse = await fetch(`${DND_API_BASE}/monsters/${monster.index}`);
                if (!monsterResponse.ok) {
                    logger.warn(`Failed to fetch details for monster ${monster.index}: ${monsterResponse.status} ${monsterResponse.statusText}`);
                    return null;
                }
                const monsterData = await monsterResponse.json() as MonsterAPIResponse;
                logger.info(`Monster ${monster.index} description:`, monsterData.desc);
                return transformMonster(monsterData);
            } catch (error) {
                logger.error(`Error fetching details for monster ${monster.index}:`, error);
                return null;
            }
        });

        const creatures = (await Promise.all(monsterPromises)).filter((c): c is Creature => c !== null);
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