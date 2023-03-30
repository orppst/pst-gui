package org.orph2020.pst;

import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.ivoa.dm.proposal.prop.Observatory;
import org.ivoa.dm.proposal.prop.Organization;
import org.ivoa.dm.proposal.prop.ObservingProposal;
import org.orph2020.pst.common.json.ObjectIdentifier;
import org.orph2020.pst.rest.client.ApiService;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Set;

@Produces(MediaType.APPLICATION_JSON)
@Path("/proposalapi")
public class ProposalApiResource {

    @RestClient
    ApiService apiService;
    @GET
    @Path("observatories")
    public Set<ObjectIdentifier> getObservatories() {

        return apiService.getObservatories();
    }

    @GET
    @Path("proposals")
    public Set<ObservingProposal> getProposals() {
        return apiService.getProposals();
    }
}
