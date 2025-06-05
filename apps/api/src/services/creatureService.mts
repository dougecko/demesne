import type {Creature} from '@demesne/types';

// Mock data - replace with actual data fetching logic
const createValue = (value: number) => {
    return {
        value: value,
        modifier: Math.floor((value - 10) / 2)
    }
}

const creatures: Creature[] = [
    {
        id: '1',
        name: 'Goblin',
        description: 'Small, green-skinned creatures known for their cunning and stealth. They favor ambush tactics and rarely fight fair.',
        stats: {
            strength: createValue(8),
            dexterity: createValue(14),
            constitution: createValue(10),
            intelligence: createValue(10),
            wisdom: createValue(8),
            charisma: createValue(8)
        },
        armorClass: 15,
        hitPoints: 7,
        speed: 30,
        skills: ['Stealth +6'],
        savingThrows: {
            strength: 0,
            dexterity: 2,
            constitution: 0,
            intelligence: 0,
            wisdom: 0,
            charisma: 0
        },
        senses: {
            darkvision: 60,
            passivePerception: 9
        },
        languages: ['Common', 'Goblin'],
        challengeRating: {
            rating: 0.25,
            xp: 50
        },
        creatureType: {
            size: 'Small',
            type: 'humanoid',
            subtype: 'goblinoid',
            alignment: 'neutral evil'
        }
    },
    {
        id: '2',
        name: 'Owlbear',
        description: 'A terrifying combination of owl and bear, these creatures are known for their ferocity and territorial nature. Their screech can be heard for miles when they are on the hunt.',
        stats: {
            strength: createValue(20),
            dexterity: createValue(12),
            constitution: createValue(17),
            intelligence: createValue(3),
            wisdom: createValue(12),
            charisma: createValue(7)
        },
        armorClass: 13,
        hitPoints: 59,
        speed: 40,
        skills: ['Perception +3'],
        savingThrows: {
            strength: 0,
            dexterity: 0,
            constitution: 0,
            intelligence: 0,
            wisdom: 0,
            charisma: 0
        },
        senses: {
            darkvision: 60,
            passivePerception: 13
        },
        languages: [],
        challengeRating: {
            rating: 3,
            xp: 700
        },
        creatureType: {
            size: 'Large',
            type: 'monstrosity',
            alignment: 'unaligned'
        }
    },
    {
        id: '3',
        name: 'Young Green Dragon',
        description: 'A cunning and manipulative predator with forest-green scales and acidic breath. Known for its deceptive tactics and cruel intellect.',
        stats: {
            strength: createValue(19),
            dexterity: createValue(12),
            constitution: createValue(17),
            intelligence: createValue(16),
            wisdom: createValue(13),
            charisma: createValue(15)
        },
        armorClass: 18,
        hitPoints: 136,
        speed: 40,
        skills: ['Deception +5', 'Perception +7', 'Stealth +4'],
        savingThrows: {
            strength: 0,
            dexterity: 3,
            constitution: 6,
            wisdom: 4,
            intelligence: 0,
            charisma: 5
        },
        senses: {
            blindsight: 30,
            darkvision: 120,
            passivePerception: 17
        },
        languages: ['Common', 'Draconic'],
        challengeRating: {
            rating: 8,
            xp: 3900
        },
        creatureType: {
            size: 'Large',
            type: 'dragon',
            alignment: 'lawful evil'
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