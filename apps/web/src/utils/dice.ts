import type { Stats } from '@demesne/types';

export const rollInitiative = (stats: Stats): number => {
    // Roll a d20 and add the creature's dexterity modifier
    const d20Roll = Math.floor(Math.random() * 20) + 1;
    return d20Roll + stats.dexterity.modifier;
}; 