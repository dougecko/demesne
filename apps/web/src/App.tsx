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
        const isSelected = selectedCreatures.some(c => c.id === creature.id);
        if (isSelected) {
            setSelectedCreatures(prev => prev.filter(c => c.id !== creature.id));
        } else {
            const newSelectedCreature: SelectedCreature = {
                ...creature,
                currentHitPoints: creature.hitPoints,
                initiative: rollInitiative(creature.stats),
                conditions: []
            };
            setSelectedCreatures(prev => [...prev, newSelectedCreature]);
        }
    };

    const handleRemoveCreature = (id: string) => {
        setSelectedCreatures(prev => prev.filter(c => c.id !== id));
    };

    const handleUpdateCreature = (id: string, updates: Partial<SelectedCreature>) => {
        setSelectedCreatures(prev => prev.map(creature => 
            creature.id === id ? { ...creature, ...updates } : creature
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