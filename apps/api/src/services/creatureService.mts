import type { Creature } from '../models/types.mts';

// Mock data - replace with actual data fetching logic
const creatures: Creature[] = [
    { id: '1', name: 'Creature 1', description: 'First creature' },
    { id: '2', name: 'Creature 2', description: 'Second creature' }
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