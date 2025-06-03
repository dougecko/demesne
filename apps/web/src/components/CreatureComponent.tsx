import {useEffect, useState} from 'react';
import {api} from '../utils/api';
import logger from '../utils/logger';
import type {Creature} from '../../../api/src/models/types.mts'; // You could create a shared types package

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

    return (
        <div>
            <div className="creatures-header">
                <h1>Creatures</h1>
                <button
                    onClick={handleReload}
                    disabled={loading}
                    className="reload-button">
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
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default CreatureComponent;