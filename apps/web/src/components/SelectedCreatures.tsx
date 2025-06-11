import type { Creature } from '@demesne/types';
import styles from './SelectedCreatures.module.css';

interface SelectedCreaturesProps {
    selectedCreatures: Creature[];
    onRemoveCreature: (id: string) => void;
}

export const SelectedCreatures = ({ selectedCreatures, onRemoveCreature }: SelectedCreaturesProps) => {
    return (
        <div className={styles.selectedCreatures}>
            <h2 className={styles.selectedTitle}>Creatures</h2>
            {selectedCreatures.length === 0 ? (
                <p className={styles.emptyMessage}>None</p>
            ) : (
                <ul className={styles.creatureList}>
                    {selectedCreatures.map(creature => (
                        <li key={creature.id} className={styles.creatureItem}>
                            <span className={styles.creatureName}>{creature.name}</span>
                            <button 
                                onClick={() => onRemoveCreature(creature.id)}
                                className={styles.removeButton}
                                title="Remove creature"
                            >
                                ×
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}; 