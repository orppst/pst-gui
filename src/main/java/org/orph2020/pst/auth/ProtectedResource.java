package org.orph2020.pst.auth;
/*
 * Created on 06/04/2023 by Paul Harrison (paul.harrison@manchester.ac.uk).
 */

import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;

import io.quarkus.security.identity.SecurityIdentity;
import org.eclipse.microprofile.jwt.JsonWebToken;
import io.quarkus.oidc.AccessTokenCredential;
import io.quarkus.security.Authenticated;

@Path("/aai/protected")
@Authenticated
public class ProtectedResource {

    @Inject
    JsonWebToken accessToken;

    @Inject
    SecurityIdentity identity;

    // or
    // @Inject
    // AccessTokenCredential accessTokenCredential;

    @GET
    public User me() {
        return new User(identity);
    }

    public static class User {

        private final String userName;

        User(SecurityIdentity identity) {
            this.userName = identity.getPrincipal().getName();
        }

        public String getUserName() {
            return userName;
        }
    }
}