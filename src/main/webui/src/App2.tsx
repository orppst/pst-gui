import {
    createContext,
    useContext,
    ReactElement,
    Context, StrictMode, SyntheticEvent
} from 'react';
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query';
import { Person} from "./generated/proposalToolSchemas";
import TitlePanel from './ProposalEditorView/proposal/Title';
import OverviewPanel from "./ProposalEditorView/proposal/Overview";
import NewProposalPanel from './ProposalEditorView/proposal/New';
import SummaryPanel from "./ProposalEditorView/proposal/Summary";
import InvestigatorsPanel from "./ProposalEditorView/Investigators/List";
import AddInvestigatorPanel from "./ProposalEditorView/Investigators/New";
import {
    createBrowserRouter,
    RouterProvider, useNavigate,
} from 'react-router-dom';
import TechnicalGoalsPanel from "./ProposalEditorView/technicalGoals/technicalGoalsPanel.tsx";
import { TargetPanel } from "./ProposalEditorView/targets/targetPanel.tsx";
import ObservationsPanel from "./ProposalEditorView/observations/observationPanel.tsx";
import DocumentsPanel from "./ProposalEditorView/proposal/Documents";
import SubmitPanel from "./ProposalEditorView/proposal/Submit";

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {AuthProvider} from "./auth/Auth.tsx";
import {
    Text, Container, Group, ActionIcon
} from '@mantine/core';
import AdminPanel from "./admin/adminPanel.tsx";
import JustificationsPanel from "./ProposalEditorView/justifications/JustificationsPanel.tsx";
import EditorAppShell from "./EditorAppShell.tsx";
import ManagementAppShell from "./ManagementAppShell.tsx";
import * as React from "react";
import {IconEdit, IconUniverse} from "@tabler/icons-react";

/**
 * defines the user context type.
 */
export type UserContextType = {
    user: Person;
    getToken: () => string;
    authenticated: boolean;
}

/**
 * defines the proposal context type.
 */
export type ProposalContextType = {
    selectedProposalCode: number;
    apiUrl: string;
}

/**
 * generates a proposal context.
 *
 * @type {React.Context<UserContextType & ProposalContextType>} the context.
 */
export const ProposalContext:
        Context<UserContextType & ProposalContextType> =
    createContext<UserContextType & ProposalContextType>({
        user: {},
        getToken: ()=>{return ""},
        authenticated: false,
        selectedProposalCode: 0,
        apiUrl:"http://api" // obviously false as a placeholder
    })

/**
 * provides an interface for getting the proposal context token.
 * @return {string} the token.
 */
export const useToken = (): string => {
    return useContext(ProposalContext).getToken();
};

export type CycleContextType = {
    selectedCycleCode: number;
}
export const CycleContext: Context<CycleContextType>  = createContext({
    selectedCycleCode: 0
});

export type PSTAppShellProps = {
    setEditorMode: React.Dispatch<React.SetStateAction<boolean>>
}


/**
 * generates the html for the main app.
 * @return {ReactElement} dynamic html for the main app.
 * @constructor
 */
function App2(): ReactElement {

    // get database query client.
    const queryClient = new QueryClient();

    // the paths to route to.
    const router = createBrowserRouter([
            {
              path: "/", element: <PSTRoot />,
            },
            {
                path: "/editor", element: <PSTEditor />,
                children: [
                    {index: true, element: <PSTStart/>} ,
                    {
                        path: "admin",
                        element: <AdminPanel />
                    },

                    // ---- Proposal Editor routes -------

                    {
                        path: "proposal/new",
                        element: <NewProposalPanel />
                    },
                    {
                        path: "proposal/:selectedProposalCode",
                        element: <OverviewPanel />
                    },
                    {
                        path: "proposal/:selectedProposalCode/title",
                        element: <TitlePanel />
                    },
                    {
                        path: "proposal/:selectedProposalCode/summary",
                        element: <SummaryPanel />
                    },
                    {
                        path: "proposal/:selectedProposalCode/investigators",
                        element:<InvestigatorsPanel />
                    },
                    {
                        path:
                            "proposal/:selectedProposalCode/investigators/new",
                        element:<AddInvestigatorPanel />
                    },
                    {
                        path: "proposal/:selectedProposalCode/justifications",
                        element: <JustificationsPanel />
                    },
                    {
                        path: "proposal/:selectedProposalCode/targets",
                        element:<TargetPanel />
                    },
                    {
                        path: "proposal/:selectedProposalCode/goals",
                        element:<TechnicalGoalsPanel />
                    },
                    {
                        path: "proposal/:selectedProposalCode/observations",
                        element:<ObservationsPanel />
                    },
                    {
                        path: "proposal/:selectedProposalCode/documents",
                        element:<DocumentsPanel />
                    } ,
                    {
                        path: "proposal/:selectedProposalCode/submit",
                        element:<SubmitPanel />
                    },

                    // ---- Proposal Management routes -------
                ]
            },
            {
                path: "manager", element: <PSTManager />,
            }
            ],
        {basename: "/pst/gui/tool/"}
    )

    return (
        <AuthProvider>
            <StrictMode>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router}/>
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
            </StrictMode>
        </AuthProvider>
    );


    function PSTRoot() : ReactElement {
        const navigate = useNavigate();
        return (
            <Container fluid>
                <Group>
                    <ActionIcon
                        onClick={(e : SyntheticEvent)=>{e.preventDefault(); navigate("editor")}}
                    >
                        <IconEdit/>
                    </ActionIcon>
                    <ActionIcon
                        onClick={(e: SyntheticEvent)=>{e.preventDefault(); navigate("manager")}}
                    >
                        <IconUniverse/>
                    </ActionIcon>
                </Group>
            </Container>
        )
    }


    /**
     * main HTML for the UI.
     * @return {ReactElement} the dynamic html for the main UI.
     * @constructor
     */
    function PSTEditor(): ReactElement {
        const proposalContext = useContext(ProposalContext);
        return (
            <ProposalContext.Provider value={proposalContext}>
                <EditorAppShell />
            </ProposalContext.Provider>
        )
    }

    function PSTManager() : ReactElement {
        const cycleContext = useContext(CycleContext);
        return (
            <CycleContext.Provider value={cycleContext}>
                <ManagementAppShell />
            </CycleContext.Provider>
        )
    }


    /**
     * html to show in the main page when "proposals for username" is selected.
     * @return {ReactElement} the html to display when
     * "proposals for username" is selected.
     * @constructor
     */
    function PSTStart(): ReactElement {
        return (
            <Container pt={10}>

                <Text fz={"lg"} fw={"bold"} c={"teal.7"}>
                    Polaris Landing Page
                </Text>

                <img src={"/pst/gui/temporary-ufo-landing.png"}
                     alt={"welcome image of a ufo crash landing"}
                     width={"100%"}
                />
            </Container>
        );
    }
}

// export the main app.
export default App2
