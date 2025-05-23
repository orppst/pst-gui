import { createRoot } from 'react-dom/client';
import {createTheme, MantineProvider} from "@mantine/core";
import App2 from "./App2.tsx"
import './index.css'
import {ModalsProvider} from "@mantine/modals";
import {Notifications} from "@mantine/notifications";
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import CustomModal from './util/Modal.tsx';

//if we want to override any parts of theme we can do it here
// this 'theme' object is merged with the 'theme' property of MantineProvider
// see https://mantine.dev/theming/theme-object/

export const theme = createTheme({
    respectReducedMotion: false,
    fontFamily: 'Open Sans, sans-serif',
    primaryColor: 'yellow',
    focusRing: 'auto',
    fontSmoothing: true,
    defaultRadius: 'sm',
})

const queryClient = new QueryClient();

function App() {

    return (
            <MantineProvider theme={theme}>
                <ModalsProvider modals={{ investigator_modal: CustomModal }}>
                    <Notifications />
                    <QueryClientProvider client={queryClient}>
                        <App2/>
                    </QueryClientProvider>
                </ModalsProvider>
            </MantineProvider>
    );
}

createRoot(document.getElementById('root') as HTMLElement).render(

        <App />
   ,
)
