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
import {
    useProposalResourceGetProposals,
} from './generated/proposalToolComponents'
import { Person} from "./generated/proposalToolSchemas";
import TitlePanel from './proposal/Title';
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
import { TargetPanel } from "./targets/targetPanel.tsx";
import ObservationsPanel from "./observations/observationPanel.tsx";
import DocumentsPanel from "./proposal/Documents";
import SubmitPanel from "./proposal/Submit";

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {AuthProvider} from "./auth/Auth.tsx";
import {
    AppShell,
    NavLink,
    Text,
    TextInput,
    Grid,
    Burger,
    ScrollArea,
    Group,
    ActionIcon,
    Tooltip, useMantineTheme, useMantineColorScheme, FileButton, Container, Accordion
} from '@mantine/core';
import {SwitchToggle} from "./ColourSchemeToggle.tsx";
import {
    IconChartLine,
    IconFileCheck,
    IconFiles, IconLetterS, IconLetterT, IconLicense,
    IconLogout, IconSend, IconTarget, IconTelescope, IconUfo, IconUsersGroup, IconYinYangFilled
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

/**
 * defines the user context type.
 */
export type UserContextType = {
    user: Person;
    getToken: () => string;
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

    //active state for the NavLink sections
    const [active, setActive] = useState("");
    const [accordionValue, setAccordionValue]
        = useState<string | null>(null);

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
        const {user, getToken, apiUrl} = useContext(ProposalContext);
        const [opened, {toggle}] = useDisclosure();
        const navigate = useNavigate();
        // acquire the state setters for proposal title and investigator name.
        const [proposalTitle, setProposalTitle] = useHistoryState(
            "proposalTitle", "");
        const [investigatorName, setInvestigatorName] = useHistoryState(
            "investigatorName", "");
        const result = useProposalResourceGetProposals(
            { queryParams: {
                    title: "%" + proposalTitle + "%",
                    investigatorName: "%" + investigatorName + "%"
                },
            },
            {
                enabled: true,
            });


        /*
            Developer Note: trying to do a nested map of the 'NavLink' elements resulted in an
            "Objects are invalid as React child" exception. Perhaps there is another way of doing
            loop for an array of objects to create the 'NavLink' elements nested in a map but this
            works so... left as an exercise for the reader :)
         */

        const proposalsList =
            result.data?.map((proposal) => {
                return (
                    <Accordion.Item value={String(proposal.code)} key={proposal.code}>
                        <Accordion.Control>
                            <Group>
                                <IconLicense/>
                                {proposal.title}
                            </Group>
                        </Accordion.Control>
                        <Accordion.Panel>
                            <NavLink to={"proposal/" + proposal.code}
                                     component={Link}
                                     label="Overview"
                                     leftSection={<IconUfo/>}
                                     active={"Overview" + proposal.code === active}
                                     onClick={()=>setActive("Overview" + proposal.code)}
                            />
                            <NavLink to={"proposal/" + proposal.code + "/title"}
                                     component={Link}
                                     leftSection={<IconLetterT/>}
                                     label="Title"
                                     active={"Title" + proposal.code === active}
                                     onClick={()=>setActive("Title" + proposal.code)}
                            />
                            <NavLink to={
                                "proposal/" + proposal.code + "/summary"}
                                     component={Link}
                                     leftSection={<IconLetterS/>}
                                     label="Summary"
                                     active={"Summary" + proposal.code === active}
                                     onClick={()=>setActive("Summary" + proposal.code)}
                            />
                            <NavLink to={
                                "proposal/" + proposal.code + "/investigators"}
                                     component={Link}
                                     leftSection={<IconUsersGroup/>}
                                     label="Investigators"
                                     active={"Investigators" + proposal.code === active}
                                     onClick={()=>setActive("Investigators" + proposal.code)}
                            />
                            <NavLink to={"proposal/" + proposal.code + "/justifications"}
                                     component={Link}
                                     leftSection={<IconFileCheck/>}
                                     label="Justifications"
                                     active={"Justifications" + proposal.code === active}
                                     onClick={()=>setActive("Justifications" + proposal.code)}
                            />
                            <NavLink to={
                                "proposal/" + proposal.code + "/targets"}
                                     component={Link}
                                     leftSection={<IconTarget/>}
                                     label="Targets"
                                     active={"Targets" + proposal.code === active}
                                     onClick={()=>setActive("Targets" + proposal.code)}
                            />
                            <NavLink to={"proposal/" + proposal.code + "/goals"}
                                     component={Link}
                                     leftSection={<IconChartLine/>}
                                     label="Technical Goals"
                                     active={"Technical Goals" + proposal.code === active}
                                     onClick={()=>setActive("Technical Goals" + proposal.code)}
                            />
                            <NavLink to={
                                "proposal/" + proposal.code + "/observations"}
                                     component={Link}
                                     leftSection={<IconTelescope/>}
                                     label="Observations"
                                     active={"Observations" + proposal.code === active}
                                     onClick={()=>setActive("Observations" + proposal.code)}
                            />
                            <NavLink to={
                                "proposal/" + proposal.code + "/documents"}
                                     component={Link}
                                     leftSection={<IconFiles/>}
                                     label="Documents"
                                     active={"Documents" + proposal.code === active}
                                     onClick={()=>setActive("Documents" + proposal.code)}
                            />
                            <NavLink to={
                                "proposal/" + proposal.code + "/submit"}
                                     component={Link}
                                     leftSection={<IconSend/>}
                                     label="Submit"
                                     active={"Submit" + proposal.code === active}
                                     onClick={()=>setActive("Submit" + proposal.code)}
                            />
                        </Accordion.Panel>
                    </Accordion.Item>
                )
            });


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
                value={{selectedProposalCode, user, getToken, apiUrl}}>
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
                                    <Tooltip label={"Admin page"}
                                             openDelay={OPEN_DELAY}
                                             closeDelay={CLOSE_DELAY}
                                    >
                                        <ActionIcon color={"blue.7"}
                                                    variant={"outline"}
                                                    onClick={handleAdminPage}
                                        >
                                            <IconYinYangFilled size={ICON_SIZE}/>
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
                                           value={proposalTitle}
                                           onChange={(e: { target: { value: string; }; }) =>
                                               setProposalTitle(e.target.value)}
                                />
                                <TextInput label="Investigator name"
                                           value={investigatorName}
                                           onChange={(e: { target: { value: string; }; }) =>
                                               setInvestigatorName(e.target.value)}
                                           pb={"md"}
                                />
                            </Container>
                        </AppShell.Section>
                        <AppShell.Section component={ScrollArea}>
                            <Accordion
                                value={accordionValue}
                                onChange={setAccordionValue}
                                variant={"filled"}
                            >
                                {proposalsList}
                            </Accordion>
                        </AppShell.Section>
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
