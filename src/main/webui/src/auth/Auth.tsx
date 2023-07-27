import {createContext, ReactNode, useContext, useEffect, useReducer, useState} from "react";

const authContext = createContext<{ token: null | string }>({
    token: null,
});
export function AuthProvider({ children }: { children: ReactNode }) {

    const [token,setToken] = useState<string|null>(null)
    const [loggedOn, setLoggedOn] = useState(false);

    async function getUser() {
        const response = await window.fetch("/pst/gui/aai/"); //IMPL would be nice to have this URL parameterized
        return response;
    }

    useEffect( () => {
        const resp = getUser();
        console.log("trying auth");
        resp.then((r) => {setLoggedOn(true);
            for(const entry of r.headers.entries()) {
                console.log('header', entry);
            }
        })
            .catch(console.log);
    }, [token, loggedOn])

    return (
        <authContext.Provider value={{token}}>
            {loggedOn ? (
           <>
               {children}
           </>
                ) : (
                    <>
                    <div>need to logon</div>
                        {children}
                    </>
            )
            }
        </authContext.Provider>

    );
}