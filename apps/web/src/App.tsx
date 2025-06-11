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
import type { Creature } from '@demesne/types';

const App = () => {
    const [selectedCreatures, setSelectedCreatures] = useState<Creature[]>([]);

    const handleRemoveCreature = (id: string) => {
        setSelectedCreatures(prev => prev.filter(c => c.id !== id));
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
                            onCreatureSelect={setSelectedCreatures}
                            onRemoveCreature={handleRemoveCreature}
                        />
                    </div>
                    <Encounter 
                        selectedCreatures={selectedCreatures}
                        onRemoveCreature={handleRemoveCreature}
                    />
                </div>
            </main>
        </div>
    )
}

export default App