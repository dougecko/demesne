import type { Creature } from '@demesne/types';
import { SelectedCreatures } from './SelectedCreatures';
import styles from './Encounter.module.css';

interface EncounterProps {
    selectedCreatures: Creature[];
    onRemoveCreature: (id: string) => void;
}

export const Encounter = ({ selectedCreatures, onRemoveCreature }: EncounterProps) => {
    return (
        <div className={styles.encounter}>
            <h1 className={styles.encounterTitle}>Encounter</h1>
            <SelectedCreatures 
                selectedCreatures={selectedCreatures}
                onRemoveCreature={onRemoveCreature}
            />
        </div>
    );
}; 