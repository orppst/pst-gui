package org.orph2020.pst;

import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.ivoa.dm.proposal.prop.ObservingProposal;
import org.ivoa.dm.proposal.prop.Person;
import org.orph2020.pst.common.json.ObjectIdentifier;
import org.orph2020.pst.rest.client.ApiService;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
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

    @GET
    @Path("people")
    public Set<ObjectIdentifier> getPeople() {
        return apiService.getPeople();
    }

    @GET
    @Path("people/{id}")
    public Person getPerson(@PathParam("id") long id) {
        return apiService.getPerson(id);
    }

    @PUT
    @Consumes(MediaType.TEXT_PLAIN)
    @Path("people/{id}/fullName")
    public Response updateFullName(@PathParam("id") long id, byte[] fullName) {
        String name = new String(fullName);
        return apiService.updateFullName(id, name);
    }

    @PUT
    @Consumes(MediaType.TEXT_PLAIN)
    @Path("people/{id}/eMail")
    public Response updateEMail(@PathParam("id") long id, byte[] eMail) {
        String email = new String(eMail);
        return apiService.updateEMail(id, email);
    }
}
