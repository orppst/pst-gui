import {ReactNode, useState, useRef, useEffect, useCallback, ReactElement} from "react"
import {Person, SubjectMap} from "../generated/proposalToolSchemas.ts"
import {ProposalContext} from "../App2.tsx"
import {setFetcherApiURL} from "../generated/proposalToolFetcher.ts"
import {NewUser} from "./NewUser.tsx";
import { Modal, Button, Paper, Text } from '@mantine/core'
import { useIdleTimer } from 'react-idle-timer'
import type {PresenceType} from 'react-idle-timer'
import '../../public/greeting.css'

export type AuthMapping = {
    subjectMap:SubjectMap;
    kc_uuid: string;
    token: string;
    expiry: string;
    nameFromAuth: string;
    emailFromAuth: string;
}

// This is still basically done by server side refresh - following the https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps-14#name-token-mediating-backend architecture
// The server side settings are https://quarkus.io/guides/security-oidc-code-flow-authentication#handling-and-controlling-the-lifetime-of-authentication
// quarkus.oidc.token.refresh-token-time-skew=60
// quarkus.oidc.token.refresh-expired=true
// which means that quarkus will attempt to refresh 60s before actual expiry - we need that as we cannot have a redirect happen
// for the javascript fetch because of CORS so we make the call 10s before expiry.
//

