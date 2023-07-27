package org.orph2020.pst.auth;
/*
 * Created on 06/04/2023 by Paul Harrison (paul.harrison@manchester.ac.uk).
 */

import io.quarkus.security.identity.SecurityIdentity;
import org.eclipse.microprofile.jwt.Claims;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.jboss.logging.Logger;
import org.orph2020.pst.apiimpl.entities.SubjectMap;

import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

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

    public static class AAIInfo {
        public SubjectMap subjectMap;
        public String token;

        public AAIInfo(SubjectMap subjectMap, String token) {
            this.subjectMap = subjectMap;
            this.token = token;
        }
    }
    @GET
    public AAIInfo me() {
        LOGGER.info(accessToken.claim(Claims.sub).toString());
        LOGGER.info(accessToken.getRawToken());
        return new AAIInfo(
              userService.getUser((String) accessToken.claim(Claims.sub).orElse("")), // the subject is the AAI "unique identifier" - for keycloak anyway....
              accessToken.getRawToken()
        );
    }

}