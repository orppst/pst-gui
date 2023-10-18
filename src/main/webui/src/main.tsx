import {StrictMode} from 'react'
import { createRoot } from 'react-dom/client';
import {createTheme, MantineProvider} from "@mantine/core";
import App2 from "./App2.tsx"
import './index.css'
import {ModalsProvider} from "@mantine/modals";
import {Notifications} from "@mantine/notifications";
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

//if we want to override any parts of theme we can do it here
// this 'theme' object is merged with the 'theme' property of MantineProvider
// see https://mantine.dev/theming/theme-object/

const theme = createTheme({
    respectReducedMotion: false,
    fontFamily: 'Open Sans, sans-serif',
    primaryColor: 'yellow',
    focusRing: 'always',
    fontSmoothing: true,
    defaultRadius: 'sm',
})

function App() {

    return (
            <MantineProvider theme={theme}>
                <ModalsProvider>
                    <Notifications />
                    <App2/>
                </ModalsProvider>
            </MantineProvider>
    );
}

createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
