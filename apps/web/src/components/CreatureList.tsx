import { useEffect, useState } from 'react';
import type { Creature, SelectedCreature } from '@demesne/types';
import { getCreatures } from '../api/client';
import styles from './CreatureList.module.css';
import brassReload from '../assets/brass-reload.svg';

interface CreatureListProps {
    selectedCreatures: SelectedCreature[];
    onCreatureSelect: (creature: Creature) => void;
    onRemoveCreature: (id: string) => void;
    pinnedCreatures: Set<string>;
}

export const CreatureList = ({ selectedCreatures, onCreatureSelect, onRemoveCreature, pinnedCreatures }: CreatureListProps) => {
    const [creatures, setCreatures] = useState<Creature[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
    const [pinnedCreaturesState, setPinnedCreatures] = useState<Set<string>>(pinnedCreatures);

    const fetchCreatures = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getCreatures();
            
            // First, ensure all pinned creatures are in the data
            const pinnedCreatureIds = Array.from(pinnedCreatures);
            const pinnedCreaturesInData = data.filter(creature => pinnedCreatureIds.includes(creature.id));
            const missingPinnedCreatures = creatures.filter(creature => 
                pinnedCreatureIds.includes(creature.id) && 
                !pinnedCreaturesInData.some(pinned => pinned.id === creature.id)
            );
            
            // Combine fetched data with any missing pinned creatures
            const completeData = [...data, ...missingPinnedCreatures];
            
            // Keep all existing pinned creatures
            const existingPinned = completeData.filter(creature => pinnedCreatures.has(creature.id));
            
            // Get new random creatures from unpinned data
            const unpinnedData = completeData.filter(creature => !pinnedCreatures.has(creature.id));
            const randomUnpinned = unpinnedData.sort(() => 0.5 - Math.random()).slice(0, 3);
            
            // Combine existing pinned creatures with new random ones
            setCreatures([...existingPinned, ...randomUnpinned]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCreatures();
    }, []); // Only fetch on initial mount

    const handleReload = () => {
        fetchCreatures();
    };

    const toggleCard = (id: string) => {
        setExpandedCards(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const toggleCreatureSelection = (creature: Creature) => {
        onCreatureSelect(creature);
    };

    const formatCreatureType = (creature: Creature) => {
        const { size, type, alignment } = creature.creatureType;
        return `${size} ${type}${alignment ? `, ${alignment}` : ''}`;
    };

    const getCreatureCount = (creature: Creature) => {
        const baseName = creature.name.split(' #')[0];
        return selectedCreatures.filter(c => c.name.startsWith(baseName)).length;
    };

    const handlePinToggle = (creatureId: string) => {
        const newPinnedCreatures = new Set(pinnedCreatures);
        const isPinning = !newPinnedCreatures.has(creatureId);
        
        if (isPinning) {
            newPinnedCreatures.add(creatureId);
        } else {
            newPinnedCreatures.delete(creatureId);
        }
        setPinnedCreatures(newPinnedCreatures);

        // Reorder creatures
        const pinned = creatures
            .filter(c => newPinnedCreatures.has(c.id))
            .sort((a, b) => a.name.localeCompare(b.name));
        const unpinned = creatures.filter(c => !newPinnedCreatures.has(c.id));
        setCreatures([...pinned, ...unpinned]);
    };

    const renderCreatureDetails = (creature: Creature) => {
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
                    <div className={styles.abilityScore}>
                        <div className={styles.abilityName}>STR</div>
                        <div className={styles.abilityMod}>{creature.stats.strength.modifier >= 0 ? `+${creature.stats.strength.modifier}` : creature.stats.strength.modifier}</div>
                        <div className={styles.abilityValue}>{creature.stats.strength.value}</div>
                    </div>
                    <div className={styles.abilityScore}>
                        <div className={styles.abilityName}>DEX</div>
                        <div className={styles.abilityMod}>{creature.stats.dexterity.modifier >= 0 ? `+${creature.stats.dexterity.modifier}` : creature.stats.dexterity.modifier}</div>
                        <div className={styles.abilityValue}>{creature.stats.dexterity.value}</div>
                    </div>
                    <div className={styles.abilityScore}>
                        <div className={styles.abilityName}>CON</div>
                        <div className={styles.abilityMod}>{creature.stats.constitution.modifier >= 0 ? `+${creature.stats.constitution.modifier}` : creature.stats.constitution.modifier}</div>
                        <div className={styles.abilityValue}>{creature.stats.constitution.value}</div>
                    </div>
                    <div className={styles.abilityScore}>
                        <div className={styles.abilityName}>INT</div>
                        <div className={styles.abilityMod}>{creature.stats.intelligence.modifier >= 0 ? `+${creature.stats.intelligence.modifier}` : creature.stats.intelligence.modifier}</div>
                        <div className={styles.abilityValue}>{creature.stats.intelligence.value}</div>
                    </div>
                    <div className={styles.abilityScore}>
                        <div className={styles.abilityName}>WIS</div>
                        <div className={styles.abilityMod}>{creature.stats.wisdom.modifier >= 0 ? `+${creature.stats.wisdom.modifier}` : creature.stats.wisdom.modifier}</div>
                        <div className={styles.abilityValue}>{creature.stats.wisdom.value}</div>
                    </div>
                    <div className={styles.abilityScore}>
                        <div className={styles.abilityName}>CHA</div>
                        <div className={styles.abilityMod}>{creature.stats.charisma.modifier >= 0 ? `+${creature.stats.charisma.modifier}` : creature.stats.charisma.modifier}</div>
                        <div className={styles.abilityValue}>{creature.stats.charisma.value}</div>
                    </div>
                </div>

                <div className={styles.statBlockDivider}></div>

                <div className={styles.statBlockProperties}>
                    {creature.senses && (
                        <div className={styles.property}>
                            <span className={styles.propertyName}>Senses</span> {Object.entries(creature.senses)
                                .filter(([key]) => key !== 'passivePerception')
                                .map(([key, value]) => `${key} ${value} ft.`)
                                .join(', ')}
                        </div>
                    )}

                    {creature.languages && creature.languages.length > 0 && (
                        <div className={styles.property}>
                            <span className={styles.propertyName}>Languages</span> {creature.languages.join(', ')}
                        </div>
                    )}
                </div>

                <div className={styles.statBlockDivider}></div>

                <div className={styles.statBlockDescription}>
                    <p>{creature.description}</p>
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
                    {creatures.map(creature => (
                        <div
                            key={creature.id}
                            className={`${styles.creatureCard} ${expandedCards.has(creature.id) ? styles.cardExpanded : styles.cardCollapsed} ${pinnedCreaturesState.has(creature.id) ? styles.pinned : ''}`}
                            onClick={() => toggleCard(creature.id)}>
                            <div className={styles.creatureCardContent}>
                                <div className={styles.creatureHeader}>
                                    <h3 className={styles.creatureName}>
                                        {creature.name}
                                        {pinnedCreaturesState.has(creature.id) && (
                                            <span className={styles.pinIndicator} title="Pinned to encounter">📌</span>
                                        )}
                                    </h3>
                                    <div className={styles.creatureActions}>
                                        {getCreatureCount(creature) > 0 && (
                                            <span className={styles.creatureCount}>{getCreatureCount(creature)}</span>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleCreatureSelection(creature);
                                            }}
                                            className={`${styles.selectButton} ${getCreatureCount(creature) > 0 ? styles.selected : ''}`}
                                            title={getCreatureCount(creature) > 0 ? "Add another" : "Add to encounter"}
                                        >
                                            +
                                        </button>
                                    </div>
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
};