import { useState, useEffect } from 'react';
// import { useState } from 'react'
// import viteLogo from '/vite.svg'
// import reactLogo from './assets/react.svg'
import demesneLogo from './assets/demesne-logo.png'
// import ExampleComponent from './components/ExampleComponent'
import './App.css'
import { SpellList } from "./components/SpellList";
import { CreatureList } from "./components/CreatureList";
import { Encounter } from './components/Encounter';
import type { Creature, SelectedCreature } from '@demesne/types';
import { rollInitiative } from './utils/dice';

// Custom hook for local storage
const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] => {
    // Get from local storage then
    // parse stored json or return initialValue
    const readValue = () => {
        if (typeof window === 'undefined') {
            return initialValue;
        }

        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    };

    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState<T>(readValue);

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = (value: T | ((prev: T) => T)) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            // Save state
            setStoredValue(valueToStore);
            // Save to local storage
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue];
};

const App = () => {
    const [selectedCreatures, setSelectedCreatures] = useLocalStorage<SelectedCreature[]>('encounter-creatures', []);

    const handleCreatureSelect = (creature: Creature) => {
        // Get the base name without any number suffix
        const baseName = creature.name.split(' #')[0];
        
        // Find the highest existing index for this creature type
        const existingIndices = selectedCreatures
            .filter(c => c.name.startsWith(baseName))
            .map(c => {
                const match = c.name.match(/#(\d+)$/);
                return match ? parseInt(match[1], 10) : 0;
            });
        const nextIndex = existingIndices.length > 0 ? Math.max(...existingIndices) + 1 : 1;
        
        // Create a new instance with a numbered name
        const newSelectedCreature: SelectedCreature = {
            ...creature,
            name: `${baseName} #${nextIndex}`,
            currentHitPoints: creature.hitPoints,
            initiative: rollInitiative(creature.stats),
            conditions: []
        };
        
        setSelectedCreatures((prev: SelectedCreature[]) => [...prev, newSelectedCreature]);
    };

    const handleRemoveCreature = (name: string) => {
        setSelectedCreatures((prev: SelectedCreature[]) => prev.filter(c => c.name !== name));
    };

    const handleUpdateCreature = (name: string, updates: Partial<SelectedCreature>) => {
        setSelectedCreatures((prev: SelectedCreature[]) => prev.map(creature => 
            creature.name === name ? { ...creature, ...updates } : creature
        ));
    };

    return (
        <div className="app">
            <header className="app-header">
                <img src={demesneLogo} className="app-logo" alt="Demesne Logo" />
            </header>
            <main>
                <div className="lists-container">
                    <div className="main-content">
                        {/* <SpellList /> */}
                        <CreatureList 
                            selectedCreatures={selectedCreatures}
                            onCreatureSelect={handleCreatureSelect}
                            onRemoveCreature={handleRemoveCreature}
                        />
                    </div>
                    <Encounter 
                        selectedCreatures={selectedCreatures}
                        onRemoveCreature={handleRemoveCreature}
                        onUpdateCreature={handleUpdateCreature}
                    />
                </div>
            </main>
        </div>
    )
}

export default App