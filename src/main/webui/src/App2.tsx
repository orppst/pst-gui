import {createContext, useEffect, SyntheticEvent, useState} from 'react';
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {
    fetchPersonResourceGetPeople, fetchPersonResourceGetPerson,
    useProposalResourceGetProposals
} from './generated/proposalToolComponents'
import { Person} from "./generated/proposalToolSchemas";
//import '../scss/styles.scss'
import 'bootstrap/dist/css/bootstrap.css';
import TitlePanel from './proposal/Title';
import TargetPanel from './proposal/Targets';
import OverviewPanel from "./proposal/Overview";
import NewProposalPanel from './proposal/New';
import SummaryPanel from "./proposal/Summary";
import InvestigatorsPanel from "./Investigators/List";
import AddInvestigatorPanel from "./Investigators/New";
import {createBrowserRouter, NavLink, Outlet, Route, RouterProvider, Routes} from "react-router-dom";
import { useHistoryState } from "./useHistoryState";
import GoalsPanel from "./proposal/Goals";
import ObservationsPanel from "./observations/List";
import NewObservationPanel from "./observations/New";
import DocumentsPanel from "./proposal/Documents";

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {AuthProvider} from "./auth/Auth.tsx";

const queryClient = new QueryClient()

export type UserContextType = {
    user: Person;
    token: string;
}

export type ProposalContextType = {
    selectedProposalCode: number;
}

export const ProposalContext = createContext<UserContextType & ProposalContextType>({
    user: {},
    token:"",
    selectedProposalCode: 0,
})


function App2() {
    const blankUser : Person = {fullName: "Loading..."};
    const [user, setUser] = useHistoryState("user", blankUser);
    const [historyProposalCode, setSelectedProposalInHistory] = useHistoryState("selectedProposal", 0);

    const [selectedProposalCode, setProposalSelectedCode] = useState(historyProposalCode)
    const values = {user, selectedProposalCode };

    useEffect(() => {
           fetchPersonResourceGetPeople({queryParams: {name: "PI"}})
               .then((data) =>
                   fetchPersonResourceGetPerson({ pathParams: {id: data[0].dbid!} }).then((data) => setUser(data))
               )
               .catch(console.log)

       },[]);



    const router = createBrowserRouter(
        [
            {path: "/", element: <PSTRoot/>,
                children: [
                    {index: true, element: <PSTStart/>} ,
                    { path: "proposal/new", element: <NewProposalPanel setProposalSelectedCode={setProposalSelectedCode}/>},
                    { path: "proposal/:id", element: <OverviewPanel />},
                    { path: "proposal/:id/title",element: <TitlePanel />} ,
                    { path: "proposal/:id/summary",  element: <SummaryPanel />} ,
                    { path: "proposal/:id/investigators",  element:<InvestigatorsPanel />} ,
                    { path: "proposal/:id/investigators/new",  element:<AddInvestigatorPanel />} ,
                    { path: "proposal/:id/targets",  element:<TargetPanel />} ,
                    { path: "proposal/:id/goals",  element:<GoalsPanel />} ,
                    { path: "proposal/:id/observations",  element:<ObservationsPanel />} ,
                    { path: "proposal/:id/observations/new",  element:<NewObservationPanel />} ,
                    { path: "proposal/:id/documents",  element:<DocumentsPanel />} ,
                ]}], {
            basename: "/pst/gui/tool/"
        }

    )

  return (
      <AuthProvider>
        <ProposalContext.Provider value={values}>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router}/>
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </ProposalContext.Provider>
      </AuthProvider>
);

    function PSTRoot() {
        return (
            <>
            <nav className={"navbar navbar-inverse"}>
                <div className={"container-fluid"}>
                    <div className={"navbar-header"}>
                        <span className={"navbar-brand"} >
                            <NavLink to={"/"}>Proposals for {user.fullName}</NavLink>
                        </span>
                    </div>
                    <ul className={"nav navbar-nav"}>
                        <li>
                            <ul className={"nav navbar-nav"}>
                                <li>
                                    <NavLink to={"proposal/new"} className={({ isActive, isPending }) =>
                                        isPending ? "pending" : isActive ? "active" : ""}>Create New</NavLink>
                                </li>
                            </ul>
                        </li>
                    </ul>
                    <ul className={"nav navbar-nav navbar-right"}>
                        <li><a href="#"><span className={"glyphicon glyphicon-user"}></span> Account</a></li>
                        <li><a href="/pst/gui/logout"><span className={"glyphicon glyphicon-log-out"}></span> Logout</a></li>
                    </ul>
                </div>
            </nav>
        <div className={"row"}>
            <div id={"sidebar"} className={"col-lg-2 col-md-2 col-sm-3 col-xs-4 well well-lg"}>

                <div>Search and filter by</div>
                <Proposals/>
            </div>
            <div className={"col-lg-9 col-md-9 col-sm-8 col-xs-7"}>
                <Outlet/>
            </div>
        </div>
            </>
        )
    }

    function PSTStart() {
        return (<div>Welcome</div>);
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
                <div>
                    <pre>{JSON.stringify(error, null, 2)}</pre>
                </div>
            );
        }

        return (
            <div className={"form-group"}>
                <label>Title</label>
                <input className={"form-control"} value={proposalTitle} onChange={(e) => setProposalTitle(e.target.value)} />
                <label>Investigator name</label>
                <input className={"form-control"} value={investigatorName} onChange={(e) => setInvestigatorName(e.target.value)} />
                {isLoading ? (
                    <div className={""}>Loading…</div>
                ) : (
                    <ul className={""}>
                        {data?.map((item) => (
                        <li key={item.code} onClick={()=>{setProposalSelectedCode(item.code!)}}>{item.title}{selectedProposalCode===item.code && ChildList()}</li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }

    function ChildList() {
        return (
            <ul>
                <li><NavLink to={"proposal/" + selectedProposalCode} className={({ isActive, isPending }) =>
                    isPending ? "pending" : isActive ? "active" : ""}>Overview</NavLink></li>
                <li><NavLink to={"proposal/" + selectedProposalCode + "/title"} className={({ isActive, isPending }) =>
                    isPending ? "pending" : isActive ? "active" : ""}>Title</NavLink></li>
                <li><NavLink to={"proposal/" + selectedProposalCode + "/summary"} className={({ isActive, isPending }) =>
                    isPending ? "pending" : isActive ? "active" : ""}>Summary</NavLink></li>
                <li><NavLink to={"proposal/" + selectedProposalCode + "/investigators"} className={({ isActive, isPending }) =>
                    isPending ? "pending" : isActive ? "active" : ""}>Investigators</NavLink></li>
                <li><NavLink to={"proposal/" + selectedProposalCode + "/targets"} className={({ isActive, isPending }) =>
                    isPending ? "pending" : isActive ? "active" : ""}>Targets</NavLink></li>
                <li><NavLink to={"proposal/" + selectedProposalCode + "/goals"} className={({ isActive, isPending }) =>
                    isPending ? "pending" : isActive ? "active" : ""}>Technical Goals</NavLink></li>
                <li><NavLink to={"proposal/" + selectedProposalCode + "/observations"} className={({ isActive, isPending }) =>
                    isPending ? "pending" : isActive ? "active" : ""}>Observations</NavLink></li>
                <li><NavLink to={"proposal/" + selectedProposalCode + "/documents"} className={({ isActive, isPending }) =>
                    isPending ? "pending" : isActive ? "active" : ""}>Documents</NavLink></li>
            </ul>
        );
    }

}

export default App2
