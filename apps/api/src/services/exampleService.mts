import type { Example } from '@demesne/types';

// Mock data - replace with actual data fetching logic
const examples: Example[] = [
    { id: '1', name: 'Example 1', description: 'First example' },
    { id: '2', name: 'Example 2', description: 'Second example' }
];

export const getExamples = async (): Promise<Example[]> => {
    // In a real app, this would fetch from a database or external API
    return examples;
};

export const createExample = async (data: Omit<Example, 'id'>): Promise<Example> => {
    // In a real app, this would insert into a database
    const newExample: Example = {
        id: Date.now().toString(),
        ...data
    };

    examples.push(newExample);
    return newExample;
};