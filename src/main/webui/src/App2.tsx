import {createContext, useState, useContext} from 'react';
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
import GoalsPanel from "./proposal/Goals";
import ObservationsPanel from "./observations/List";
import NewObservationPanel from "./observations/New";
import DocumentsPanel from "./proposal/Documents";

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {AuthProvider} from "./auth/Auth.tsx";
import {AppShell, Navbar, Header, Button, NavLink, Box, Text, TextInput, ScrollArea, Grid} from "@mantine/core";
import {SwitchToggle} from "./ColourSchemeToggle.tsx";


const queryClient = new QueryClient()

export type UserContextType = {
    user: Person;
    token: string;
}

export type ProposalContextType = {
    selectedProposalCode: number;
    apiUrl: string;
}

export const ProposalContext = createContext<UserContextType & ProposalContextType>({
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
                    { path: "proposal/new", element: <NewProposalPanel />},
                    { path: "proposal/:selectedProposalCode", element: <OverviewPanel />},
                    { path: "proposal/:selectedProposalCode/title",element: <TitlePanel />} ,
                    { path: "proposal/:selectedProposalCode/summary",  element: <SummaryPanel />} ,
                    { path: "proposal/:selectedProposalCode/investigators",  element:<InvestigatorsPanel />} ,
                    { path: "proposal/:selectedProposalCode/investigators/new",  element:<AddInvestigatorPanel />} ,
                    { path: "proposal/:selectedProposalCode/targets",  element:<TargetPanel />} ,
                    { path: "proposal/:selectedProposalCode/goals",  element:<GoalsPanel />} ,
                    { path: "proposal/:selectedProposalCode/observations",  element:<ObservationsPanel />} ,
                    { path: "proposal/:selectedProposalCode/observations/new",  element:<NewObservationPanel />} ,
                    { path: "proposal/:selectedProposalCode/documents",  element:<DocumentsPanel />} ,
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
        const {user, token, apiUrl} = useContext(ProposalContext)
        return (
            <ProposalContext.Provider value={{selectedProposalCode, user, token, apiUrl}}>
                <AppShell
                    header={<Header height={60} p="xs">
                        <Grid>
                            <Grid.Col span={2}><Button variant="subtle" component={Link} to={"/"}>Proposals for {user.fullName}</Button></Grid.Col>
                            <Grid.Col span={1}><Button component={Link} to={"proposal/new"} >Create New</Button></Grid.Col>
                            <Grid.Col offset={7} span={1}>{SwitchToggle()}</Grid.Col>
                            <Grid.Col span={1}><Button component={Link} target={"/pst/gui/logout"}>Logout</Button></Grid.Col>
                        </Grid>
                    </Header>}
                    navbar={<Navbar width={{ base: 310 }}>
                        <Navbar.Section grow component={ScrollArea} width={{ base: 300 }}>
                            {<Text fz="sm">Search and filter by <Proposals/> </Text>}
                        </Navbar.Section>
                        </Navbar>}
                    >
                    <Outlet/>
                </AppShell>
            </ProposalContext.Provider>
        )
    }

    function PSTStart() {
        return (<Box><Text fz={"lg"}>Welcome</Text></Box>);
    }

    function Proposals() {
        const [proposalTitle, setProposalTitle] = useHistoryState("proposalTitle", "");
        const [investigatorName, setInvestigatorName] = useHistoryState("investigatorName", "");
        const { data , error, isLoading } = useProposalResourceGetProposals(
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
                    <pre>{JSON.stringify(error, null, 2)}</pre>
                </Box>
            );
        }

        return (
            <Box>
                <TextInput label="Title" value={proposalTitle} onChange={(e: { target: { value: string; }; }) => setProposalTitle(e.target.value)} />
                <TextInput label="Investigator name" value={investigatorName} onChange={(e: { target: { value: string; }; }) => setInvestigatorName(e.target.value)} />
                {isLoading ? (
                    <Box>Loading…</Box>
                ) : (
                    <>
                        {data?.map((item) => (
                            <NavLink key={item.code} label={item.title} childrenOffset={30}>
                                <NavLink to={"proposal/" + item.code} component={Link} label="Overview" />
                                <NavLink to={"proposal/" + item.code + "/title"} component={Link}label="Title" />
                                <NavLink to={"proposal/" + item.code + "/summary"} component={Link} label="Summary" />
                                <NavLink to={"proposal/" + item.code + "/investigators"} component={Link} label="Investigators" />
                                <NavLink to={"proposal/" + item.code + "/targets"} component={Link} label="Targets" />
                                <NavLink to={"proposal/" + item.code + "/goals"} component={Link} label="Technical Goals" />
                                <NavLink to={"proposal/" + item.code + "/observations"} component={Link} label="Observations" />
                                <NavLink to={"proposal/" + item.code + "/documents"}  component={Link} label="Documents" />
                            </NavLink>
                        ))}
                    </>
                )}
            </Box>
        );
    }

}

export default App2
