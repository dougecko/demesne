import {useEffect, useState} from 'react';
import {api} from '../utils/api';
import logger from '../utils/logger';
import type {Creature} from '../../../api/src/models/types.mts'; // You could create a shared types package

function CreatureComponent() {

    const [creatures, setCreatures] = useState<Creature[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCreatures = async () => {
            logger.debug("Fetching creatures");

            try {
                const data = await api.get<Creature[]>('/creatures');
                setCreatures(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchCreatures();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Creatures</h1>
            <ul>
                {creatures.map(creature => (
                    <li key={creature.id}>
                        <h3>{creature.name}</h3>
                        <p>{creature.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default CreatureComponent;