package org.orph2020.pst.gui.auth;
/*
 * Created on 06/04/2023 by Paul Harrison (paul.harrison@manchester.ac.uk).
 */
import io.quarkus.oidc.OidcSession;
import io.quarkus.oidc.IdToken;
import io.quarkus.runtime.LaunchMode;
import io.quarkus.security.identity.SecurityIdentity;
import org.eclipse.microprofile.jwt.Claims;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.jboss.logging.Logger;
import org.orph2020.pst.apiimpl.entities.SubjectMap;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.time.Instant;

@Path("/aai/")
@Produces(MediaType.APPLICATION_JSON)
public class ProtectedResource {


    private static final Logger LOGGER = Logger.getLogger("AAI INFO");
    @RestClient
    UserInfo userService;

    @Inject
    JsonWebToken accessToken;

    @Inject
    @IdToken
    JsonWebToken idToken;

    @Inject
    SecurityIdentity identity;

    @Inject
    OidcSession oidcSession;

    public static class AAIInfo {
        public SubjectMap subjectMap;
        public String token;

        public String expiry;

        public AAIInfo(SubjectMap subjectMap, String token, long seconds) {
            this.subjectMap = subjectMap;
            this.token = token;
            this.expiry = Instant.ofEpochSecond(seconds).toString();
        }
    }
    @GET
    public AAIInfo me() {
        LOGGER.info(accessToken.claim(Claims.sub).toString());
        LOGGER.info("session="+oidcSession.toString()+" session expiry="+oidcSession.expiresAt());
        //IMPL in production do not log this token

        if(LaunchMode.current().isDevOrTest()){
            LOGGER.info("id expiry="+Instant.ofEpochSecond(idToken.getExpirationTime()).toString());
            LOGGER.info("auth time="+ Instant.ofEpochSecond((Long) accessToken.claim(Claims.auth_time).orElse(0)).toString());
           LOGGER.info(accessToken.getRawToken());
           LOGGER.info(Instant.ofEpochSecond(accessToken.getExpirationTime()).toString());
        }

        return new AAIInfo(
              userService.getUser((String) accessToken.claim(Claims.sub).orElse("")), // the subject is the AAI "unique identifier" - for keycloak anyway....
              accessToken.getRawToken(),
              accessToken.getExpirationTime()
        );
    }

}