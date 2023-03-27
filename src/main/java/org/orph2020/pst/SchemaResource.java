package org.orph2020.pst;

import javax.json.Json;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Produces(MediaType.APPLICATION_JSON)
@Path("/proposalSchema")
public class SchemaResource {
    @GET
    public String proposalSchema() {
        String json = Json.createObjectBuilder()
                .add("title", Json.createObjectBuilder().add("type","string").add("title", "Title").add("default", "My new proposal").build())
                .add("organization_name", Json.createObjectBuilder().add("type","string").add("title", "Organiszation Name").add("enum", Json.createArrayBuilder().add("Please choose one").build()).build())
                .add("person_fullName", Json.createObjectBuilder().add("type","string").add("title", "PI full name").build())
                .add("person_email", Json.createObjectBuilder().add("type","string").add("title", "PI email").build())
                .add("source", Json.createObjectBuilder()
                        .add("type", "array")
                        .add("title", "Targets")
                        .add("items", Json.createObjectBuilder()
                                .add("properties", Json.createObjectBuilder()
                                        .add("Target", Json.createObjectBuilder()
                                                .add("$ref", "#/definitions/target")
                                                .build())
                                        .build())
                                .build())
                        .build())
                        .add("technicalGoal", Json.createObjectBuilder()
                                .add("type","object")
                                .add("title", "Technical Goal")
                                .add("properites", Json.createObjectBuilder()
                                        .add("performance", Json.createObjectBuilder()
                                                .add("type", "object")
                                                .add("title", "Performance")
                                                .add("properties", Json.createObjectBuilder()
                                                        .add("desiredAngularResolution", Json.createObjectBuilder()
                                                                .add("type", "number")
                                                                .add("title", "Desired Angular Resolution")
                                                                .add("default", 25.0)
                                                                .build()
                                                        )
                                                        .add("desiredLargestScale", Json.createObjectBuilder()
                                                                .add("type", "number")
                                                                .add("title", "Desired Largest Scale degrees")
                                                                .add("default", 0.1)
                                                                .build()
                                                        )
                                                        .add("spectralWindow", Json.createObjectBuilder()
                                                                .add("type", "array")
                                                                .add("title","Spectral Window(s)")
                                                                .add("items", Json.createObjectBuilder()
                                                                        .add("properties", Json.createObjectBuilder()
                                                                                .add("Window", Json.createObjectBuilder()
                                                                                        .add("$ref", "#/definitions/spectral_window")
                                                                                        .build())
                                                                                .build())
                                                                        .build())
                                                                .build())
                                                        .build())
                                                .build())
                                        .build())
                                .build())
                .add("readyToSubmit", Json.createObjectBuilder()
                        .add("type","boolean")
                        .add("title", "Ready to submit?")
                        .add("default", false)
                        .build())
                .build().toString();
        return json;
    }
}
