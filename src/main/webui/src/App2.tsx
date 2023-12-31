import {
    createContext,
    useState,
    useContext,
    ReactElement,
    SyntheticEvent,
    Context
} from 'react';
import {
    QueryClient,
    QueryClientProvider,
    UseQueryResult
} from '@tanstack/react-query';
import {
    ProposalResourceGetProposalsError,
    ProposalResourceGetProposalsResponse,
    useProposalResourceGetProposals
} from './generated/proposalToolComponents'
import { Person} from "./generated/proposalToolSchemas";
import TitlePanel from './proposal/Title';
import TargetPanel from './targets/List';
import OverviewPanel from "./proposal/Overview";
import NewProposalPanel from './proposal/New';
import SummaryPanel from "./proposal/Summary";
import InvestigatorsPanel from "./Investigators/List";
import AddInvestigatorPanel from "./Investigators/New";
import {
    createBrowserRouter,
    Link,
    Outlet,
    RouterProvider,
    useNavigate
} from 'react-router-dom';
import { useHistoryState } from "./useHistoryState";
import TechnicalGoalsPanel from "./technicalGoals/technicalGoalsPanel.tsx";
import ObservationsPanel from "./observations/observationPanel.tsx";
import DocumentsPanel from "./proposal/Documents";

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {AuthProvider} from "./auth/Auth.tsx";
import {
    AppShell,
    NavLink,
    Box,
    Text,
    TextInput,
    Grid,
    Burger,
    ScrollArea,
    Group,
    ActionIcon,
    Tooltip, useMantineTheme, useMantineColorScheme
} from '@mantine/core';
import {SwitchToggle} from "./ColourSchemeToggle.tsx";
import {
    IconCamera,
    IconChartLine,
    IconChevronRight,
    IconFileCheck,
    IconFileDescription, IconFiles,
    IconLogout, IconTarget, IconUsersGroup
} from '@tabler/icons-react';
import {useDisclosure} from "@mantine/hooks";
import AddButton from './commonButtons/add.tsx';
import DatabaseSearchButton from './commonButtons/databaseSearch.tsx';
import {
    APP_HEADER_HEIGHT, CLOSE_DELAY, ICON_SIZE, JSON_SPACES,
    NAV_BAR_DEFAULT_WIDTH, NAV_BAR_LARGE_WIDTH,
    NAV_BAR_MEDIUM_WIDTH, OPEN_DELAY, STROKE
} from './constants.tsx';

/**
 * defines the user context type.
 */
export type UserContextType = {
    user: Person;
    token: string;
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
        token:"",
        selectedProposalCode: 0,
        apiUrl:"http://api" // obviously false as a placeholder
    })

/**
 * provides an interface for getting the proposal context token.
 * @return {string} the token.
 */
