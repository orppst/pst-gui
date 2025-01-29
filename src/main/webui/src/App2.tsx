import {
    createContext,
    useContext,
    ReactElement,
    SyntheticEvent,
    Context, StrictMode
} from 'react';
import {
    QueryClient,
    QueryClientProvider, useQueryClient,
} from '@tanstack/react-query';
import {ObservingProposal, Person} from "./generated/proposalToolSchemas.ts";
import OverviewPanel from "./ProposalEditorView/proposal/Overview.tsx";
import NewProposalPanel from './ProposalEditorView/proposal/New.tsx';
import InvestigatorsPanel from "./ProposalEditorView/investigators/List.tsx";
import AddInvestigatorPanel from "./ProposalEditorView/investigators/New.tsx";
import {
    createBrowserRouter,
    Outlet,
    RouterProvider,
    useNavigate
} from 'react-router-dom';
import { useHistoryState } from "./useHistoryState";
import TechnicalGoalsPanel from "./ProposalEditorView/technicalGoals/technicalGoalsPanel.tsx";
import { TargetPanel } from "./ProposalEditorView/targets/targetPanel.tsx";
import ObservationsPanel from "./ProposalEditorView/observations/observationPanel.tsx";
import DocumentsPanel from "./ProposalEditorView/proposal/Documents.tsx";
import SubmitPanel from "./ProposalEditorView/submitProposal/submitPanel.tsx";

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {AuthProvider} from "./auth/Auth.tsx";
import {
    AppShell,
    Text,
    TextInput,
    Grid,
    Burger,
    ScrollArea,
    Group,
    ActionIcon,
    Tooltip, useMantineTheme, useMantineColorScheme, FileButton, Container,
} from '@mantine/core';
import {ColourSchemeToggle} from "./ColourSchemeToggle";
import {
    IconLogout, IconUniverse
} from '@tabler/icons-react';
import {useDisclosure} from "@mantine/hooks";
import AddButton from './commonButtons/add';
import DatabaseSearchButton from './commonButtons/databaseSearch';
//import {ContextualHelpButton} from "./commonButtons/contextualHelp.tsx"
import {
    APP_HEADER_HEIGHT, CLOSE_DELAY, ICON_SIZE, JSON_FILE_NAME,
    NAV_BAR_DEFAULT_WIDTH, NAV_BAR_LARGE_WIDTH,
    NAV_BAR_MEDIUM_WIDTH, OPEN_DELAY,
} from './constants';
import {SendToImportAPI} from './ProposalEditorView/proposal/UploadProposal';
import UploadButton from './commonButtons/upload';
import AdminPanel from "./admin/adminPanel";
import JustificationsPanel from "./ProposalEditorView/justifications/JustificationsPanel";
import {ProposalList} from "./ProposalList";
import ProposalManagerStartPage from "./ProposalManagerView/startPage.tsx";
import CycleOverviewPanel from "./ProposalManagerView/proposalCycle/overview.tsx";
import CycleDatesPanel from "./ProposalManagerView/proposalCycle/dates.tsx";
import CycleObservingModesPanel from "./ProposalManagerView/observingModes/observingModesPanel.tsx";
import CycleAvailableResourcesPanel from "./ProposalManagerView/availableResources/availableResourcesPanel.tsx";
import ReviewsPanel from "./ProposalManagerView/reviews/ReviewsPanel.tsx";
import AllocationsPanel from "./ProposalManagerView/allocations/allocationsPanel.tsx";
import CycleObservatoryPanel from "./ProposalManagerView/proposalCycle/observatory.tsx";
import CycleTACPanel from "./ProposalManagerView/TAC/tacPanel.tsx";
import CycleTACAddMemberPanel from "./ProposalManagerView/TAC/tacNewMember.tsx"
import CycleTitlePanel from "./ProposalManagerView/proposalCycle/title.tsx";
import ObservationFieldsPanel from "./ProposalEditorView/observationFields/ObservationFieldsPanel.tsx";
import AssignReviewersPanel from "./ProposalManagerView/assignReviewers/AssignReviewersPanel.tsx";
import ErrorPage from "./errorHandling/error-page.jsx"
import {PanelFrame} from "./commonPanel/appearance.tsx";
import TacCycles from "./ProposalManagerView/landingPage/tacCycles.tsx";
import EditorLandingPage from "./ProposalEditorView/landingPage/editorLandingPage.tsx";
import TitleSummaryKind from "./ProposalEditorView/proposal/TitleSummaryKind.tsx";
import {notifyError} from "./commonPanel/notifications.tsx";
import JSZip from "jszip";

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

