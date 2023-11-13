import { createContext, useState, useContext, ReactElement } from 'react';
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {
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
import {createBrowserRouter, Link, Outlet, RouterProvider} from "react-router-dom";
import { useHistoryState } from "./useHistoryState";
import TechnicalGoalsPanel from "./technicalGoals/technicalGoalsPanel.tsx";
import ObservationsPanel from "./observations/observationPanel.tsx";
import DocumentsPanel from "./proposal/Documents";

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {AuthProvider} from "./auth/Auth.tsx";
import {
    AppShell,
    Button,
    NavLink,
    Box,
    Text,
    TextInput,
    Grid,
    Burger,
    ScrollArea,
    Group,
    ActionIcon,
    Tooltip
} from "@mantine/core";
import {SwitchToggle} from "./ColourSchemeToggle.tsx";
import {IconChevronRight, IconLogout, IconPlus} from "@tabler/icons-react";
import {useDisclosure} from "@mantine/hooks";
import {
    APP_HEADER_HEIGHT, CLOSE_DELAY, GRAY, ICON_SIZE, JSON_SPACES,
    NAV_BAR_DEFAULT_WIDTH, NAV_BAR_LARGE_WIDTH,
    NAV_BAR_MEDIUM_WIDTH, OPEN_DELAY, STROKE
} from './constants.tsx';


const queryClient = new QueryClient()

export type UserContextType = {
    user: Person;
    token: string;
}

export type ProposalContextType = {
    selectedProposalCode: number;
    apiUrl: string;
}

export const ProposalContext = createContext<
    UserContextType & ProposalContextType>({
        user: {},
        token:"",
        selectedProposalCode: 0,
        apiUrl:"http://api" // obviously false as a placeholder
    })

export const useToken = () => {
    const { token } = useContext(ProposalContext);
    return token;
};

export const useApiUrl = () => {
    const { apiUrl } = useContext(ProposalContext);
    return apiUrl;
};


function App2() {
    const historyProposalCode= 0;

    const [selectedProposalCode] = useState(historyProposalCode)

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

    function PSTRoot() {
        const {user, token, apiUrl} = useContext(ProposalContext);
        const [opened, {toggle}] = useDisclosure();

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
                                    <Button
                                        variant="light"
                                        component={Link}
                                        to={"/"}
                                        onClick={opened && toggle}
                                    >
                                        Proposals for {user.fullName}
                                    </Button>
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

                    <AppShell.Navbar p="md">
                        <AppShell.Section grow component={ScrollArea}>
                            <Text fz={"sm"}>Create a new proposal</Text>
                            <Group justify={"center"} mb={"5%"}>
                                <Tooltip label={"new proposal"}
                                         position={"left"}
                                         openDelay={OPEN_DELAY}
                                         closeDelay={CLOSE_DELAY}>
                                    <ActionIcon
                                        color={"green.5"}
                                        variant={"subtle"}
                                        component={Link}
                                        to={"proposal/new"}
                                        onClick={opened && toggle}
                                    >
                                        <IconPlus size={ICON_SIZE}/>
                                    </ActionIcon>
                                </Tooltip>
                            </Group>
                            <Group justify={"center"}>
                                <Text fz={"sm"}>-- OR --</Text>
                            </Group>
                            <Text fz="sm">
                                Filter existing proposals by
                            </Text>
                            <Proposals/>
                        </AppShell.Section>
                    </AppShell.Navbar>
                    <AppShell.Main pr={"sm"}>
                        <Outlet/>
                    </AppShell.Main>
                </AppShell>
            </ProposalContext.Provider>
        )
    }

    function PSTStart() {
        return (<Box><Text fz={"lg"}>Welcome</Text></Box>);
    }

    function Proposals(): ReactElement {
        const [proposalTitle, setProposalTitle] =
            useHistoryState("proposalTitle", "");
        const [investigatorName, setInvestigatorName] =
            useHistoryState("investigatorName", "");
        const { data , error, isLoading } =
            useProposalResourceGetProposals(
                {
                    queryParams: { title:  "%" + proposalTitle + "%",
                        investigatorName: "%" + investigatorName + "%"
                    },
                },
                {
                    enabled: true,
                }
            );

        if (error) {
            return (
                <Box>
                    <pre>{JSON.stringify(error, null, JSON_SPACES)}</pre>
                </Box>
            );
        }

        return (
            <Box>
                <TextInput label="Title"
                           value={proposalTitle}
                           onChange={(e: { target: { value: string; }; }) =>
                               setProposalTitle(e.target.value)} />
                <TextInput label="Investigator name"
                           value={investigatorName}
                           onChange={(e: { target: { value: string; }; }) =>
                               setInvestigatorName(e.target.value)} />
                {isLoading ? (
                    <Box>Loading…</Box>
                ) : (
                    <>
                        {data?.map((item) => (
                            <NavLink key={item.code}
                                     label={item.title}
                                     childrenOffset={30}
                                     rightSection={<IconChevronRight
                                         size="0.8rem"
                                         stroke={STROKE} />}>
                                <NavLink to={"proposal/" + item.code}
                                         component={Link}
                                         label="Overview" />
                                <NavLink to={"proposal/" + item.code + "/title"}
                                         component={Link}
                                         label="Title" />
                                <NavLink to={
                                    "proposal/" + item.code + "/summary"}
                                         component={Link}
                                         label="Summary" />
                                <NavLink to={
                                    "proposal/" + item.code + "/investigators"}
                                         component={Link}
                                         label="Investigators" />
                                <NavLink to={
                                    "proposal/" + item.code + "/targets"}
                                         component={Link}
                                         label="Targets" />
                                <NavLink to={"proposal/" + item.code + "/goals"}
                                         component={Link}
                                         label="Technical Goals" />
                                <NavLink to={
                                    "proposal/" + item.code + "/observations"}
                                         component={Link}
                                         label="Observations" />
                                <NavLink to={
                                    "proposal/" + item.code + "/documents"}
                                         component={Link}
                                         label="Documents" />
                            </NavLink>
                        ))}
                    </>
                )}
            </Box>
        );
    }

}

export default App2
