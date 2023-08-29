import {ReactNode, useEffect, useState} from "react";
import {Person, SubjectMap} from "../generated/proposalToolSchemas.ts";
import {ProposalContext} from "../App2.tsx";
import {setFetcherApiURL} from "../generated/proposalToolFetcher.ts";

export type AuthMapping = {
    subjectMap:SubjectMap;
    token: string;
    expiry: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {

    const [token,setToken] = useState<string>("")//TODO what to do if token bad....
    const [loggedOn, setLoggedOn] = useState(false);
    const [user, setUser] = useState({fullName:"Unknown"} as Person)
    const [apiURL, setApiURL] = useState<string>("")
    async function getUser() {
        const apiResponse = await window.fetch("/pst/gui/api-info")
        const localbaseUrl = await apiResponse.text()
        setFetcherApiURL(localbaseUrl)
        setApiURL(localbaseUrl)

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
            setToken(s.token)
            const expiry = new Date(s.expiry)
            setTimeout(() =>{
                //attempting to force access token refresh -ac cess tokens are short lived (5m)  and even if the user is active in the GUI (because SPA), unless this is forced the token as known to JS will become stale
                // TODO - this might mean that an "inactive" user never gets logged out - need to investigate a way to limit this  - perhaps a last used timestamp that is updated by any api calls
                //This is still basically done by server side refresh - following the https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps-14#name-token-mediating-backend architecture
                // The server side settings are https://quarkus.io/guides/security-oidc-code-flow-authentication#handling-and-controlling-the-lifetime-of-authentication
                // quarkus.oidc.token.refresh-token-time-skew=60
                // quarkus.oidc.token.refresh-expired=true
                // which means that quarkus will attempt to refresh 60s before actual expiry - we need that as we cannot have a redirect happen
                // for the javascript fetch because of CORS so we nake the call 10s before expiry.

                console.log("access token about to expire - forcing re-fetch "+ new Date(Date.now()).toISOString());
                setLoggedOn(false);

            }, expiry.getTime()-Date.now() -10000)

            if(s.subjectMap.person) {
                setUser(s.subjectMap.person)
            }
            else {
                //what to do it the person is not properly registered?
                console.error("authenticated person is not registered with database")
            }
        })
            .catch(console.log);
    }, [token, loggedOn])
    return (
        <ProposalContext.Provider value={{user:user, token:token, selectedProposalCode:0, apiUrl:apiURL}}>
            {loggedOn ? (
           <>
               {children}
           </>
                ) : (
                    <>
                    <div>Need to Authenticate..</div>
                    </>
            )
            }
        </ProposalContext.Provider>

    );
}