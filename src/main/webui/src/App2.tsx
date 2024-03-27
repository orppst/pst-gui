import {
    createContext,
    useState,
    useContext,
    ReactElement,
    SyntheticEvent,
    Context, StrictMode
} from 'react';
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query';
import { Person} from "./generated/proposalToolSchemas";
import TitlePanel from './proposal/Title';
import OverviewPanel from "./proposal/Overview";
import NewProposalPanel from './proposal/New';
import SummaryPanel from "./proposal/Summary";
import InvestigatorsPanel from "./Investigators/List";
import AddInvestigatorPanel from "./Investigators/New";
import {
    createBrowserRouter,
    Outlet,
    RouterProvider,
    useNavigate
} from 'react-router-dom';
import { useHistoryState } from "./useHistoryState";
import TechnicalGoalsPanel from "./technicalGoals/technicalGoalsPanel.tsx";
import { TargetPanel } from "./targets/targetPanel.tsx";
import ObservationsPanel from "./observations/observationPanel.tsx";
import DocumentsPanel from "./proposal/Documents";
import SubmitPanel from "./proposal/Submit";

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
    Tooltip, useMantineTheme, useMantineColorScheme, FileButton, Container
} from '@mantine/core';
import {SwitchToggle} from "./ColourSchemeToggle.tsx";
import {
    IconLogout,  IconYinYangFilled
} from '@tabler/icons-react';
import {useDisclosure} from "@mantine/hooks";
import AddButton from './commonButtons/add.tsx';
import DatabaseSearchButton from './commonButtons/databaseSearch.tsx';
import {
    APP_HEADER_HEIGHT, CLOSE_DELAY, ICON_SIZE,
    NAV_BAR_DEFAULT_WIDTH, NAV_BAR_LARGE_WIDTH,
    NAV_BAR_MEDIUM_WIDTH, OPEN_DELAY,
} from './constants.tsx';
import { handleUploadZip } from './proposal/UploadProposal.tsx';
import UploadButton from './commonButtons/upload.tsx';
import AdminPanel from "./admin/adminPanel.tsx";
import JustificationsPanel from "./justifications/JustificationsPanel.tsx";
import {ProposalList} from "./ProposalList.tsx";

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


    // set proposal code.
    const historyProposalCode= 0;
    const [selectedProposalCode] = useState(historyProposalCode)

    // get database query client.
    const queryClient = new QueryClient()

    // the colour gray used by the tools.
    const theme = useMantineTheme();
    const {colorScheme} = useMantineColorScheme();

    const GRAY = theme.colors.gray[6];

    // the paths to route to.
    const router = createBrowserRouter(
        [
            {path: "/", element: <PSTRoot/>,
                children: [
                    {index: true, element: <PSTStart/>} ,
                    {
                        path: "admin",
                        element: <AdminPanel />
                    },
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
                        element:<DocumentsPanel />} ,
                    {
                        path: "proposal/:selectedProposalCode/submit",
                        element:<SubmitPanel />}
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
    function PSTRoot(): ReactElement {
        const {user, getToken, authenticated, apiUrl} = useContext(ProposalContext);
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
         * resolves the routing when requesting the Admin Page
         *
         * @param {React.SyntheticEvent} event the event (click)
         */
        function handleAdminPage(event: SyntheticEvent): void {
            event.preventDefault();
            navigate("admin")
        }

        /*
            We only want to show the Administration Panel Button to those users
            assigned an "administration" role but as user roles have yet to be
            defined, or at least aren't accessible here, we can't do that.
         */

        return (
            <ProposalContext.Provider
                value={{selectedProposalCode, user, getToken, authenticated, apiUrl}}>
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
                                    <DatabaseSearchButton
                                        toolTipLabel={
                                        "Locate proposals by " +
                                            user.fullName + "."}
                                        label={"Proposals for " + user.fullName}
                                        onClickEvent={handleSearch}
                                    />
                                    <AddButton toolTipLabel={"new proposal"}
                                               label={"Create a new proposal"}
                                               onClickEvent={handleAddNew}/>
                                    <FileButton onChange={handleUploadZip}
                                                accept={".zip"}>
                                        {(props) => <UploadButton
                                            toolTipLabel="select a file from disk to upload"
                                            label={"Import"}
                                            onClick={props.onClick}/>}
                                    </FileButton>
                                </Group>
                            </Grid.Col>
                            <Grid.Col span={1}>
                                <Group justify={"flex-end"}>
                                    {SwitchToggle()}
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
                        </AppShell.Section>
                        <AppShell.Section component={ScrollArea}>
                            <ProposalListWrapper proposalTitle={proposalTitleFilter} investigatorName={investigatorNameFilter} auth={authenticated}/>
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
