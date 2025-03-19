import {jwtDecode} from "jwt-decode";
import {useToken} from "../App2.tsx";

/**
 * Check current users roles for any one given
 * @param roles An array of strings of roles
 * @return boolean returns true if current user has ANY of the roles in the array
 */
export function HaveRole (roles: String[]) {
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