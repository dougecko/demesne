import { logger } from './logger.ts';
import type { Spell } from '@demesne/types';

interface DndApiSpell {
    index: string;
    name: string;
    level: number;
    school: { name: string };
    casting_time: string;
    range: string;
    components: string[];
    duration: string;
    desc: string[];
    higher_level?: string[];
    ritual: boolean;
    concentration: boolean;
    damage?: {
        damage_type?: { name: string };
        damage_at_slot_level?: Record<string, string>;
        damage_at_character_level?: Record<string, string>;
    };
    heal_at_slot_level?: Record<string, string>;
    area_of_effect?: {
        type: string;
        size: number;
    };
    dc?: {
        dc_type: { name: string };
        dc_success: string;
    };
    classes: Array<{ name: string }>;
    subclasses: Array<{ name: string }>;
}

interface DndApiSpellList {
    results: Array<{ url: string }>;
}

export const handler = async (event: any) => {
    try {
        const response = await fetch('https://www.dnd5eapi.co/api/spells');
        const data = await response.json() as DndApiSpellList;
        
        // Get a random spell
        const randomIndex = Math.floor(Math.random() * data.results.length);
        const spellData = await fetch(`https://www.dnd5eapi.co${data.results[randomIndex].url}`);
        const spell = await spellData.json() as DndApiSpell;
        
        // Transform the data
        const transformedSpell: Spell = {
            id: spell.index,
            name: spell.name,
            description: spell.desc.join('\n\n'),
            higherLevel: spell.higher_level?.join('\n\n'),
            range: spell.range,
            components: spell.components,
            ritual: spell.ritual,
            duration: spell.duration,
            concentration: spell.concentration,
            castingTime: spell.casting_time,
            level: spell.level,
            damage: spell.damage ? {
                type: spell.damage.damage_type?.name,
                atSlotLevel: spell.damage.damage_at_slot_level
            } : undefined,
            school: spell.school.name,
            classes: spell.classes.map(c => c.name),
            subclasses: spell.subclasses.map(s => s.name)
        };

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify(transformedSpell)
        };
    } catch (error) {
        logger.error('Error fetching spell:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({ error: 'Failed to fetch spell' })
        };
    }
}; 