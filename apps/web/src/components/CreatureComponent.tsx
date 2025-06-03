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

    // Function to render stat block
    const renderStatBlock = (creature: Creature) => {
        // Get all stat keys for mapping
        const statKeys = Object.keys(creature.stats) as Array<keyof typeof creature.stats>;

        return (
            <div className={styles.statsBlock}>
                <h4>Stats</h4>
                <table className={styles.statsTable}>
                    <thead>
                    <tr>
                        {statKeys.map(key => (
                            <th key={key}>{key.charAt(0).toUpperCase() + key.slice(1, 3)}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        {statKeys.map(key => (
                            <td key={key}>{creature.stats[key].value} ({creature.stats[key].modifier})</td>
                        ))}
                    </tr>
                    </tbody>
                </table>

                <h4>Saving Throws</h4>
                <table className={styles.savesTable}>
                    <thead>
                    <tr>
                        {statKeys.map(key => (
                            <th key={key}>{key.charAt(0).toUpperCase() + key.slice(1, 3)}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        {!allFieldsEmpty(creature.savingThrows) ? statKeys.map(key => (
                            <td key={key}>{creature.savingThrows[key]}</td>
                        )) : "none"}
                    </tr>
                    </tbody>
                </table>

                <div className={styles.additionalStats}>
                    <p><strong>Hit Points:</strong> {creature.hitPoints}</p>
                    <p><strong>Armor Class:</strong> {creature.armorClass}</p>
                    <p><strong>Speed:</strong> {creature.speed}</p>

                    <h4>Skills</h4>
                    {creature.skills.length > 0 ? (
                        <ul className={styles.skillsList}>
                            {creature.skills.map((skill, index) => (
                                <li key={index}>{skill}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No skills</p>
                    )}
                </div>
            </div>
        );
    };

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
                <div>Loading...</div>
            ) : error ? (
                <div>Error: {error}</div>
            ) : (
                <ul>
                    {creatures.map(creature => (
                        <li key={creature.id}>
                            <h3>{creature.name}</h3>
                            <p>{creature.description}</p>
                            {renderStatBlock(creature)}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default CreatureComponent;