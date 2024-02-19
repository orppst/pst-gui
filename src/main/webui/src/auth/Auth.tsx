import {ReactNode, useState, useRef} from "react"
import {Person, SubjectMap} from "../generated/proposalToolSchemas.ts"
import {ProposalContext} from "../App2.tsx"
import {setFetcherApiURL} from "../generated/proposalToolFetcher.ts"
import { Modal, Button } from '@mantine/core'
import { useIdleTimer } from 'react-idle-timer'
import type {PresenceType} from 'react-idle-timer'

export type AuthMapping = {
    subjectMap:SubjectMap;
    token: string;
    expiry: string;
}

// This is still basically done by server side refresh - following the https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps-14#name-token-mediating-backend architecture
// The server side settings are https://quarkus.io/guides/security-oidc-code-flow-authentication#handling-and-controlling-the-lifetime-of-authentication
// quarkus.oidc.token.refresh-token-time-skew=60
// quarkus.oidc.token.refresh-expired=true
// which means that quarkus will attempt to refresh 60s before actual expiry - we need that as we cannot have a redirect happen
// for the javascript fetch because of CORS so we nake the call 10s before expiry.
//

export function AuthProvider({ children }: { children: ReactNode }) {

    const [loggedOn, setLoggedOn] = useState(false)
    const [expiringSoon, setExpiring] = useState(false)

    const expiry = useRef(new Date(Date.now()+600000))
    const user  = useRef({fullName:"Unknown"} as Person)
    const apiURL = useRef("")
    const logoutTimer = useRef<NodeJS.Timeout>()
    const expiryTimer = useRef<NodeJS.Timeout>()
    const token= useRef<string>("")//TODO what to do if token bad....



    const onPresenceChange = (presence:PresenceType) =>{
        console.log("activity change =", presence)
    }


    const idleTimer = useIdleTimer({
        onPresenceChange,
        timeout: 60000,
        throttle: 500
    })
    async function getUser() {
        const apiResponse = await window.fetch("/pst/gui/api-info")
        const localbaseUrl = await apiResponse.text()
        setFetcherApiURL(localbaseUrl)
        apiURL.current=localbaseUrl

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

    function logout() {
        console.log("forcing logout")
        window.location.replace("/pst/gui/logout")
    }
    function redoAuthentication() {

        console.log("trying authentication");
        const resp = getUser();
        resp.then((s) => {
            token.current=s.token
            expiry.current = new Date(s.expiry)
            console.log("access token will expire - "+ expiry.current.toISOString())
            setExpiring(false)
            console.log("clearing logout timer",logoutTimer.current)
            clearTimeout(logoutTimer.current) //FIXME - this is really only necessary because
            console.log("clear expiryTimer", expiryTimer.current)
            clearTimeout(expiryTimer.current)
            expiryTimer.current = setTimeout(() =>{

                // FIXME should include detection of whether user is active https://developer.mozilla.org/en-US/docs/Web/API/UserActivation

                console.log("access token about to expire - "+ expiry.current.toISOString());
                if(idleTimer.isIdle()) {
                    setExpiring(true);
                    console.log("idle")
                    logoutTimer.current = setTimeout(logout, 60000)
                    console.log("setting logout timer", logoutTimer.current)
                }
                else
                {
                    console.log("not idle ", idleTimer.getLastActiveTime()?.toISOString())
                    redoAuthentication()
                }

            }, expiry.current.getTime()-Date.now() -55000)
            console.log("setting new expiry reminder", expiryTimer.current)

            if(s.subjectMap.person) {
                user.current= s.subjectMap.person
            }
            else {
                //FIXME what to do it the person is not properly registered?
                console.error("authenticated person is not registered with database")
            }
        })
            .catch(console.log);
    }


    if(!loggedOn){
      redoAuthentication()
    }

    return (
        <ProposalContext.Provider value={{user:user.current, token:token.current, selectedProposalCode:0, apiUrl:apiURL.current}}>
            {loggedOn ? (
           <>
               <Modal
                   opened={expiringSoon && idleTimer.isIdle()}
                   onClose={logout}
                   title="Authentication"
                   overlayProps={{
                       backgroundOpacity: 0.55,
                       blur: 3,
                   }}
                >
                   {
                     <>
                       <div>Session about to time out</div>
                       <Button onClick={()=> {redoAuthentication()}}>Click to continue</Button>
                     </>
                   }
               </Modal>

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