import {jwtDecode} from "jwt-decode";
import {useToken} from "../App2.tsx";

/**
 * Check current user's roles for any one in array
 * @param roles A string array of roles
 * @return boolean returns true if current user has ANY of the roles passed
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