package org.orph2020.pst.auth;
/*
 * Created on 06/04/2023 by Paul Harrison (paul.harrison@manchester.ac.uk).
 */

import javax.inject.Inject;
import javax.security.auth.Subject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import io.quarkus.security.credential.Credential;
import io.quarkus.security.identity.SecurityIdentity;
import org.eclipse.microprofile.jwt.Claims;
import org.eclipse.microprofile.jwt.JsonWebToken;
import io.quarkus.oidc.AccessTokenCredential;
import io.quarkus.security.Authenticated;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.jboss.logging.Logger;
import org.orph2020.pst.apiimpl.entities.SubjectMap;

import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Path("/aai/")
@Produces(MediaType.APPLICATION_JSON)
public class ProtectedResource {

    private static final Logger LOGGER = Logger.getLogger("AAI INFO");
    @RestClient
    UserInfo userService;

    @Inject
    JsonWebToken accessToken;

    @Inject
    SecurityIdentity identity;

    @GET
    public SubjectMap me() {
        LOGGER.info(accessToken.claim(Claims.sub).toString());
        LOGGER.info(accessToken.getRawToken());
        return userService.getUser((String) accessToken.claim(Claims.sub).get()); // the subject is the AAI "unique identifier" - for keycloak anyway....
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
    }
}