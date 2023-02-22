package io.quarkus;

import javax.ws.rs.GET;
import javax.ws.rs.Path;

@Path("/proposalSchema")
public class SchemaResource {
    @GET
    public String proposalSchema() {
        String sample = new String( "title: \"Sample Proposal form\"");
        return sample;
    }
}
