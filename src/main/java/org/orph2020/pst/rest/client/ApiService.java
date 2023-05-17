package org.orph2020.pst.rest.client;
/*
 * Created on 16/03/2023 by Paul Harrison (paul.harrison@manchester.ac.uk).
 */

import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.ivoa.dm.proposal.prop.ObservingProposal;
import org.ivoa.dm.proposal.prop.ProposalModel;
import org.orph2020.pst.common.json.ObjectIdentifier;
import org.ivoa.dm.proposal.prop.Person;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.Set;

@RegisterRestClient(configKey="proposal-api")
@Path("../api")
public interface ApiService {
   @Path("observatories")
   @GET
   Set<ObjectIdentifier> getObservatories();

   @Path("proposals")
   @GET
   Set<ObjectIdentifier> getProposals();

   @Path("proposals/{id}")
   @GET
   ObservingProposal getObservingProposal(@PathParam("id") long id);

   @Path("proposals")
   @POST
   @Consumes(MediaType.APPLICATION_JSON)
   ObservingProposal createObservingProposal(ObservingProposal newProposal);

   @Path("people")
   @GET
   Set<ObjectIdentifier> getPeople();

   @Path("people/{id}")
   @GET
   Person getPerson(@PathParam("id") long id);

   @Path("people/{id}/fullName")
   @PUT
   @Consumes(MediaType.TEXT_PLAIN)
   Response updateFullName(@PathParam("id") long id, String replacementFullName);

   @Path("people/{id}/eMail")
   @PUT
   @Consumes(MediaType.TEXT_PLAIN)
   Response updateEMail(@PathParam("id") long id, String replacementEMail);

}
