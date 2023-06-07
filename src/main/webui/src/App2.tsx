import {useState, createContext, useContext} from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { confirmAlert } from 'react-confirm-alert';
//import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {useProposalResourceGetProposals} from './generated/proposalToolComponents'
import './App.css'
import 'react-confirm-alert/src/react-confirm-alert.css';
import TestPanel from './proposal/test';

const queryClient = new QueryClient()

export const UserContext = createContext();

function App2() {
    const [user, setUser] = useState("PI");
    const comingSoon = () => {
        setUser("ComingSoon!");
        const options = {
            title: 'Create new proposal',
            message: 'Coming soon! ',
            buttons: [
                {
                    label: 'Ok'
                }
            ],
            closeOnEscape: true,
            overlayClassName: "overlay-custom-class-name",
        };

        confirmAlert(options);
    }

  return (
    <>
    <UserContext.Provider value={user}>
      <nav className="nav-bar">{`Proposals for `}
          {`${user}`}
      </nav>
      <div className="flex-container">
        <div className="nav-bar">
            <button className="button" onClick={comingSoon}>
                Create New Proposal
            </button>
            <br/>
            <QueryClientProvider client={queryClient}>
                Search and filter your proposals
                <Proposals/>
            </QueryClientProvider>
        </div>
        <div className="main-forms">
            <TestPanel />
        </div>
      </div>
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
                            <li key={item.code}>{item.title}</li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }

}

export default App2
