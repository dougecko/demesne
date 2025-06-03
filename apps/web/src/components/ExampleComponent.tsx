import {useEffect, useState} from 'react';
import {api} from '../utils/api';
import logger from '../utils/logger';
import type {Example} from '../../../api/src/models/types.mts'; // You could create a shared types package

function ExampleComponent() {

    const [examples, setExamples] = useState<Example[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchExamples = async () => {
            logger.debug("Fetching examples");

            try {
                const data = await api.get<Example[]>('/examples');
                setExamples(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchExamples();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Examples</h1>
            <ul>
                {examples.map(example => (
                    <li key={example.id}>
                        <h3>{example.name}</h3>
                        <p>{example.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ExampleComponent;