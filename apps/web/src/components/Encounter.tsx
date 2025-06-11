import { type FC } from 'react';
import type { SelectedCreature } from '@demesne/types';
import { EncounterCreatures } from './EncounterCreatures';
import styles from './Encounter.module.css';

interface EncounterProps {
    selectedCreatures: SelectedCreature[];
    onRemoveCreature: (id: string) => void;
    onUpdateCreature: (id: string, updates: Partial<SelectedCreature>) => void;
}

export const Encounter: FC<EncounterProps> = ({ selectedCreatures, onRemoveCreature, onUpdateCreature }) => {
    return (
        <div className={styles.encounter}>
            <h2 className={styles.encounterTitle}>Encounter</h2>
            <EncounterCreatures 
                selectedCreatures={selectedCreatures}
                onRemoveCreature={onRemoveCreature}
                onUpdateCreature={onUpdateCreature}
            />
        </div>
    );
}; 