export const useToken = (): string => {
    return useContext(ProposalContext).token;
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
                        path: "proposal/new",
                        element: <NewProposalPanel /> },
                    {
                        path: "proposal/:selectedProposalCode",
                        element: <OverviewPanel />},
                    {
                        path: "proposal/:selectedProposalCode/title",
                        element: <TitlePanel />} ,
                    {
                        path: "proposal/:selectedProposalCode/summary",
                        element: <SummaryPanel />} ,
                    {
                        path: "proposal/:selectedProposalCode/investigators",
                        element:<InvestigatorsPanel />} ,
                    {
                        path:
                            "proposal/:selectedProposalCode/investigators/new",
                        element:<AddInvestigatorPanel />} ,
                    {
                        path: "proposal/:selectedProposalCode/targets",
                        element:<TargetPanel />} ,
                    {
                        path: "proposal/:selectedProposalCode/goals",
                        element:<TechnicalGoalsPanel />} ,
                    {
                        path: "proposal/:selectedProposalCode/observations",
                        element:<ObservationsPanel />} ,
                    {
                        path: "proposal/:selectedProposalCode/documents",
                        element:<DocumentsPanel />} ,
                ]}], {
            basename: "/pst/gui/tool/"
        }

    )

    return (
        <AuthProvider>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router}/>
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </AuthProvider>
    );

    /**
     * main HTML for the UI.
     * @return {ReactElement} the dynamic html for the main UI.
     * @constructor
     */
    function PSTRoot(): ReactElement {
        const {user, token, apiUrl} = useContext(ProposalContext);
        const [opened, {toggle}] = useDisclosure();
        const navigate = useNavigate();

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

        return (
            <ProposalContext.Provider
                value={{selectedProposalCode, user, token, apiUrl}}>
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
                                    <img src={"/pst/gui/public/polaris4.png"}
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
                                </Group>
                            </Grid.Col>
                            <Grid.Col span={1}>
                                <Group justify={"flex-end"}>
                                    {SwitchToggle()}
                                    <Tooltip label={"logout"}
                                             openDelay={OPEN_DELAY}
                                             closeDelay={CLOSE_DELAY}>
                                        <ActionIcon
                                            color={"orange.8"}
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
                        <Grid columns={1}>
                            <Grid.Col
                                span={1}
                                style={{
                                    borderBottom: "1px",
                                    borderStyle: "solid",
                                    borderColor: theme.colors.gray[5],
                                    backgroundColor: colorScheme === "dark" ?
                                        theme.colors.cyan[9] : theme.colors.blue[1]
                                }}
                            >
                                <AppShell.Section component={ScrollArea}>
                                    <ProposalFilter/>
                                </AppShell.Section>
                            </Grid.Col>
                            <Grid.Col span={1}>
                                <AppShell.Section grow component={ScrollArea}>
                                    <ProposalsList/>
                                </AppShell.Section>
                            </Grid.Col>
                        </Grid>
                    </AppShell.Navbar>
                    <AppShell.Main pr={"sm"}>
                        <Outlet/>
                    </AppShell.Main>
                </AppShell>
            </ProposalContext.Provider>
        )
    }

    /**
     * html to show in the main page when "proposals for username" is selected.
     * @return {ReactElement} the html to display when
     * "proposals for username" is selected.
     * @constructor
     */
    function PSTStart(): ReactElement {
        return (<Box><Text fz={"lg"}>Welcome</Text></Box>);
    }

    /**
     * returns the data from the query to the database for a given
     * proposal title and investigator.
     * @return {UseQueryResult<ProposalResourceGetProposalsResponse,
     *                         ProposalResourceGetProposalsError>} the result
     *                         from the database query.
     * @constructor
     */
    function GetProposalList():
            UseQueryResult<ProposalResourceGetProposalsResponse,
                           ProposalResourceGetProposalsError> {
        const [proposalTitle] = useHistoryState("proposalTitle", "");
        const [investigatorName] = useHistoryState("investigatorName", "");
        return useProposalResourceGetProposals(
            { queryParams: {
                title: "%" + proposalTitle + "%",
                investigatorName: "%" + investigatorName + "%"
              },
           },
            {
                enabled: true,
            }
        );
    }

    /**
     * generates the html for the proposal list.
     *
     * @return {React.ReactElement} the html for the proposal list.
     * @constructor
     */
    function ProposalsList(): ReactElement {
        const result = GetProposalList();

        // if error produced, present error to user.
        if (result.error) {
            return (
                <Box>
                    <pre>{JSON.stringify(result.error, null, JSON_SPACES)}</pre>
                </Box>
            );
        }

        // generate the html.
        return (
            <>
                {result.isLoading ? (<Box>Loading…</Box>) : (
                    <>
                        {result.data?.map((item) => (
                            <NavLink key={item.code}
                                     label={item.title}
                                     childrenOffset={30}
                                     leftSection={<IconFileDescription/>}
                                     rightSection={<IconChevronRight
                                         size="0.8rem"
                                         stroke={STROKE} />}>
                                <NavLink to={"proposal/" + item.code}
                                         component={Link}
                                         label="Overview"
                                         leftSection={<IconFileCheck/>}>
                                </NavLink>
                                <NavLink to={"proposal/" + item.code + "/title"}
                                         component={Link}
                                         leftSection={<IconFileDescription/>}
                                         label="Title" />
                                <NavLink to={
                                    "proposal/" + item.code + "/summary"}
                                         component={Link}
                                         leftSection={<IconFileDescription/>}
                                         label="Summary" />
                                <NavLink to={
                                    "proposal/" + item.code + "/investigators"}
                                         component={Link}
                                         leftSection={<IconUsersGroup/>}
                                         label="Investigators" />
                                <NavLink to={
                                    "proposal/" + item.code + "/targets"}
                                         component={Link}
                                         leftSection={<IconTarget/>}
                                         label="Targets" />
                                <NavLink to={"proposal/" + item.code + "/goals"}
                                         component={Link}
                                         leftSection={<IconChartLine/>}
                                         label="Technical Goals" />
                                <NavLink to={
                                    "proposal/" + item.code + "/observations"}
                                         component={Link}
                                         leftSection={<IconCamera/>}
                                         label="Observations" />
                                <NavLink to={
                                    "proposal/" + item.code + "/documents"}
                                         component={Link}
                                         leftSection={<IconFiles/>}
                                         label="Documents" />
                            </NavLink>
                        ))}
                    </>
                )}
            </>
        );
    }

    /**
     * produces HTML for filtering proposals.
     *
     * @return {React.ReactElement} the dynamic html for the proposal filter.
     * @constructor
     */
    function ProposalFilter(): ReactElement {
        const result = GetProposalList();

        // if error produced, present error to user.
        if (result.error) {
            return (
                <Box>
                    <pre>{JSON.stringify(result.error, null, 2)}</pre>
                </Box>
            );
        }

        // acquire the state setters for proposal title and investigator name.
        const [proposalTitle, setProposalTitle] = useHistoryState(
            "proposalTitle", "");
        const [investigatorName, setInvestigatorName] = useHistoryState(
            "investigatorName", "");

        // generate the html.
        return (
            <>
                <div>
                <Text fz="sm">
                    Filter existing proposals by:
                </Text>
                <TextInput label="Title"
                           value={proposalTitle}
                           onChange={(e: { target: { value: string; }; }) =>
                               setProposalTitle(e.target.value)} />
                <TextInput label="Investigator name"
                           value={investigatorName}
                           onChange={(e: { target: { value: string; }; }) =>
                               setInvestigatorName(e.target.value)} />
                </div>
            </>
        )
    }
}

// export the main app.
export default App2
