import React from 'react';
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {confirmAlert} from 'react-confirm-alert';
//import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {useProposalResourceGetProposals} from './generated/proposalToolComponents'
import './App.css'
import 'react-confirm-alert/src/react-confirm-alert.css';

const queryClient = new QueryClient()

function App2() {
    const comingSoon = () => {
        const options = {
            title: 'Create new proposal',
            message: 'Coming soon!',
            buttons: [
                {
                    label: 'Ok'
                }
            ],
            closeOnEscape: true,
            closeOnClickOutside: true,
            overlayClassName: "overlay-custom-class-name",
        };

        confirmAlert(options);
    }

  return (
    <>
      <nav className="nav-bar">Proposals</nav>
      <div className="flex-container">
          <div className="nav-bar">
              <button className="button" onClick={comingSoon}>Create New Proposal</button><br/>
          <QueryClientProvider client={queryClient}>
              Search and filter your proposals
             <Proposals/>
          </QueryClientProvider>
          </div>
          <div className="main-forms">
              Selected details go here
          </div>
      </div>

    </>
  );



    function Proposals() {
        const [query, setQuery] = useState("");
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
