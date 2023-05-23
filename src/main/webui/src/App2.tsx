import React from 'react';
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
//import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {useGetProposals} from './generated/proposalToolComponents'
import './App.css'
import {ObjectIdentifier} from "./generated/proposalToolSchemas";

const queryClient = new QueryClient()

function App2() {
  return (
    <>
      <h1>Proposals</h1>
      <div >
          <QueryClientProvider client={queryClient}>
             <Proposals/>
          </QueryClientProvider>

      </div>

    </>
  );

    function Proposals() {
        const [query, setQuery] = useState("%");
        const { data , error, isLoading } = useGetProposals(
            {
                queryParams: { title: query },
            },
            {
                enabled: Boolean(query),
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
