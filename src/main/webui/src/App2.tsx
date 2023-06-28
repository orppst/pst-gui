import React, {useState, createContext, useEffect} from 'react';
import {QueryClient, QueryClientProvider, QueryClientProviderProps} from "@tanstack/react-query";
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
import {BrowserRouter, Link, Route, Routes} from "react-router-dom";
import { useHistoryState } from "./useHistoryState";

const queryClient = new QueryClient()

//TODO: Put context definitions in separate file
export type AppContextType = {
    user: Person;
    selectedProposal: number;
    setSelectedProposal: React.SetStateAction<number> ;
    setNavPanel: React.SetStateAction<string>;
    queryClient: QueryClient;
}
export const UserContext = createContext<AppContextType|null>(null);

function App2() {
    const blankUser : Person = {fullName: "Loading..."};
    const [user, setUser] = useHistoryState("user", blankUser);
    const [selectedProposal, setSelectedProposal] = useHistoryState("selectedProposal", 0);
    const [navPanel, setNavPanel] = useState("welcome");
    const values = {user, selectedProposal, setSelectedProposal, setNavPanel, queryClient};

    useEffect(() => {
           fetchPersonResourceGetPeople({queryParams: {name: "PI"}})
               .then((data) =>
                   fetchPersonResourceGetPerson({ pathParams: {id: data[0].dbid} }).then((data) => setUser(data))
               )
               .catch(console.log)

       },[]);

    const createNew = () => {
        setSelectedProposal(0);
        setNavPanel("newProposal");
    }

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
                                        <Link to={"/pst/app/newproposal"}>Create New</Link>
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
            </QueryClientProvider>
        </UserContext.Provider>
    </BrowserRouter>
  );

    function PanelRouter() {
        return (
            <Routes>
                <Route path={"/pst/app/newproposal"} element={<NewProposalPanel />} />
                <Route path={"/pst/app/overview"} element={<OverviewPanel />} />
                <Route path={"/pst/app/title"} element={<TitlePanel />} />
                <Route path={"/pst/app/summary"} element={<SummaryPanel />} />
                <Route path={"/pst/app/investigators"} element={<InvestigatorsPanel />} />
                <Route path={"/pst/app/newinvestigator"} element={<AddInvestigatorPanel />} />
                <Route path={"/pst/app/targets"} element={<TargetPanel />} />
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
                            <li key={item.code} onClick={() => {setSelectedProposal(item.code)}}>{item.title} {selectedProposal===item.code && ChildList(item.code)}</li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }

    function ChildList() {
        return (
            <ul>
                <li><Link to={"/pst/app/overview"}>Overview</Link></li>
                <li><Link to={"/pst/app/title"}>Title</Link></li>
                <li><Link to={"/pst/app/summary"}>Summary</Link></li>
                <li><Link to={"/pst/app/investigators"}>Investigators</Link></li>
                <li><Link to={"/pst/app/targets"}>Targets</Link></li>
            </ul>
        );
    }

}

export default App2
