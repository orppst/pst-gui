import {jwtDecode} from "jwt-decode";
import {useToken} from "../App2.tsx";

/**
 * Custom hook to check current user's roles for any one in array.
 * Must be called at the top level of a component (React rules of hooks).
 * @param roles A string array of roles
 * @return boolean returns true if current user has ANY of the roles passed
 */
export function useHasRole (roles: String[]) {
    const token = useToken();
    let roleFound: boolean = false;

    if(token) {
        const decodedToken = jwtDecode(token);

        // @ts-ignore
        if(decodedToken && decodedToken.realm_access && decodedToken.realm_access.roles) {
            roles.forEach(roleName => {
                // @ts-ignore
                if (decodedToken.realm_access.roles.includes(roleName)) roleFound = true;
            })
        }

    }
    return roleFound;

}