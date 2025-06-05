import {useEffect, useState} from 'react';
import {api} from '../utils/api';
import logger from '../utils/logger';
import type {Creature} from '../../../api/src/models/types.mts'; // You could create a shared types package
import styles from './CreatureComponent.module.css';

function CreatureComponent() {
    const [creatures, setCreatures] = useState<Creature[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCreatures = async () => {
        logger.debug("Fetching creatures");
        setLoading(true);
        setError(null);

        try {
            const data = await api.get<Creature[]>('/creatures');
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

    // Handle reload button click
    const handleReload = () => {
        fetchCreatures();
    };

    // @ts-ignore
    const allFieldsEmpty = (obj) => {
        return Object.values(obj).every(
            val => val === "" || val === 0 || val === null || val === undefined
        );
    }

    // Helper function to render senses
    const renderSenses = (senses: Creature['senses']) => {
        if (!senses) return 'passive Perception 10';

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

    // Function to render stat block in D&D 5e style
    const renderStatBlock = (creature: Creature) => {
        // Get all stat keys for mapping
        const statKeys = Object.keys(creature.stats) as Array<keyof typeof creature.stats>;

        // Format saving throws if they exist
        const hasSavingThrows = !allFieldsEmpty(creature.savingThrows);
        const savingThrowsText = hasSavingThrows
            ? statKeys
                .filter(key => creature.savingThrows[key])
                .map(key => `${key.charAt(0).toUpperCase() + key.slice(1, 3)} ${creature.savingThrows[key]}`)
                .join(', ')
            : 'none';

        // Format skills list
        const skillsText = creature.skills.length > 0
            ? creature.skills.join(', ')
            : 'none';

        return (
            <div className={styles.statBlock}>
                <div className={styles.statBlockHeader}>
                    <h3 className={styles.creatureName}>{creature.name}</h3>
                    <p className={styles.creatureType}>Medium humanoid, neutral</p>
                </div>

                <div className={styles.statBlockDivider}></div>

                <div className={styles.statBlockBasics}>
                    <div className={styles.basicStat}>
                        <span className={styles.statLabel}>Armor Class</span> {creature.armorClass}
                    </div>
                    <div className={styles.basicStat}>
                        <span className={styles.statLabel}>Hit Points</span> {creature.hitPoints}
                    </div>
                    <div className={styles.basicStat}>
                        <span className={styles.statLabel}>Speed</span> {creature.speed} ft.
                    </div>
                </div>

                <div className={styles.statBlockDivider}></div>

                <div className={styles.abilityScores}>
                    {statKeys.map(key => (
                        <div key={key} className={styles.abilityScore}>
                            <div className={styles.abilityName}>{key.charAt(0).toUpperCase() + key.slice(1, 3)}</div>
                            <div className={styles.abilityValue}>{creature.stats[key].value}</div>
                            <div className={styles.abilityMod}>{creature.stats[key].modifier >= 0 ? `+${creature.stats[key].modifier}` : creature.stats[key].modifier}</div>
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
                    <p>{creature.description}</p>
                </div>
            </div>
        );
    };

            // Ensure creatures have default values for new properties
            const processedCreatures = creatures.map(creature => ({
        ...creature,
        senses: creature.senses || { passivePerception: 10 },
        languages: creature.languages || [],
        challengeRating: creature.challengeRating || { rating: 1, xp: 200 }
            }));

    return (
        <div>
            <div className={styles.creatureHeader}>
                <h1>Creatures</h1>
                <button
                    onClick={handleReload}
                    disabled={loading}
                    className={styles.reloadButton}>
                    {loading ? 'Loading...' : 'Reload'}
                </button>
            </div>

            {loading ? (
                <div className={styles.loadingContainer}>Loading...</div>
            ) : error ? (
                <div className={styles.errorContainer}>Error: {error}</div>
            ) : (
                <div className={styles.creaturesGrid}>
                    {processedCreatures.map(creature => (
                        <div key={creature.id} className={styles.creatureCard}>
                            {renderStatBlock(creature)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CreatureComponent;