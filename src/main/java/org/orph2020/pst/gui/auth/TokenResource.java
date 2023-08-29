package org.orph2020.pst.gui.auth;
/*
 * Created on 06/04/2023 by Paul Harrison (paul.harrison@manchester.ac.uk).
 */
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.SecurityContext;

import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import org.eclipse.microprofile.jwt.Claims;
import org.eclipse.microprofile.jwt.JsonWebToken;

import io.quarkus.oidc.IdToken;
import io.quarkus.oidc.RefreshToken;

import java.util.Set;

@Path("/aai/authz")
public class TokenResource {

    /**
     * Injection point for the ID Token issued by the OpenID Connect Provider
     */
    @Inject
    @IdToken
    JsonWebToken idToken;

    /**
     * Injection point for the Access Token issued by the OpenID Connect Provider
     */
    @Inject
    JsonWebToken accessToken;

    /**
     * Injection point for the Refresh Token issued by the OpenID Connect Provider
     */
    @Inject
    RefreshToken refreshToken;


    @Inject
    SecurityIdentity identity;

    @Context
    SecurityContext ctx;


    /**
     * Returns the tokens available to the application. This endpoint exists only for demonstration purposes, you should not
     * expose these tokens in a real application.
     *
     * @return a HTML page containing the tokens available to the application
     */
    @GET
    @Produces("text/html")
    public String getTokens() {
        StringBuilder response = new StringBuilder().append("<html>")
              .append("<body>")
              .append("<ul>");

        Object userName = this.idToken.getClaim("preferred_username");

        if (userName != null) {
            response.append("<li>username: ").append(userName.toString()).append("</li>");
        }

        Set<String> claims = this.idToken.getClaimNames();

        for (String s : claims) {
            response.append("<li>id claim: ").append(s).append("=").append(this.idToken.claim(s)).append("</li>");
        }

        response.append("<h2>access token</h2>");
        claims = this.accessToken.getClaimNames();

        for (String s : claims) {
            response.append("<li>ac claim: ").append(s).append("=").append(this.accessToken.claim(s)).append("</li>");
        }

        response.append("<li>refresh_token: ").append(refreshToken.getToken() != null).append("</li>");

        response.append("<h2>Security Identity</h2>");

        response.append("<li>").append(identity.getRoles()).append("</li>");


        return response.append("</ul>").append("</body>").append("</html>").toString();
    }

    @GET
    @RolesAllowed("default-roles-orppst")
    @Path("/rest")
    @Produces(MediaType.TEXT_HTML)
    public String admin() {
        return "Access for subject " + accessToken.getSubject() + " is granted";
    }
}
