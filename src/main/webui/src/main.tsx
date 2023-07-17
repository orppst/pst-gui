import {StrictMode} from 'react'
import { createRoot } from 'react-dom/client';
import App2 from "./App2.tsx"
import './index.css'

createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
            <App2/>
    </StrictMode>,
)
