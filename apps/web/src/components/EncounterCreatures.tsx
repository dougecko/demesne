import { type FC, useMemo, useState, useRef, useEffect } from 'react';
import type { SelectedCreature, Condition } from '@demesne/types';
import styles from './EncounterCreatures.module.css';

interface EncounterCreaturesProps {
    selectedCreatures: SelectedCreature[];
    onRemoveCreature: (id: string) => void;
    onUpdateCreature: (id: string, updates: Partial<SelectedCreature>) => void;
}

const CONDITION_CONFIG: Record<Condition, { icon: string; abbr: string }> = {
    blinded: { icon: '👁️', abbr: 'BLD' },
    charmed: { icon: '💝', abbr: 'CHM' },
    deafened: { icon: '👂', abbr: 'DEF' },
    frightened: { icon: '😨', abbr: 'FRT' },
    grappled: { icon: '🤝', abbr: 'GRP' },
    incapacitated: { icon: '💤', abbr: 'INC' },
    paralyzed: { icon: '🧊', abbr: 'PAR' },
    petrified: { icon: '🗿', abbr: 'PET' },
    poisoned: { icon: '☠️', abbr: 'PSN' },
    prone: { icon: '⬇️', abbr: 'PRN' },
    restrained: { icon: '⛓️', abbr: 'RST' },
    stunned: { icon: '💫', abbr: 'STN' },
    unconscious: { icon: '💤', abbr: 'UNC' }
};

const ALL_CONDITIONS: Condition[] = Object.keys(CONDITION_CONFIG) as Condition[];

export const EncounterCreatures: FC<EncounterCreaturesProps> = ({ 
    selectedCreatures, 
    onRemoveCreature,
    onUpdateCreature 
}) => {
    const [activePopupId, setActivePopupId] = useState<string | null>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                setActivePopupId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const sortedCreatures = useMemo(() => {
        return [...selectedCreatures].sort((a, b) => b.initiative - a.initiative);
    }, [selectedCreatures]);

    const getConditionSummary = (conditions: Condition[] = []) => {
        if (conditions.length === 0) return null;
        return conditions.map(c => ({
            icon: CONDITION_CONFIG[c].icon,
            name: c
        }));
    };

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

    const handleConditionToggle = (id: string, condition: Condition) => {
        const creature = selectedCreatures.find(c => c.id === id);
        if (!creature) return;

        const currentConditions = creature.conditions || [];
        const newConditions = currentConditions.includes(condition)
            ? currentConditions.filter(c => c !== condition)
            : [...currentConditions, condition];

        onUpdateCreature(id, { conditions: newConditions });
    };

    return (
        <div className={styles.encounterCreatures}>
            {sortedCreatures.length === 0 ? (
                <p className={styles.emptyMessage}>None</p>
            ) : (
                <div className={styles.encounterCreatureContainer}>
                    {sortedCreatures.map(creature => (
                        <div key={creature.id} className={styles.encounterCreature}>
                            <div className={styles.creatureHeader}>
                                <div>
                                    <h3 className={styles.creatureName}>{creature.name}</h3>
                                    <div className={styles.conditionSummary}>
                                        <button 
                                            onClick={() => setActivePopupId(activePopupId === creature.id ? null : creature.id)}
                                            className={styles.conditionHeader}
                                        >
                                            Conditions: {' '}
                                            {creature.conditions?.length > 0 ? (
                                                getConditionSummary(creature.conditions)?.map((condition, index) => (
                                                    <span key={condition.name} className={styles.conditionIcon}>
                                                        {condition.icon}
                                                        <div className={styles.conditionTooltip}>
                                                            {condition.name}
                                                        </div>
                                                    </span>
                                                ))
                                            ) : (
                                                <span className={styles.noConditions}>None</span>
                                            )}
                                        </button>
                                        {activePopupId === creature.id && (
                                            <div className={styles.conditionsPopup} ref={popupRef}>
                                                <div className={styles.conditionsPopupHeader}>
                                                    <div className={styles.conditionsPopupTitle}>Conditions</div>
                                                    <button
                                                        onClick={() => setActivePopupId(null)}
                                                        className={styles.closeButton}
                                                        title="Close"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                                <div className={styles.conditionsList}>
                                                    {ALL_CONDITIONS.map(condition => (
                                                        <label key={condition} className={styles.conditionLabel}>
                                                            <input
                                                                type="checkbox"
                                                                checked={(creature.conditions || []).includes(condition)}
                                                                onChange={() => handleConditionToggle(creature.id, condition)}
                                                                className={styles.checkbox}
                                                            />
                                                            <div className={styles.conditionIcon}>
                                                                {CONDITION_CONFIG[condition].icon}
                                                            </div>
                                                            <span>{CONDITION_CONFIG[condition].abbr}</span>
                                                            <div className={styles.conditionTooltip}>
                                                                {condition}
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.creatureActions}>
                                    <button
                                        onClick={() => onRemoveCreature(creature.id)}
                                        className={styles.removeButton}
                                        title="Remove from encounter"
                                    >
                                        ×
                                    </button>
                                </div>
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
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}; 