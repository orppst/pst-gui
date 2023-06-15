import {useState, createContext, useContext, useEffect} from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { confirmAlert } from 'react-confirm-alert';
//import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
    fetchPersonResourceGetPeople, fetchPersonResourceGetPerson,
    useProposalResourceGetProposals
} from './generated/proposalToolComponents'
import './App.css'
import 'react-confirm-alert/src/react-confirm-alert.css';
import TitlePanel from './proposal/Title';
import NewProposalPanel from './proposal/New';

const queryClient = new QueryClient()

export const UserContext = createContext();


function App2() {
    const [user, setUser] = useState({"_id":"0", fullName: "Loading..."});
    const [selectedProposal, setSelectedProposal] = useState(0);
    const [navPanel, setNavPanel] = useState("welcome");
    const [selectedTitle, setSelectedTitle] = useState("");
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
            <nav className="nav-bar">{`Proposals for `}
                {`${user.fullName}`}
            </nav>
            <div className="flex-container">
                <div className="nav-bar">
                    <button className="nav-button" onClick={createNew}>
                        Create New Proposal
                    </button>
                        <br/>
                        Search and filter your proposals
                    <Proposals/>
                </div>
                <div className="main-forms">
                    {navPanel==='welcome' && !selectedProposal && (<div>Please select or create a proposal</div>)}
                    {navPanel==='pleaseSelect' && (<div>Please select an action</div>)}
                    {navPanel==='summary' && (<div>This is where the summary will go</div>)}
                    {navPanel==='investigators' && (<div>This is where you will be able to edit the list of investigators</div>)}
                    {navPanel==='targets' && (<div>Coming soon!</div>)}
                    {navPanel==='title' && (<TitlePanel />)}
                    {navPanel==='newProposal' && (<NewProposalPanel />)}
                </div>
            </div>
        </QueryClientProvider>
    </UserContext.Provider>
    </>
  );


    function Proposals() {
        const [query, setQuery] = useState("PI");
        const { data , error, isLoading } = useProposalResourceGetProposals(
            {
                queryParams: { investigatorName: '%' + query + '%'},
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
                    <div>Loading…</div>
                ) : (
                    <ul>
                        {data?.map((item) => (
                            <li key={item.code} onClick={(e) => {setSelectedProposal(item.code)}}>{item.title} {selectedProposal===item.code && ChildList(item.code)}</li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }

    function ChildList() {
        return (<ul>
            <li onClick={(e)=>{setNavPanel('summary'); console.log(navPanel)}}>Summary</li>
            <li onClick={(e)=>{setNavPanel('title')}}>Title</li>
            <li onClick={(e)=>{setNavPanel('investigators')}}>Investigators</li>
            <li onClick={(e)=>{setNavPanel('targets')}}>Targets</li>
            </ul>
        );
    }

}

export default App2
