export interface Creature extends Target {
    id: string;
    name: string;
    description: string;
    stats: Attributes;
    speed: number;
    skills: string[];
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

export interface Attributes {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
}

export interface Example {
    id: string;
    name: string;
    description: string;
}

export interface ApiError extends Error {
    statusCode?: number;
}