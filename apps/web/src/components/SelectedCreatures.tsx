import { type FC, useMemo } from 'react';
import type { SelectedCreature } from '@demesne/types';
import styles from './SelectedCreatures.module.css';

interface SelectedCreaturesProps {
    selectedCreatures: SelectedCreature[];
    onRemoveCreature: (id: string) => void;
    onUpdateCreature: (id: string, updates: Partial<SelectedCreature>) => void;
}

export const SelectedCreatures: FC<SelectedCreaturesProps> = ({ 
    selectedCreatures, 
    onRemoveCreature,
    onUpdateCreature 
}) => {
    const sortedCreatures = useMemo(() => {
        return [...selectedCreatures].sort((a, b) => b.initiative - a.initiative);
    }, [selectedCreatures]);

    const handleInitiativeChange = (id: string, value: string) => {
        const initiative = parseInt(value, 10);
        if (!isNaN(initiative)) {
            onUpdateCreature(id, { initiative });
        }
    };

    const handleHitPointsChange = (id: string, value: string) => {
        const currentHitPoints = parseInt(value, 10);
        if (!isNaN(currentHitPoints)) {
            onUpdateCreature(id, { currentHitPoints });
        }
    };

    const handleToggleActive = (id: string, isActive: boolean) => {
        onUpdateCreature(id, { isActive });
    };

    return (
        <div className={styles.selectedCreatures}>
            {sortedCreatures.length === 0 ? (
                <p className={styles.emptyMessage}>None</p>
            ) : (
                <div className={styles.selectedCreatureContainer}>
                    {sortedCreatures.map(creature => (
                        <div key={creature.id} className={styles.selectedCreature}>
                            <div className={styles.creatureHeader}>
                                <h3 className={styles.creatureName}>{creature.name}</h3>
                                <button
                                    onClick={() => onRemoveCreature(creature.id)}
                                    className={styles.removeButton}
                                    title="Remove from encounter"
                                >
                                    ×
                                </button>
                            </div>
                            <div className={styles.creatureStats}>
                                <div className={styles.stat}>
                                    <label htmlFor={`initiative-${creature.id}`}>Initiative</label>
                                    <input
                                        type="number"
                                        id={`initiative-${creature.id}`}
                                        value={creature.initiative}
                                        onChange={(e) => handleInitiativeChange(creature.id, e.target.value)}
                                        className={styles.numberInput}
                                    />
                                </div>
                                <div className={styles.stat}>
                                    <label htmlFor={`hp-${creature.id}`}>HP ({creature.hitPoints})</label>
                                    <input
                                        type="number"
                                        id={`hp-${creature.id}`}
                                        value={creature.currentHitPoints}
                                        onChange={(e) => handleHitPointsChange(creature.id, e.target.value)}
                                        className={styles.numberInput}
                                        min="0"
                                        max={creature.hitPoints}
                                    />
                                </div>
                                <div className={styles.stat}>
                                    <label htmlFor={`active-${creature.id}`}>Active</label>
                                    <input
                                        type="checkbox"
                                        id={`active-${creature.id}`}
                                        checked={creature.isActive}
                                        onChange={(e) => handleToggleActive(creature.id, e.target.checked)}
                                        className={styles.checkbox}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}; 