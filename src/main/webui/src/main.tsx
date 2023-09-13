import {StrictMode, useState} from 'react'
import { createRoot } from 'react-dom/client';
import {ColorScheme, ColorSchemeProvider, MantineProvider} from "@mantine/core";
import App2 from "./App2.tsx"
import './index.css'
import {ModalsProvider} from "@mantine/modals";
import {Notifications} from "@mantine/notifications";

function App() {
    const [colorScheme, setColorScheme] = useState<ColorScheme>('dark');
    const toggleColorScheme = (value?: ColorScheme) =>
        setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

    return (
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
            <MantineProvider
                withGlobalStyles
                withNormalizeCSS
                theme={{
                    colorScheme,

                    headings: {
                        fontFamily: 'Roboto, sans-serif',
                        sizes: {
                            h1: { fontSize: '2rem' },
                        }
                    },
                    defaultRadius: 'md',
                    loader: 'oval'
                }}>
                <ModalsProvider>
                    <Notifications />
                    <App2/>
                </ModalsProvider>
            </MantineProvider>
        </ColorSchemeProvider>
    );
}

createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