export function AuthProvider({ children }: { children: ReactNode }) {

    // CONFIG VALUES ///////////////////////////////////
    // note that these values need to be sensible wrt to access token lifetime
    const minutesUntilIdleTriggered = 5;
    const secondsAllowedToReauthenticate = 60
    const secondsBeforeExpiryToReauthenticate = 10
    // CONFIG VALUES END ///////////////////////////////

    const minuteAsMS = 60000;

    const [loggedOn, setLoggedOn] = useState(false)
    const [expiringSoon, setExpiring] = useState(false)
    const [isNewUser, setIsNewUser] = useState(false);
    const [token, setToken] = useState<string>("")//TODO what to do if token bad....
    const [user, setUser ] = useState({fullName:"Unknown"} as Person)

    const expiry = useRef(new Date(Date.now())) //seems to be overwritten regardless
    const apiURL = useRef("")
    const expiryTimer = useRef<NodeJS.Timeout>()

    const uuid =  useRef<string>("")

    const onPresenceChange = (presence:PresenceType) =>{
        const f = async () => {
            console.log("activity change = " + presence.type + " at " + new Date().toISOString())
            clearTimeout(expiryTimer.current)
            if (presence.type === "idle") {
                const s = await updateToken()
                updateAuth(s) // make sure that there will be an up to date token if the user decides to carry on
                clearTimeout(expiryTimer.current) // but do not auto update it.
                setExpiring(true)
            }
        }
        f().catch(console.log);
    }

    const getToken = () => {return token}

    const idleTimer = useIdleTimer({
        onPresenceChange,
        timeout: minuteAsMS * minutesUntilIdleTriggered,
        throttle: 500
    })

     function checkLoggedOn(){ // and also get the base URL as a by-product

         const apiResponse = fetch("/pst/gui/api-info", {
             method: "GET",
             headers: {
                 "X-Requested-With": "JavaScript" //this hooks up with the OIDC backend processing - makes sure redirects never happen
             }})
        apiResponse.then((r) => {
            if(r.ok) {
                setLoggedOn(true)
                r.text().then(localbaseUrl => {
                    setFetcherApiURL(localbaseUrl.replace(/\/$/, "")) // remove the trailing / from the api location if it is there.
                    apiURL.current = localbaseUrl

                })
            }
        })

    }

    async function getUser() {

        const response = await window.fetch("/pst/gui/aai/",
            { method: "GET",
            headers: {
            "X-Requested-With": "JavaScript"
        }});
        let error;
        if (response.ok) {

            return await response.json() as AuthMapping
        } else if(response.redirected) {
            console.log("redirected" )
        }
        else {
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


        }
        throw error;
    }

    function logout() {
        console.log("forcing logout")
        window.location.replace("/pst/gui/logout")
    }

    function updateAuth(s: AuthMapping) {
        setToken(s.token)
        setLoggedOn(true)
    }

    async function updateToken() {

        console.log("trying authentication");
        //request the authentication mapping object
        const s = await getUser();
        //handle the auth mapping object
        expiry.current = new Date(s.expiry)
        console.log("token: " + s.token)
        console.log("access token will expire - "+ expiry.current.toISOString()+" ("+expiry.current.getHours()+":"+expiry.current.getMinutes()+":"+expiry.current.getSeconds()+" Local)")
            console.log("clear expiryTimer", expiryTimer.current)
            clearTimeout(expiryTimer.current)
            const expDelay =  expiry.current.getTime()-Date.now() - secondsBeforeExpiryToReauthenticate*1000
            console.log("expiry delay =" + expDelay)
            expiryTimer.current = setTimeout(() =>{
                console.log("access token about to expire - "+ expiry.current.toISOString()+" ("+expiry.current.getHours()+":"+expiry.current.getMinutes()+":"+expiry.current.getSeconds()+" Local)")
                console.log("last time active ", idleTimer.getLastActiveTime()?.toISOString())
                    updateToken().then(updateAuth).catch(console.log)
            }, expDelay)
           console.log("setting new expiry reminder", expiryTimer.current)

            if(s.subjectMap.inKeycloakRealm && s.subjectMap.person) {
                setUser(s.subjectMap.person)
            }
            else {
                console.warn("authenticated person ",s.nameFromAuth," is not registered with database")
                setIsNewUser(true)
                setUser({fullName: s.nameFromAuth, eMail: s.emailFromAuth})
                uuid.current = s.kc_uuid
                console.log("new user", user)
            }
            return s


    }


    const doUpdateToken = useCallback( async () =>{
       const s = await updateToken();
        setToken(s.token)
    }, [])

    if (!loggedOn) {
        checkLoggedOn()
    }


    useEffect(() => {
        if(loggedOn && token === "") {
            doUpdateToken()
        }
    },[loggedOn]);


    function userConfirmed(p :Person)
    {
        setUser(p)
        setIsNewUser(false)
    }

    function LogoutWarning(props : {startCount:number}) : ReactElement {

        const [count, setCount] = useState(props.startCount);
        useEffect(() => {
            const id = setInterval(() => {
                setCount(c => c - 1);
            }, 1000);
            return () => clearInterval(id);
        }, []);
        useEffect(() => {
            if(count == 0)
            {
                logout()
            }
        }, [count]);
        return (
        <Modal
            opened={true}
            zIndex={201}
            onClose={logout}
            title="Idle Warning"
            overlayProps={{
                backgroundOpacity: 0.55,
                blur: 3,
            }}
        >
            {
                <>
                    <div>Session about to time out in {count} seconds</div>
                    <Button onClick={()=> {updateToken().then(updateAuth).catch(console.log); setExpiring(false)}}>Click to continue</Button>
                </>
            }
        </Modal>
        )
    }

    return (
        <ProposalContext.Provider value={{user:user, getToken:getToken, authenticated:loggedOn, selectedProposalCode:0, apiUrl:apiURL.current}}>
            {loggedOn ? ( isNewUser ? (

                  <NewUser proposed={user} uuid={uuid.current} userConfirmed={userConfirmed}/>

                ) :  ( getToken().length > 1 ? (

                expiringSoon ? (
                    <>
                    <LogoutWarning startCount={ secondsAllowedToReauthenticate }/>
                    {children}
                    </>
                ) : (
                    <>
                        {children}
                    </>
                    )

                    ) : (
                        <>
                                    <Paper shadow="sm" p="xl">
                                        <Text>Loading....</Text>
                                    </Paper>
                        </>
                    )
                ) ) : (
                    <>
                        <div className='introback'>
                        <div className='greeting'>

                            <img className="intromessage" src="/pst/gui/polaris4.png"/>
                            <h1 className='intromessage'><a href={'/pst/gui/login/'}>Login</a></h1>

                        </div>
                        </div>
                    </>
            )
            }
        </ProposalContext.Provider>

    );
}