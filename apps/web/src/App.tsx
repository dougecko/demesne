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
            if (!item) return initialValue;
            
            const parsed = JSON.parse(item);
            // Special handling for Set
            if (initialValue instanceof Set) {
                return new Set(Array.isArray(parsed) ? parsed : []);
            }
            
            return parsed;
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
                // Special handling for Set
                if (valueToStore instanceof Set) {
                    window.localStorage.setItem(key, JSON.stringify(Array.from(valueToStore)));
                } else {
                    window.localStorage.setItem(key, JSON.stringify(valueToStore));
                }
            }
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue];
};

const App = () => {
    const [selectedCreatures, setSelectedCreatures] = useLocalStorage<SelectedCreature[]>('encounter-creatures', []);
    const [pinnedCreatures, setPinnedCreatures] = useLocalStorage<Set<string>>('pinned-creatures', new Set([]));

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
        
        // Pin the creature if it's not already pinned
        setPinnedCreatures(prev => {
            const next = new Set(prev);
            next.add(creature.id);
            return next;
        });
    };

    const handleRemoveCreature = (name: string) => {
        const baseName = name.split(' #')[0];
        
        setSelectedCreatures((prev: SelectedCreature[]) => {
            const withoutRemoved = prev.filter(c => c.name !== name);
            
            // Check if this was the last creature of this type
            const remainingOfType = withoutRemoved.filter(c => c.name.startsWith(baseName));
            if (remainingOfType.length === 0) {
                // Unpin the creature type
                setPinnedCreatures(prev => {
                    const next = new Set(prev);
                    const creatureToUnpin = selectedCreatures.find(c => c.name === name);
                    if (creatureToUnpin) {
                        next.delete(creatureToUnpin.id);
                    }
                    return next;
                });
            }
            
            return withoutRemoved;
        });
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
                            pinnedCreatures={pinnedCreatures}
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