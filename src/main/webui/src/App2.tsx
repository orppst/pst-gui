import React from 'react';
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {confirmAlert} from 'react-confirm-alert';
//import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {useGetProposals} from './generated/proposalToolComponents'
import './App.css'
import {ObjectIdentifier} from "./generated/proposalToolSchemas";

const queryClient = new QueryClient()

function App2() {
    const comingSoon = () => {
        /*const options = {
            title: 'Create new proposal',
            message: 'Coming soon!',
            buttons: [
                {
                    label: 'Ok'
                }
            ],
            closeOnEscape: true,
            closeOnClickOutside: true,
            willUnmount: () => {//do nothing
            },
            afterClose: () => {
                //do nothing
            },
            onClickOutside: () => {
                //do nothing
            },
            onKeypress: () => {
                //do nothing
            },
            onKeypressEscape: () => {
                //do nothing
            }
        };

        confirmAlert(options);*/
    }

  return (
    <>
      <h1>Proposals</h1>
      <div className="flex-container">
          <div className="left-nav">
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
        const { data , error, isLoading } = useGetProposals(
            {
                queryParams: { title: '%' + query + '%'},
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
                            <li key={item.dbid}>{item.name}</li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }

}

export default App2
