import {StrictMode} from 'react'
import { createRoot } from 'react-dom/client';
import {MantineProvider} from "@mantine/core";
import App2 from "./App2.tsx"
import './index.css'
import {ModalsProvider} from "@mantine/modals";
import {Notifications} from "@mantine/notifications";

createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
        <MantineProvider
            withGlobalStyles
            withNormalizeCSS
            theme={{
                colorScheme: 'light',
                colors: {
                    deepBlue: ['#E9EDFC', '#C1CCF6', '#99ABF0']
                },

                shadows: {
                    md: '1px 1px 3px rgba(0, 0, 0, .25)',
                    xl: '5px 5px 3px rgba(0, 0, 0, .25)'
                },

                headings: {
                    fontFamily: 'Roboto, sans-serif',
                    sizes: {
                        h1: { fontSize: '2rem' },
                    }
                },
                defaultRadius: 'sm',
                loader: 'oval'
            }}
            >
            <ModalsProvider>
                <Notifications />
                <App2/>
            </ModalsProvider>
        </MantineProvider>
    </StrictMode>,
)
