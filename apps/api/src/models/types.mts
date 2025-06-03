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