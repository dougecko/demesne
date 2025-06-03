import type { Creature } from '../models/types.mts';

// Mock data - replace with actual data fetching logic
const creatures: Creature[] = [
    {
        id: '1', name: 'Thing 1', description: 'First creature',
        stats: {
            strength: 0,
            dexterity: 0,
            constitution: 0,
            intelligence: 0,
            wisdom: 0,
            charisma: 0
        },
        speed: 0,
        skills: [],
        armorClass: 0,
        hitPoints: 0,
        savingThrows: {
            strength: 0,
            dexterity: 0,
            constitution: 0,
            intelligence: 0,
            wisdom: 0,
            charisma: 0
        }
    },
    {
        id: '2', name: 'Thing 2', description: 'Second creature',
        stats: {
            strength: 0,
            dexterity: 0,
            constitution: 0,
            intelligence: 0,
            wisdom: 0,
            charisma: 0
        },
        speed: 0,
        skills: [],
        armorClass: 0,
        hitPoints: 0,
        savingThrows: {
            strength: 0,
            dexterity: 0,
            constitution: 0,
            intelligence: 0,
            wisdom: 0,
            charisma: 0
        }
    }
];

export const getCreatures = async (): Promise<Creature[]> => {
    // In a real app, this would fetch from a database or external API
    return creatures;
};

export const createCreature = async (data: Omit<Creature, 'id'>): Promise<Creature> => {
    // In a real app, this would insert into a database
    const newCreature: Creature = {
        id: Date.now().toString(),
        ...data
    };

    creatures.push(newCreature);
    return newCreature;
};