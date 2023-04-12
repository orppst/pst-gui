package org.orph2020.pst.auth;
/*
 * Created on 06/04/2023 by Paul Harrison (paul.harrison@manchester.ac.uk).
 */

import javax.inject.Inject;
import javax.security.auth.Subject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;

import io.quarkus.security.credential.Credential;
import io.quarkus.security.identity.SecurityIdentity;
import org.eclipse.microprofile.jwt.Claims;
import org.eclipse.microprofile.jwt.JsonWebToken;
import io.quarkus.oidc.AccessTokenCredential;
import io.quarkus.security.Authenticated;

import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Path("/aai/protected")
@Authenticated
public class ProtectedResource {

    @Inject
    JsonWebToken accessToken;

    @Inject
    SecurityIdentity identity;

    

    @GET
    public User me() {
        return new User(identity,accessToken);
    }

    public static class User {

        private final String userName;
        private final Optional<Object> subject;

        public Set<String> getAtt() {
            return att;
        }

        private final Set<String> att;

        public Set<Credential> getCreds() {
            return creds;
        }

        private final Set<Credential> creds;

        User(SecurityIdentity identity, JsonWebToken accessToken) {
            this.userName = identity.getPrincipal().getName();
            this.subject = accessToken.claim(Claims.sub); // the subject is the AAI "unique identifier" - for keycloak anyway....
            this.creds = identity.getCredentials(); // these are the raw tokens...
            this.att =identity.getAttributes().keySet(); // attributes seem to be only internally to quarkus useful.
        
        }

        public String getUserName() {
            return userName;
        }
    }
}