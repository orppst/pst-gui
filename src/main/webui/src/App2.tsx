import {createContext, useEffect, SyntheticEvent, useState} from 'react';
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {
    fetchPersonResourceGetPeople, fetchPersonResourceGetPerson,
    useProposalResourceGetProposals
} from './generated/proposalToolComponents'
import { Person} from "./generated/proposalToolSchemas";
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

export type UserContextType = {
    user: Person;
}

export type ProposalContextType = {
    selectedProposalCode: number;
}

export const ProposalContext = createContext<UserContextType & ProposalContextType>({
    user: {},
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
    function PanelRouter() {
        return (
            <Routes>
                <Route path={"/pst/app/proposal/new"} element={<NewProposalPanel propcodeSetter={setProposalSelectedCode} />} />
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
  return (
    <BrowserRouter>
        <ProposalContext.Provider value={values}>
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
        </ProposalContext.Provider>
    </BrowserRouter>



);


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
                <li><NavLink to={"/pst/app/proposal/" + selectedProposalCode} className={({ isActive, isPending }) =>
                    isPending ? "pending" : isActive ? "active" : ""}>Overview</NavLink></li>
                <li><NavLink to={"/pst/app/proposal/" + selectedProposalCode + "/title"} className={({ isActive, isPending }) =>
                    isPending ? "pending" : isActive ? "active" : ""}>Title</NavLink></li>
                <li><NavLink to={"/pst/app/proposal/" + selectedProposalCode + "/summary"} className={({ isActive, isPending }) =>
                    isPending ? "pending" : isActive ? "active" : ""}>Summary</NavLink></li>
                <li><NavLink to={"/pst/app/proposal/" + selectedProposalCode + "/investigators"} className={({ isActive, isPending }) =>
                    isPending ? "pending" : isActive ? "active" : ""}>Investigators</NavLink></li>
                <li><NavLink to={"/pst/app/proposal/" + selectedProposalCode + "/targets"} className={({ isActive, isPending }) =>
                    isPending ? "pending" : isActive ? "active" : ""}>Targets</NavLink></li>
                <li><NavLink to={"/pst/app/proposal/" + selectedProposalCode + "/goals"} className={({ isActive, isPending }) =>
                    isPending ? "pending" : isActive ? "active" : ""}>Technical Goals</NavLink></li>
                <li><NavLink to={"/pst/app/proposal/" + selectedProposalCode + "/observations"} className={({ isActive, isPending }) =>
                    isPending ? "pending" : isActive ? "active" : ""}>Observations</NavLink></li>
                <li><NavLink to={"/pst/app/proposal/" + selectedProposalCode + "/documents"} className={({ isActive, isPending }) =>
                    isPending ? "pending" : isActive ? "active" : ""}>Documents</NavLink></li>
            </ul>
        );
    }

}

export default App2
