import React, {useState, createContext, useEffect} from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
//import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
    fetchPersonResourceGetPeople, fetchPersonResourceGetPerson,
    useProposalResourceGetProposals
} from './generated/proposalToolComponents'
import {Person} from "./generated/proposalToolSchemas";
//import './App.css'
import 'bootstrap/dist/css/bootstrap.css';
import TitlePanel from './proposal/Title';
import TargetPanel from './proposal/Targets';
import SummaryPanel from "./proposal/Summary";
import NewProposalPanel from './proposal/New';
import InvestigatorsPanel from "./Investigators/List";
import AddInvestigatorPanel from "./Investigators/New";

const queryClient = new QueryClient()

//TODO: Put context definitions in separate file
export type AppContextType = {
    user: Person;
    selectedProposal: number;
    setSelectedProposal: React.SetStateAction<number> ;
    setNavPanel: React.SetStateAction<string>;
}
export const UserContext = createContext<AppContextType|null>(null);

function App2() {
    const blankUser : Person = {fullName: "Loading..."};
    const [user, setUser] = useState(blankUser);
    const [selectedProposal, setSelectedProposal] = useState(0);
    const [navPanel, setNavPanel] = useState("welcome");
    const values = {user, selectedProposal, setSelectedProposal, setNavPanel};

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
    <>
    <UserContext.Provider value={values}>
        <QueryClientProvider client={queryClient}>
            <nav className={"navbar navbar-inverse"}>
                <div className={"container-fluid"}>
                    <div className={"navbar-header"}>
                        <a className={"navbar-brand"} href="#">Proposals for {user.fullName}</a>
                    </div>
                    <ul className={"nav navbar-nav"}>
                        <li className={"active"}><a href="#">Home</a></li>
                    </ul>
                    <ul className={"nav navbar-nav navbar-right"}>
                        <li><a href="#"><span className={"glyphicon glyphicon-user"}></span> Account</a></li>
                        <li><a href="#"><span className={"glyphicon glyphicon-log-out"}></span> Logout</a></li>
                    </ul>
                </div>
            </nav>
            <div className={"row"}>
                <div id={"sidebar"} className={"col-lg-2 col-md-2 col-sm-3 col-xs-4"}>
                    <button onClick={createNew} className={"btn"}>
                        Create New Proposal
                    </button>
                        Search and filter your proposals
                    <Proposals/>
                </div>
                <div className={"col-lg-9 col-md-9 col-sm-8 col-xs-7"}>
                    {navPanel==='welcome' && !selectedProposal && (<div>Please select or create a proposal</div>)}
                    {navPanel==='pleaseSelect' && (<div>Please select an action</div>)}
                    {navPanel==='summary' && (<SummaryPanel />)}
                    {navPanel==='investigators' && (<InvestigatorsPanel />)}
                    {navPanel==='newInvestigator' && (<AddInvestigatorPanel />)}
                    {navPanel==='targets' && (<TargetPanel />)}
                    {navPanel==='title' && (<TitlePanel />)}
                    {navPanel==='newProposal' && (<NewProposalPanel />)}
                </div>
            </div>
        </QueryClientProvider>
    </UserContext.Provider>
    </>
  );


    function Proposals() {
        const [query, setQuery] = useState("");
        const { data , error, isLoading } = useProposalResourceGetProposals(
            {
                queryParams: { title:  "%" + query + "%" },
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
            <div>
               <input value={query} onChange={(e) => setQuery(e.target.value)} />
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
        return (<ul>
            <li onClick={()=>{setNavPanel('summary'); console.log(navPanel)}}>Summary</li>
            <li onClick={()=>{setNavPanel('title')}}>Title</li>
            <li onClick={()=>{setNavPanel('investigators')}}>Investigators</li>
            <li onClick={()=>{setNavPanel('targets')}}>Targets</li>
            </ul>
        );
    }

}

export default App2
