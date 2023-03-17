package org.orph2020.pst.rest.client;
/*
 * Created on 16/03/2023 by Paul Harrison (paul.harrison@manchester.ac.uk).
 */

import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.ivoa.dm.proposal.prop.Observatory;
import org.ivoa.dm.proposal.prop.Organization;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import java.util.Set;

@RegisterRestClient(configKey="proposal-api")
@Path("api")
public interface ApiService {
   @Path("observatories")
   @GET
   Set<Observatory> getObservatories();

}
