package org.orph2020.pst;

import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.ivoa.dm.proposal.prop.Organization;
import org.orph2020.pst.rest.client.ApiService;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Set;

@Path("/proposalapi")
public class ProposalApiResource {

    @RestClient
    ApiService apiService;
    @GET
    @Path("organisations")
    public Set<Organization> getOrganisations() {

        return apiService.getOrganisations();
    }
}
