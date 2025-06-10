export type Size = 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';
export type Alignment = 'lawful good' | 'neutral good' | 'chaotic good' | 'lawful neutral' | 'neutral' | 'chaotic neutral' | 'lawful evil' | 'neutral evil' | 'chaotic evil' | 'unaligned';

export interface Attribute {
  value: number;
  modifier: number;
}

export interface Stats {
  strength: Attribute;
  dexterity: Attribute;
  constitution: Attribute;
  intelligence: Attribute;
  wisdom: Attribute;
  charisma: Attribute;
}

export interface SavingThrows {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface Senses {
  darkvision?: number;
  blindsight?: number;
  tremorsense?: number;
  truesight?: number;
  passivePerception: number;
}

export interface ChallengeRating {
  rating: number;
  xp: number;
}

export interface CreatureType {
  size: Size;
  type: string;
  subtype?: string;
  alignment: Alignment;
}

export interface CreatureActions {
  specialAbilities: Array<{ name: string; desc: string }>;
  actions: Array<{ name: string; desc: string }>;
  legendaryActions: Array<{ name: string; desc: string }>;
}

export interface Creature {
  id: string;
  name: string;
  description: string;
  actions: CreatureActions;
  stats: Stats;
  armorClass: number;
  hitPoints: number;
  speed: number;
  skills: string[];
  savingThrows: SavingThrows;
  senses: Senses;
  languages: string[];
  challengeRating: ChallengeRating;
  creatureType: CreatureType;
} 