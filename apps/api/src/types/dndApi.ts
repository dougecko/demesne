// D&D 5e API Response Types

// Common types
export interface APIReference {
  index: string;
  name: string;
  url: string;
}

export interface Cost {
  quantity: number;
  unit: string;
}

// Monster types
export interface MonsterAPIResponse {
  index: string;
  name: string;
  size: string;
  type: string;
  subtype?: string;
  alignment: string;
  armor_class: Array<{
    type: string;
    value: number;
  }>;
  hit_points: number;
  hit_dice: string;
  speed: {
    walk?: string;
    fly?: string;
    swim?: string;
    burrow?: string;
    climb?: string;
    hover?: string;
  };
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  proficiencies: Array<{
    value: number;
    proficiency: APIReference;
  }>;
  damage_vulnerabilities: string[];
  damage_resistances: string[];
  damage_immunities: string[];
  condition_immunities: APIReference[];
  senses?: {
    passive_perception?: number;
    blindsight?: string;
    darkvision?: string;
    tremorsense?: string;
    truesight?: string;
  };
  languages: Array<{
    name: string;
  }>;
  challenge_rating: number;
  xp: number;
  desc?: string;
  special_abilities?: Array<{
    name: string;
    desc: string;
  }>;
  actions?: Array<{
    name: string;
    desc: string;
    damage?: Array<{
      damage_type: APIReference;
      damage_dice: string;
    }>;
    attack_bonus?: number;
  }>;
  legendary_actions?: Array<{
    name: string;
    desc: string;
  }>;
  image?: string;
  url: string;
}

// Spell types
export interface SpellAPIResponse {
  index: string;
  name: string;
  desc: string[];
  higher_level?: string[];
  range: string;
  components: string[];
  material?: string;
  ritual: boolean;
  duration: string;
  concentration: boolean;
  casting_time: string;
  level: number;
  attack_type?: string;
  damage?: {
    damage_type?: APIReference;
    damage_at_slot_level?: {
      [key: string]: string;
    };
  };
  school: APIReference;
  classes: APIReference[];
  subclasses: APIReference[];
  url: string;
}

// API List Response
export interface APIListResponse {
  count: number;
  results: APIReference[];
}

// Error Response
export interface APIErrorResponse {
  error: string;
  message: string;
} 