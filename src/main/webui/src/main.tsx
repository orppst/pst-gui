import {StrictMode} from 'react'
import { createRoot } from 'react-dom/client';
import {MantineProvider} from "@mantine/core";
import App2 from "./App2.tsx"
import './index.css'

createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
        <MantineProvider
            withGlobalStyles
            withNormalizeCSS
            theme={{
                fontSizes: {
                    xs: '0.85rem',
                    sm: '1.0rem',
                    md: '1.15rem',
                    lg: '1.3rem',
                    xl: '1.45rem',
                },
                //colorScheme: 'dark'
            }}
        >
            <App2/>
        </MantineProvider>
    </StrictMode>,
)
