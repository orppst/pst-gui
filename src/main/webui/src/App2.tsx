import React, {useState, createContext, useEffect} from 'react';
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {
    fetchPersonResourceGetPeople, fetchPersonResourceGetPerson,
    useProposalResourceGetProposals
} from './generated/proposalToolComponents'
import {Person} from "./generated/proposalToolSchemas";
import 'bootstrap/dist/css/bootstrap.css';
import TitlePanel from './proposal/Title';
import TargetPanel from './proposal/Targets';
import OverviewPanel from "./proposal/Overview";
import NewProposalPanel from './proposal/New';
import SummaryPanel from "./proposal/Summary";
import InvestigatorsPanel from "./Investigators/List";
import AddInvestigatorPanel from "./Investigators/New";
import {BrowserRouter, NavLink, Route, Routes} from "react-router-dom";
import { useHistoryState } from "./useHistoryState";
import GoalsPanel from "./proposal/Goals";
import ObservationsPanel from "./observations/List";
import NewObservationPanel from "./observations/New";
import DocumentsPanel from "./proposal/Documents";

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient()

//TODO: Put context definitions and formReducer in separate file
export type AppContextType = {
    user: Person;
    selectedProposal: number;
    setSelectedProposal: any ;
}
export const UserContext = createContext<AppContextType>({
    selectedProposal: 0,
    setSelectedProposal: undefined,
    user: {}
});

export function formReducer(state: any, event : React.SyntheticEvent) {
    return {
        ...state,
        [event.name]: event.value
    }
}

function App2() {
    const blankUser : Person = {fullName: "Loading..."};
    const [user, setUser] = useHistoryState("user", blankUser);
    const [selectedProposal, setSelectedProposal] = useHistoryState("selectedProposal", 0);
    const values = {user, selectedProposal, setSelectedProposal, queryClient};

    useEffect(() => {
           fetchPersonResourceGetPeople({queryParams: {name: "PI"}})
               .then((data) =>
                   fetchPersonResourceGetPerson({ pathParams: {id: data[0].dbid} }).then((data) => setUser(data))
               )
               .catch(console.log)

       },[]);

  return (
    <BrowserRouter>
        <UserContext.Provider value={values}>
            <QueryClientProvider client={queryClient}>
                <nav className={"navbar navbar-inverse"}>
                    <div className={"container-fluid"}>
                        <div className={"navbar-header"}>
                            <span className={"navbar-brand"} >Proposals for {user.fullName}</span>
                        </div>
                        <ul className={"nav navbar-nav"}>
                            <li>
                                <ul className={"nav navbar-nav"}>
                                    <li>
                                        <NavLink to={"/pst/app/proposal/new"} className={({ isActive, isPending }) =>
                                            isPending ? "pending" : isActive ? "active" : ""}>Create New</NavLink>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                        <ul className={"nav navbar-nav navbar-right"}>
                            <li><a href="#"><span className={"glyphicon glyphicon-user"}></span> Account</a></li>
                            <li><a href="#"><span className={"glyphicon glyphicon-log-out"}></span> Logout</a></li>
                        </ul>
                    </div>
                </nav>
                <div className={"row"}>
                    <div id={"sidebar"} className={"col-lg-2 col-md-2 col-sm-3 col-xs-4 well well-lg"}>

                        <div>Search and filter by</div>
                        <Proposals/>
                    </div>
                    <div className={"col-lg-9 col-md-9 col-sm-8 col-xs-7"}>
                    <PanelRouter />
                    </div>
                </div>
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </UserContext.Provider>
    </BrowserRouter>
  );

    function PanelRouter() {
        return (
            <Routes>
                <Route path={"/pst/app/proposal/new"} element={<NewProposalPanel />} />
                <Route path={"/pst/app/proposal/:id"} element={<OverviewPanel />} />
                <Route path={"/pst/app/proposal/:id/title"} element={<TitlePanel />} />
                <Route path={"/pst/app/proposal/:id/summary"} element={<SummaryPanel />} />
                <Route path={"/pst/app/proposal/:id/investigators"} element={<InvestigatorsPanel />} />
                <Route path={"/pst/app/proposal/:id/investigators/new"} element={<AddInvestigatorPanel />} />
                <Route path={"/pst/app/proposal/:id/targets"} element={<TargetPanel />} />
                <Route path={"/pst/app/proposal/:id/goals"} element={<GoalsPanel />} />
                <Route path={"/pst/app/proposal/:id/observations"} element={<ObservationsPanel />} />
                <Route path={"/pst/app/proposal/:id/observations/new"} element={<NewObservationPanel />} />
                <Route path={"/pst/app/proposal/:id/documents"} element={<DocumentsPanel />} />
                <Route path={"*"} element={<div>Please select or create a proposal</div>} />
            </Routes>
        )
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
                        <li key={item.code} onClick={()=>{setSelectedProposal(item.code)}}>{item.title}{selectedProposal===item.code && ChildList(item.code)}</li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }

    function ChildList() {
        return (
            <ul>
                <li><NavLink to={"/pst/app/proposal/" + selectedProposal} className={({ isActive, isPending }) =>
                    isPending ? "pending" : isActive ? "active" : ""}>Overview</NavLink></li>
                <li><NavLink to={"/pst/app/proposal/" + selectedProposal + "/title"} className={({ isActive, isPending }) =>
                    isPending ? "pending" : isActive ? "active" : ""}>Title</NavLink></li>
                <li><NavLink to={"/pst/app/proposal/" + selectedProposal + "/summary"} className={({ isActive, isPending }) =>
                    isPending ? "pending" : isActive ? "active" : ""}>Summary</NavLink></li>
                <li><NavLink to={"/pst/app/proposal/" + selectedProposal + "/investigators"} className={({ isActive, isPending }) =>
                    isPending ? "pending" : isActive ? "active" : ""}>Investigators</NavLink></li>
                <li><NavLink to={"/pst/app/proposal/" + selectedProposal + "/targets"} className={({ isActive, isPending }) =>
                    isPending ? "pending" : isActive ? "active" : ""}>Targets</NavLink></li>
                <li><NavLink to={"/pst/app/proposal/" + selectedProposal + "/goals"} className={({ isActive, isPending }) =>
                    isPending ? "pending" : isActive ? "active" : ""}>Technical Goals</NavLink></li>
                <li><NavLink to={"/pst/app/proposal/" + selectedProposal + "/observations"} className={({ isActive, isPending }) =>
                    isPending ? "pending" : isActive ? "active" : ""}>Observations</NavLink></li>
                <li><NavLink to={"/pst/app/proposal/" + selectedProposal + "/documents"} className={({ isActive, isPending }) =>
                    isPending ? "pending" : isActive ? "active" : ""}>Documents</NavLink></li>
            </ul>
        );
    }

}

export default App2
