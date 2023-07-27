import {createContext, ReactNode, useContext, useEffect, useReducer, useState} from "react";
import {Person, SubjectMap} from "../generated/proposalToolSchemas.ts";
import {ProposalContext} from "../App2.tsx";

export type AuthMapping = SubjectMap

export function AuthProvider({ children }: { children: ReactNode }) {

    const [token,setToken] = useState<string>("")//TODO what to do if token bad....
    const [loggedOn, setLoggedOn] = useState(false);
    const [user, setUser] = useState({fullName:"Unknown"} as Person)
    async function getUser() {
        const response = await window.fetch("/pst/gui/aai/"); //IMPL would be nice to have this URL parameterized
        let error;
        if (response.ok) {
            setLoggedOn(true);
            return await response.json() as AuthMapping
        } else {
            console.log("authentication failed");

            for (const entry of response.headers.entries()) {
                console.log('header ' + entry[0] + "=" + entry[1]);
            }

            try {
                error = await response.json();
            } catch (e) {
                error = {
                    status: "unknown" as const,
                    payload:
                        e instanceof Error
                            ? `Unexpected error (${e.message})`
                            : "Unexpected error",
                };
            }

            throw error;
        }

    }

    useEffect( () => {
        const resp = getUser();
        console.log("trying authentication");
        resp.then((s) => {
            if(s.person) {
                setUser(s.person)
            }
            else {
                //what to do it the person is not properly registerd?
                console.error("authenticated person is not registered with database")
            }
        })
            .catch(console.log);
    }, [token, loggedOn])

    return (
        <ProposalContext.Provider value={{user:user, token:token, selectedProposalCode:0}}>
            {loggedOn ? (
           <>
               {children}
           </>
                ) : (
                    <>
                    <div>Need to Authenticate...</div>
                    </>
            )
            }
        </ProposalContext.Provider>

    );
}