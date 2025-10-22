package org.orph2020.pst.gui.auth;


import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;

import java.net.URI;
import java.net.URISyntaxException;

/*
 * Created on 16/10/2025 by Paul Harrison (paul.harrison@manchester.ac.uk).
 * This has been done to avoid any CORS issues with Keycloak - i.e. keycloak redirects to here and then when logged in the main SPA
 * loads after this redirect.
 */
@Path("/login")
public class Login {
   @GET public Response login(@Context UriInfo uriInfo) throws URISyntaxException {
      return Response.temporaryRedirect(uriInfo.getBaseUri().resolve(new URI("./tool/"))).build();
   }
}
