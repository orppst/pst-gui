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
                colorScheme: 'dark',

                headings: {
                    fontFamily: 'Roboto, sans-serif',
                    sizes: {
                        h1: { fontSize: '2rem' },
                    }
                },
                defaultRadius: 'sm',
                loader: 'oval'
            }}>
            <ModalsProvider>
                <Notifications />
                <App2/>
            </ModalsProvider>
        </MantineProvider>
    </StrictMode>,
)