/**
 * generates the html for the main app.
 * @return {ReactElement} dynamic html for the main app.
 * @constructor
 */
function App2(): ReactElement {

    // get database query client.
    const queryClient = new QueryClient()

    // the colour gray used by the tools.
    const theme = useMantineTheme();
    const {colorScheme} = useMantineColorScheme();

    const GRAY = theme.colors.gray[6];

    // the paths to route to.
    const router = createBrowserRouter(
        [
            {
                path: "/manager",
                element: <PSTManager />,
                errorElement: <ErrorPage />,
                children: [
                    {index: true, element: <PSTManagerStart />},
                    {
                        path: "cycle/:selectedCycleCode",
                        element: <CycleOverviewPanel />,
                        errorElement: <ErrorPage />,
                    },
                    {
                        path: "cycle/:selectedCycleCode/title",
                        element: <CycleTitlePanel />,
                        errorElement: <ErrorPage />,
                    },
                    {
                        path: "cycle/:selectedCycleCode/tac",
                        element: <CycleTACPanel />,
                        errorElement: <ErrorPage />,
                    },
                    {
                        path: "cycle/:selectedCycleCode/tac/new",
                        element: <CycleTACAddMemberPanel />,
                        errorElement: <ErrorPage />,
                    },
                    {
                        path: "cycle/:selectedCycleCode/dates",
                        element: <CycleDatesPanel />,
                        errorElement: <ErrorPage />,
                    },
                    {
                        path: "cycle/:selectedCycleCode/observingModes",
                        element: <CycleObservingModesPanel />,
                        errorElement: <ErrorPage />,
                    },
                    {
                        path: "cycle/:selectedCycleCode/availableResources",
                        element: <CycleAvailableResourcesPanel />,
                        errorElement: <ErrorPage />,
                    },
                    {
                        path: "cycle/:selectedCycleCode/reviews",
                        element: <ReviewsPanel />,
                        errorElement: <ErrorPage />,
                    },
                    {
                        path: "cycle/:selectedCycleCode/allocations",
                        element: <AllocationsPanel />,
                        errorElement: <ErrorPage />,
                    },
                    {
                        path: "cycle/:selectedCycleCode/observatory",
                        element: <CycleObservatoryPanel />,
                        errorElement: <ErrorPage />,
                    },
                    {
                        path: "cycle/:selectedCycleCode/assignReviewers",
                        element: <AssignReviewersPanel />,
                        errorElement: <ErrorPage />,
                    }
                ]
            },
            {
                path: "/",
                element: <PSTEditor/>,
                errorElement: <ErrorPage />,
                children: [
                    {index: true, element: <PSTStart/>} ,
                    {
                        path: "admin",
                        element: <AdminPanel />,
                        errorElement: <ErrorPage />,
                    },
                    {
                        path: "proposal/new",
                        element: <NewProposalPanel />,
                        errorElement: <ErrorPage />,
                    },
                    {
                        path: "proposal/:selectedProposalCode",
                        element: <OverviewPanel/>,
                        errorElement: <ErrorPage />,
                    },
                    {
                        path: "proposal/:selectedProposalCode/titleSummaryKind",
                        element: <TitleSummaryKind />
                    },
                    {
                        path: "proposal/:selectedProposalCode/investigators",
                        element:<InvestigatorsPanel />,
                        errorElement: <ErrorPage />,
                    },
                    {
                        path:
                            "proposal/:selectedProposalCode/investigators/new",
                        element:<AddInvestigatorPanel />,
                        errorElement: <ErrorPage />,
                    },
                    {
                        path: "proposal/:selectedProposalCode/justifications",
                        element: <JustificationsPanel />,
                        errorElement: <ErrorPage />,
                    },
                    {
                        path: "proposal/:selectedProposalCode/targets",
                        element:<TargetPanel />,
                        errorElement: <ErrorPage />,
                    },
                    {
                        path: "proposal/:selectedProposalCode/goals",
                        element:<TechnicalGoalsPanel />,
                        errorElement: <ErrorPage />,
                    },
                    {
                        path: "proposal/:selectedProposalCode/observationFields",
                        element: <ObservationFieldsPanel />,
                        errorElement: <ErrorPage />,
                    },
                    {
                        path: "proposal/:selectedProposalCode/observations",
                        element:<ObservationsPanel />,
                        errorElement: <ErrorPage />,
                    },
                    {
                        path: "proposal/:selectedProposalCode/documents",
                        element:<DocumentsPanel />,
                        errorElement: <ErrorPage />,
                    } ,
                    {
                        path: "proposal/:selectedProposalCode/submit",
                        element:<SubmitPanel />,
                        errorElement: <ErrorPage />,
                    },

                ]}], {
            basename: "/pst/gui/tool/"
        }

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

    /**
     * main HTML for the UI.
     * @return {ReactElement} the dynamic html for the main UI.
     * @constructor
     */
    function PSTEditor(): ReactElement {
        const proposalContext = useContext(ProposalContext);
        const authToken = useToken();
        const queryClient = useQueryClient();
        const [opened, {toggle}] = useDisclosure();
        const navigate = useNavigate();
        // acquire the state setters for proposal title and investigator name.
        const [proposalTitleFilter, setProposalTitleFilter] = useHistoryState(
            "proposalTitle", "");
        const [investigatorNameFilter, setInvestigatorNameFilter] = useHistoryState(
            "investigatorName", "");

        //active state for the NavLink sections

        /**
         * resolves the routing for when making a new proposal.
         *
         * @param {React.SyntheticEvent} event the event.
         */
        function handleAddNew(event: SyntheticEvent): void {
            event.preventDefault();
            navigate("proposal/new");
        }

        /**
         * resolves the routing for when searching for a proposal.
         *
         * @param {React.SyntheticEvent} event the event.
         */
        function handleSearch(event: SyntheticEvent): void {
            event.preventDefault();
            navigate("/");
        }

        /**
         * Handles looking up a file and uploading it to the system.
         * @param {File} chosenFile the zip file containing a json representation
         * of the proposal and any supporting documents.
         */
        const handleUploadZip =
            async (chosenFile: File | null) => {
                // check for no file.
                if (chosenFile === null) {
                    notifyError("Upload failed", "There was no file to upload")
                }

                // all simple checks done. Time to verify the internals of the zip.
                if (chosenFile !== null) {
                    JSZip.loadAsync(chosenFile).then(function (zip) {
                        // check the json file exists.
                        if (!Object.keys(zip.files).includes(JSON_FILE_NAME)) {
                            notifyError("Upload failed",
                                "There was no file called '"+JSON_FILE_NAME+"' within the zip")
                        }

                        // extract json data to import proposal definition.
                        zip.files[JSON_FILE_NAME].async('text').then(function (fileData) {
                            const jsonObject: ObservingProposal = JSON.parse(fileData)
                            // ensure not undefined
                            if (jsonObject) {
                                SendToImportAPI(jsonObject, zip, authToken, queryClient);
                            } else {
                                notifyError("Upload failed", "The JSON file failed to load correctly")
                            }
                        })
                            .catch(() => {
                                console.log("Unable to extract " + JSON_FILE_NAME + " from zip file");
                                notifyError("Upload failed",
                                    "Unable to extract " + JSON_FILE_NAME + " from zip file");
                            })
                    })
                }
            }




        /*
        DJW:
        I'd like to move the 'AppShell' stuff to its own file, however in doing so the
        Accordion used to navigate the proposal in the left-hand navbar seems not to
        remember state; the accordion item does not get highlighted and, more fundamentally,
        the accordion collapses, and I can't figure out why.
         */
        return (
            <ProposalContext.Provider value={proposalContext}>
                <AppShell
                    header={{height: APP_HEADER_HEIGHT}}
                    navbar={{
                        width: {
                            base: NAV_BAR_DEFAULT_WIDTH,
                            md: NAV_BAR_MEDIUM_WIDTH,
                            lg: NAV_BAR_LARGE_WIDTH},
                        breakpoint: 'sm',
                        collapsed: {mobile: !opened},
                    }}
                >
                    <AppShell.Header p="md">
                        <Grid columns={2}>
                            <Grid.Col span={1}>
                                <Group h="100%" px="md" wrap={"nowrap"}>
                                    <Burger
                                        opened={opened}
                                        onClick={toggle}
                                        hiddenFrom={"sm"}
                                        size="lg"
                                        color={GRAY}
                                        mr="xl"
                                    />
                                    <img src={"/pst/gui/polaris4.png"}
                                         alt="Polaris"
                                         width={60}/>
                                    <Tooltip
                                        label={"go to proposal management view"}
                                        openDelay={OPEN_DELAY}
                                    >
                                        <ActionIcon
                                            color={"pink"}
                                            variant={"subtle"}
                                            onClick={(e: SyntheticEvent)=>{e.preventDefault(); navigate("/manager")}}
                                        >
                                            <IconUniverse />
                                        </ActionIcon>
                                    </Tooltip>
                                    <DatabaseSearchButton
                                        toolTipLabel={
                                            "Locate proposals by " +
                                            proposalContext.user.fullName + "."}
                                        label={"Proposals for " + proposalContext.user.fullName}
                                        onClickEvent={handleSearch}
                                    />

                                </Group>
                            </Grid.Col>
                            <Grid.Col span={1}>
                                <Group justify={"flex-end"}>
                                    {ColourSchemeToggle()}
                                    <Tooltip label={"logout"}
                                             openDelay={OPEN_DELAY}
                                             closeDelay={CLOSE_DELAY}
                                    >
                                        <ActionIcon color={"orange.8"}
                                                    variant={"subtle"}
                                                    component={"a"}
                                                    href={"/pst/gui/logout"}
                                        >
                                            <IconLogout size={ICON_SIZE}/>
                                        </ActionIcon>
                                    </Tooltip>
                                </Group>
                            </Grid.Col>
                        </Grid>
                    </AppShell.Header>

                    <AppShell.Navbar>
                        <AppShell.Section>
                            <Container fluid bg={colorScheme === 'dark' ? theme.colors.cyan[9] : theme.colors.blue[1]}>
                                <Text fz="sm">
                                    Filter existing proposals by:
                                </Text>
                                <TextInput label="Title"
                                           value={proposalTitleFilter}
                                           onChange={(e: { target: { value: string; }; }) =>
                                               setProposalTitleFilter(e.target.value)}
                                />
                                <TextInput label="Investigator name"
                                           value={investigatorNameFilter}
                                           onChange={(e: { target: { value: string; }; }) =>
                                               setInvestigatorNameFilter(e.target.value)}
                                           pb={"md"}
                                />
                            </Container>

                        <AddButton toolTipLabel={"new proposal"}
                            label={"Create new proposal"}
                            onClickEvent={handleAddNew}/>
                        <FileButton
                            onChange={handleUploadZip}
                            accept={".zip"}
                        >
                            {(props) =>
                                <UploadButton
                                    toolTipLabel="select a file from disk to upload"
                                    label={"Import existing proposal"}
                                    onClick={props.onClick}
                                />
                            }
                        </FileButton>
                        </AppShell.Section>
                        <AppShell.Section component={ScrollArea}>
                            <ProposalListWrapper
                                proposalTitle={proposalTitleFilter}
                                investigatorName={investigatorNameFilter}
                                auth={proposalContext.authenticated}
                            />
                        </AppShell.Section>
                    </AppShell.Navbar>
                    <AppShell.Main pr={"sm"}>
                        <Outlet/>
                    </AppShell.Main>
                </AppShell>
            </ProposalContext.Provider>
        )
    }

    function ProposalListWrapper(props:{proposalTitle: string, investigatorName:string, auth:boolean}) : ReactElement {
        //console.log(props);
        if (props.auth) {
            return <ProposalList proposalTitle={props.proposalTitle} investigatorName={props.investigatorName} />
        }
        else {
            return <></>
        }
    }
    /**
     * html to show in the main page when "proposals for username" is selected.
     * @return {ReactElement} the html to display when
     * "proposals for username" is selected.
     * @constructor
     */
    function PSTStart(): ReactElement {
        return (
            <PanelFrame>
                <EditorLandingPage/>
            </PanelFrame>
        );
    }

    function PSTManager() : ReactElement {
        return (
            <ProposalManagerStartPage/>
        );
    }

    function PSTManagerStart() : ReactElement {
        return(
            <PanelFrame>
                <TacCycles />
            </PanelFrame>
        )
    }

}

// export the main app.
export default App2