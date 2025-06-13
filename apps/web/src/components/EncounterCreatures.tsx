import { type FC, useMemo, useState, useRef, useEffect } from 'react';
import type { SelectedCreature, Condition } from '@demesne/types';
import styles from './EncounterCreatures.module.css';

interface EncounterCreaturesProps {
    selectedCreatures: SelectedCreature[];
    onRemoveCreature: (name: string) => void;
    onUpdateCreature: (name: string, updates: Partial<SelectedCreature>) => void;
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

    const handleInitiativeChange = (name: string, value: string) => {
        const initiative = parseInt(value, 10);
        if (!isNaN(initiative)) {
            onUpdateCreature(name, { initiative });
        }
    };

    const handleHitPointsChange = (name: string, value: string) => {
        const currentHitPoints = parseInt(value, 10);
        if (!isNaN(currentHitPoints)) {
            onUpdateCreature(name, { currentHitPoints });
        }
    };

    const handleConditionToggle = (name: string, condition: Condition) => {
        const creature = selectedCreatures.find(c => c.name === name);
        if (!creature) return;

        const currentConditions = creature.conditions || [];
        const newConditions = currentConditions.includes(condition)
            ? currentConditions.filter(c => c !== condition)
            : [...currentConditions, condition];

        onUpdateCreature(name, { conditions: newConditions });
    };

    return (
        <div className={styles.encounterCreatures}>
            {sortedCreatures.length === 0 ? (
                <p className={styles.emptyMessage}>None</p>
            ) : (
                <div className={styles.encounterCreatureContainer}>
                    {sortedCreatures.map(creature => (
                        <div key={creature.name} className={`${styles.encounterCreature} ${creature.currentHitPoints <= creature.hitPoints / 2 ? styles.lowHp : ''} ${creature.conditions?.length ? styles.hasConditions : ''}`}>
                            <div className={styles.creatureCard}>
                                <div className={styles.creatureHeader}>
                                    <div>
                                        <h3 className={styles.creatureName}>
                                            {creature.name} ({creature.initiative})
                                        </h3>
                                    </div>
                                    <div className={styles.creatureActions}>
                                        <button
                                            onClick={() => onRemoveCreature(creature.name)}
                                            className={styles.removeButton}
                                            title="Remove from encounter"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                                <div className={styles.conditionSummary}>
                                    <button 
                                        onClick={() => setActivePopupId(activePopupId === creature.name ? null : creature.name)}
                                        className={`${styles.conditionHeader} ${creature.conditions?.length ? styles.hasActiveConditions : ''}`}
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
                                    <div className={styles.speedValue}>
                                        {creature.speed}' 👣
                                    </div>
                                    {activePopupId === creature.name && (
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
                                                            onChange={() => handleConditionToggle(creature.name, condition)}
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
                                <div className={styles.creatureStats}>
                                    <div className={styles.stat}>
                                        <label htmlFor={`hp-${creature.name}`}>HP ({creature.hitPoints})</label>
                                        <input
                                            type="number"
                                            id={`hp-${creature.name}`}
                                            value={creature.currentHitPoints}
                                            onChange={(e) => handleHitPointsChange(creature.name, e.target.value)}
                                            className={styles.numberInput}
                                            min="0"
                                            max={creature.hitPoints}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}; 