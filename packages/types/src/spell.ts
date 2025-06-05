export interface Spell {
  id: string;
  name: string;
  description: string;
  higherLevel?: string;
  range: string;
  components: string[];
  material?: string;
  ritual: boolean;
  duration: string;
  concentration: boolean;
  castingTime: string;
  level: number;
  attackType?: string;
  damage?: {
    type?: string;
    atSlotLevel?: Record<string, string>;
  };
  school: string;
  classes: string[];
  subclasses: string[];
} 