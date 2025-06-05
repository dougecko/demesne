export interface CreatureType {
    size: Size;
    type: string;
    subtype?: string;
    alignment: Alignment;
}

export type Size = 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';

export type Alignment = 
    'lawful good' | 'neutral good' | 'chaotic good' |
    'lawful neutral' | 'true neutral' | 'chaotic neutral' |
    'lawful evil' | 'neutral evil' | 'chaotic evil' |
    'unaligned' | 'any alignment';

export interface Creature extends Target {
    id: string;
    name: string;
    description: string;
    stats: Attributes;
    speed: number;
    skills: string[];
    senses: Senses;
    languages: string[];
    challengeRating: {
        rating: number;
        xp: number;
    };
    creatureType: CreatureType;
}

export interface Senses {
    darkvision?: number;
    blindsight?: number;
    tremorsense?: number;
    truesight?: number;
    passivePerception: number;
}

interface Target {
    armorClass: number;
    hitPoints: number;
    savingThrows: SavingThrows;
}

export interface SavingThrows {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
}

interface Attribute {
    value: number;
    modifier: number;
}

export interface Attributes {
    strength: Attribute;
    dexterity: Attribute;
    constitution: Attribute;
    intelligence: Attribute;
    wisdom: Attribute;
    charisma: Attribute;
}

export interface Example {
    id: string;
    name: string;
    description: string;
}

export interface ApiError extends Error {
    statusCode?: number;
} 