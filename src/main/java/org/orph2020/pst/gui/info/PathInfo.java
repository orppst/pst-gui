package org.orph2020.pst.gui.info;
/*
 * Created on 25/08/2023 by Paul Harrison (paul.harrison@manchester.ac.uk).
 */

import io.quarkus.runtime.LaunchMode;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.*;
import org.eclipse.microprofile.config.ConfigProvider;

import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;

@Path("/api-info")
public class PathInfo {
   @GET
  @Produces(MediaType.TEXT_PLAIN)
   public Response info(@Context UriInfo uriInfo) {
      final var requestUri = uriInfo.getRequestUri();
      if(LaunchMode.current().isDevOrTest())
      {
         URI apiloc = null;
         try {
            apiloc = new URI(ConfigProvider.getConfig().getValue("quarkus.rest-client.proposal-api.url", String.class));

            return Response.ok(apiloc.resolve("../../")).build();
         } catch (URISyntaxException e) {
            throw new RuntimeException(e);//should not happen
         }

      }
      else {
         //when deployed the api is on same server (as far as the client side can see things).

         URI uriLoc = UriBuilder.fromPath("/").scheme("https").host(requestUri.getHost()).build();
         return Response.ok(uriLoc).build();
      }
   }
}
