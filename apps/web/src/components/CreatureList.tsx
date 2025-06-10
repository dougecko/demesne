import { type FC, useEffect, useState } from 'react';
import type { Creature } from '@demesne/types';
import styles from './CreatureList.module.css';
import brassReload from '../assets/brass-reload.svg';
import { getCreatures } from '../api/client';

export const CreatureList: FC = () => {
    const [creatures, setCreatures] = useState<Creature[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

    // Get all stat keys for mapping
    const statKeys = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const;

    const fetchCreatures = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await getCreatures();
            setCreatures(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCreatures();
    }, []);

    const handleReload = () => {
        fetchCreatures();
    };

    const toggleCard = (id: string) => {
        setExpandedCards((prev: Set<string>) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const allFieldsEmpty = (obj: Object): boolean => {
        return Object.values(obj).every(
            val => val === "" || val === 0 || val === null || val === undefined
        );
    }

    // Helper function to render senses
    const renderSenses = (senses: Creature['senses']) => {
        if (!senses) return 'unknown';

        const sensesArray = [];

        if (senses.darkvision) {
            sensesArray.push(`darkvision ${senses.darkvision} ft.`);
        }

        if (senses.blindsight) {
            sensesArray.push(`blindsight ${senses.blindsight} ft.`);
        }

        if (senses.tremorsense) {
            sensesArray.push(`tremorsense ${senses.tremorsense} ft.`);
        }

        if (senses.truesight) {
            sensesArray.push(`truesight ${senses.truesight} ft.`);
        }

        sensesArray.push(`passive Perception ${senses.passivePerception}`);

        return sensesArray.join(', ');
    }

    // Helper function to format creature type
    const formatCreatureType = (creature: Creature) => {
        if (!creature.creatureType) {
            return 'unknown';
        }

        const { size, type, subtype, alignment } = creature.creatureType;
        return `${size} ${type}${subtype ? ` (${subtype})` : ''}, ${alignment}`;
    }

    // Function to render stat block in D&D 5e style
    const renderCreatureDetails = (creature: Creature) => {
        // Format saving throws if they exist
        const hasSavingThrows = !allFieldsEmpty(creature.savingThrows);
        const savingThrowsText = hasSavingThrows
            ? statKeys
                .filter(key => creature.savingThrows[key])
                .map(key => `${key.charAt(0).toUpperCase() + key.slice(1)} ${creature.savingThrows[key]}`)
                .join(', ')
            : 'none';

        // Format skills list
        const skillsText = creature.skills.length > 0
            ? creature.skills.join(', ')
            : 'none';

        return (
            <div className={styles.statBlock}>
                <div className={styles.statBlockBasics}>
                    <div className={styles.basicStat}>
                        <span className={styles.statLabel}>Armor Class</span> {creature.armorClass}
                    </div>
                    <div className={styles.basicStat}>
                        <span className={styles.statLabel}>Hit Points</span> {creature.hitPoints}
                    </div>
                    <div className={styles.basicStat}>
                        <span className={styles.statLabel}>Speed</span> {creature.speed}
                    </div>
                </div>

                <div className={styles.statBlockDivider}></div>

                <div className={styles.abilityScores}>
                    {statKeys.map(key => (
                        <div key={key} className={styles.abilityScore}>
                            <div className={styles.abilityName}>{key.charAt(0).toUpperCase() + key.slice(1,3)}</div>
                            <div className={styles.abilityValue}>{creature.stats[key].value}</div>
                            <div
                                className={styles.abilityMod}>{creature.stats[key].modifier >= 0 ? `+${creature.stats[key].modifier}` : creature.stats[key].modifier}</div>
                        </div>
                    ))}
                </div>

                <div className={styles.statBlockDivider}></div>

                <div className={styles.statBlockProperties}>
                    {hasSavingThrows && (
                        <div className={styles.property}>
                            <span className={styles.propertyName}>Saving Throws</span> {savingThrowsText}
                        </div>
                    )}

                    <div className={styles.property}>
                        <span className={styles.propertyName}>Skills</span> {skillsText}
                    </div>

                    {creature.senses && (
                        <div className={styles.property}>
                            <span className={styles.propertyName}>Senses</span> {renderSenses(creature.senses)}
                        </div>
                    )}

                    {creature.languages && creature.languages.length > 0 && (
                        <div className={styles.property}>
                            <span className={styles.propertyName}>Languages</span> {creature.languages.join(', ')}
                        </div>
                    )}

                    <div className={styles.property}>
                        <span className={styles.propertyName}>Challenge</span> {creature.challengeRating?.rating || 1} ({creature.challengeRating?.xp || 200} XP)
                    </div>
                </div>

                <div className={styles.statBlockDivider}></div>

                <div className={styles.statBlockDescription}>
                    {creature.actions.specialAbilities.length > 0 && (
                        <>
                            <div className={styles.property}>
                                <span className={styles.propertyName}>Special Abilities</span>
                            </div>
                            {creature.actions.specialAbilities.map((ability, index) => (
                                <p key={index}>• {ability.name}. {ability.desc}</p>
                            ))}
                        </>
                    )}

                    {creature.actions.actions.length > 0 && (
                        <>
                            <div className={styles.property}>
                                <span className={styles.propertyName}>Actions</span>
                            </div>
                            {creature.actions.actions.map((action, index) => (
                                <p key={index}>• {action.name}. {action.desc}</p>
                            ))}
                        </>
                    )}

                    {creature.actions.legendaryActions.length > 0 && (
                        <>
                            <div className={styles.property}>
                                <span className={styles.propertyName}>Legendary Actions</span>
                            </div>
                            {creature.actions.legendaryActions.map((action, index) => (
                                <p key={index}>• {action.name}. {action.desc}</p>
                            ))}
                        </>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={styles['creature-component']}>
            <div className={styles.creatureHeader}>
                <h1 className={styles.creatureHeaderTitle}>Creatures</h1>
                <button
                    onClick={handleReload}
                    disabled={loading}
                    className={`${styles.reloadButton} ${loading ? styles.reloadButtonSpin : ''}`}
                    title="Reload creatures"
                    aria-label="Reload creatures">
                    <img src={brassReload} alt="Reload" />
                </button>
            </div>

            {loading ? (
                <div className={styles.loadingContainer}>Loading...</div>
            ) : error ? (
                <div className={styles.errorContainer}>
                    <p>{error}</p>
                    <button onClick={handleReload}>Try Again</button>
                </div>
            ) : (
                <div className={styles.creatureList}>
                    {creatures.map((creature: Creature) => (
                        <div
                            key={creature.id}
                            className={`${styles.creatureCard} ${expandedCards.has(creature.id) ? styles.cardExpanded : styles.cardCollapsed}`}
                            onClick={() => toggleCard(creature.id)}>
                            <div className={styles.creatureCardContent}>
                                <div className={styles.creatureHeader}>
                                    <h3 className={styles.creatureName}>{creature.name}</h3>
                                </div>
                                <div>
                                    <p className={styles.creatureType}>{formatCreatureType(creature)}</p>
                                </div>
                                <div className={styles.content}>
                                    {renderCreatureDetails(creature)}
                                </div>
                                <div className={styles.creatureExpandIndicator}>
                                    <span className={expandedCards.has(creature.id) ? styles.creatureExpandTriangleExpanded : styles.creatureExpandTriangleCollapsed}></span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}