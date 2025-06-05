import type { Creature } from '@demesne/types';
export declare const getCreatures: () => Promise<Creature[]>;
export declare const createCreature: (data: Omit<Creature, "id">) => Promise<Creature>;
