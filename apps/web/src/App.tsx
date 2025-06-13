import { useState } from 'react';
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

const App = () => {
    const [selectedCreatures, setSelectedCreatures] = useState<SelectedCreature[]>([]);

    const handleCreatureSelect = (creature: Creature) => {
        // Get the base name without any number suffix
        const baseName = creature.name.split(' #')[0];
        
        // Count how many of this creature type we already have
        const existingCount = selectedCreatures.filter(c => c.name.startsWith(baseName)).length;
        
        // Create a new instance with a numbered name
        const newSelectedCreature: SelectedCreature = {
            ...creature,
            name: existingCount > 0 ? `${baseName} #${existingCount + 1}` : baseName,
            currentHitPoints: creature.hitPoints,
            initiative: rollInitiative(creature.stats),
            conditions: []
        };
        
        setSelectedCreatures(prev => [...prev, newSelectedCreature]);
    };

    const handleRemoveCreature = (name: string) => {
        setSelectedCreatures(prev => prev.filter(c => c.name !== name));
        
        // Renumber remaining creatures of the same type
        const baseName = name.split(' #')[0];
        const remainingCreatures = selectedCreatures.filter(c => c.name.startsWith(baseName) && c.name !== name);
        
        if (remainingCreatures.length > 0) {
            setSelectedCreatures(prev => 
                prev.map(creature => {
                    if (creature.name.startsWith(baseName)) {
                        const index = remainingCreatures.findIndex(c => c.name === creature.name);
                        return {
                            ...creature,
                            name: index === 0 ? baseName : `${baseName} #${index + 1}`
                        };
                    }
                    return creature;
                })
            );
        }
    };

    const handleUpdateCreature = (name: string, updates: Partial<SelectedCreature>) => {
        setSelectedCreatures(prev => prev.map(creature => 
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