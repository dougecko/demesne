import { useEffect, useState } from 'react';
import type { Creature } from '@demesne/types';
import { getCreatures } from '../api/client';
import styles from './CreatureList.module.css';
import brassReload from '../assets/brass-reload.svg';

interface CreatureListProps {
    selectedCreatures: Creature[];
    onCreatureSelect: (creatures: Creature[]) => void;
    onRemoveCreature: (id: string) => void;
}

export const CreatureList = ({ selectedCreatures, onCreatureSelect, onRemoveCreature }: CreatureListProps) => {
    const [creatures, setCreatures] = useState<Creature[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

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
        const isSelected = selectedCreatures.some(c => c.id === creature.id);
        if (isSelected) {
            onCreatureSelect(selectedCreatures.filter(c => c.id !== creature.id));
        } else {
            onCreatureSelect([...selectedCreatures, creature]);
        }
    };

    const formatCreatureType = (creature: Creature) => {
        const { size, type, alignment } = creature.creatureType;
        return `${size} ${type}${alignment ? `, ${alignment}` : ''}`;
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

                <div className={styles.statBlockProperties}>
                    <div className={styles.property}>
                        <span className={styles.propertyName}>STR</span> {creature.stats.strength.value}
                    </div>
                    <div className={styles.property}>
                        <span className={styles.propertyName}>DEX</span> {creature.stats.dexterity.value}
                    </div>
                    <div className={styles.property}>
                        <span className={styles.propertyName}>CON</span> {creature.stats.constitution.value}
                    </div>
                    <div className={styles.property}>
                        <span className={styles.propertyName}>INT</span> {creature.stats.intelligence.value}
                    </div>
                    <div className={styles.property}>
                        <span className={styles.propertyName}>WIS</span> {creature.stats.wisdom.value}
                    </div>
                    <div className={styles.property}>
                        <span className={styles.propertyName}>CHA</span> {creature.stats.charisma.value}
                    </div>
                </div>

                {creature.senses && (
                    <>
                        <div className={styles.statBlockDivider}></div>
                        <div className={styles.property}>
                            <span className={styles.propertyName}>Senses</span> {Object.entries(creature.senses)
                                .filter(([key]) => key !== 'passivePerception')
                                .map(([key, value]) => `${key} ${value} ft.`)
                                .join(', ')}
                        </div>
                    </>
                )}

                {creature.languages && creature.languages.length > 0 && (
                    <>
                        <div className={styles.statBlockDivider}></div>
                        <div className={styles.property}>
                            <span className={styles.propertyName}>Languages</span> {creature.languages.join(', ')}
                        </div>
                    </>
                )}

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
                            className={`${styles.creatureCard} ${expandedCards.has(creature.id) ? styles.cardExpanded : styles.cardCollapsed}`}
                            onClick={() => toggleCard(creature.id)}>
                            <div className={styles.creatureCardContent}>
                                <div className={styles.creatureHeader}>
                                    <h3 className={styles.creatureName}>{creature.name}</h3>
                                    <button
                                        className={`${styles.selectButton} ${selectedCreatures.some(c => c.id === creature.id) ? styles.selected : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleCreatureSelection(creature);
                                        }}
                                        title={selectedCreatures.some(c => c.id === creature.id) ? "Remove from selection" : "Add to selection"}
                                    >
                                        {selectedCreatures.some(c => c.id === creature.id) ? '×' : '+'}
                                    </button>
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