import { type FC } from 'react';
// import { useState } from 'react'
// import viteLogo from '/vite.svg'
// import reactLogo from './assets/react.svg'
import demesneLogo from './assets/demesne-logo.png'
// import ExampleComponent from './components/ExampleComponent'
import './App.css'
import { SpellList } from "./components/SpellList";
import { CreatureList } from "./components/CreatureList";

const App: FC = () => {
    // const [count, setCount] = useState(0)

    return (
        <div className="app">
            <header className="app-header">
                <img src={demesneLogo} className="app-logo" alt="Demesne Logo" />
                <h1>Demesne</h1>
{/*
                <a href="https://vitejs.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
*/}
            </header>

{/*
            <h1>Demesne</h1>

            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
*/}

            <main>
                <div className="lists-container">
                    <SpellList />
                    <CreatureList />
                </div>
            </main>

{/*
            <ExampleComponent />

            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
*/}
        </div>
    )
}

export default App