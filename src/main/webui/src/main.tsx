import React from 'react'
import ReactDOM from 'react-dom/client'
import App2 from "./App2.tsx"
import './index.css'
import {DevSupport} from "@react-buddy/ide-toolbox";
import {ComponentPreviews, useInitial} from "./dev";

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <DevSupport ComponentPreviews={ComponentPreviews}
                    useInitialHook={useInitial}
        >
            <App2/>
        </DevSupport>
    </React.StrictMode>,
)
