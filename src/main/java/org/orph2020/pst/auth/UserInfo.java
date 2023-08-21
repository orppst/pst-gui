package org.orph2020.pst.auth;
/*
 * Created on 14/07/2023 by Paul Harrison (paul.harrison@manchester.ac.uk).
 */

import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.ivoa.dm.proposal.prop.Person;
import org.orph2020.pst.apiimpl.entities.SubjectMap;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;

@RegisterRestClient(configKey="proposal-api")
public interface UserInfo {

    @GET
    @Path("subjectMap/{id}")
    public SubjectMap getUser(@PathParam("id") String uid);
}
