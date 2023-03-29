package org.orph2020.pst;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Produces(MediaType.APPLICATION_JSON)
@Path("/proposalSchema")
public class SchemaResource {
    @GET
    public String proposalSchema() {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode schemaProperties = mapper.createObjectNode();
        ObjectNode titleNode = mapper.createObjectNode();
        titleNode.put("type", "string").put("title", "Title").put("default", "My new proposal");

        ObjectNode organisationNode = mapper.createObjectNode();
        organisationNode.put("type","string").put("title", "Organiszation Name");
        ArrayNode orgList = mapper.createArrayNode().add("Please choose one");
        organisationNode.put("enum", orgList);

        ObjectNode orgAddr = mapper.createObjectNode().put("type", "string").put("title", "Organization Address")
                .put("default", "ToDo: pre-populate this");

        ObjectNode piName = mapper.createObjectNode().put("type","string").put("title", "PI full name");

        ObjectNode eMail = mapper.createObjectNode().put("type","string").put("title", "PI email");

        ObjectNode sourceNode = mapper.createObjectNode().put("type", "array").put("title", "Targets");
        ObjectNode sourceTarget = mapper.createObjectNode().put("$ref", "#/definitions/target");
        ObjectNode itemProps = mapper.createObjectNode();
        itemProps.put("Target", sourceTarget);
        ObjectNode sourceItems = mapper.createObjectNode();
        sourceItems.put("properties", itemProps);
        sourceNode.put("items", sourceItems);

        ObjectNode desiredAngularResolution = mapper.createObjectNode()
                .put("type", "number")
                .put("title", "Desired Angular Resolution")
                .put("default", 25.0);

        ObjectNode desiredLargestScale = mapper.createObjectNode()
                .put("type", "number")
                .put("title", "Desired Largest Scale degrees")
                .put("default", 0.1);

        ObjectNode spectralWindowItemProps = mapper.createObjectNode().set("Window", mapper.createObjectNode().put("$ref", "#/definitions/spectral_window"));
        ObjectNode spectralWindowItems = mapper.createObjectNode().set("properties", spectralWindowItemProps);

        ObjectNode spectralWindow = mapper.createObjectNode()
                .put("type", "array")
                .put("title", "Spectral Window(s)")
                .set("items", spectralWindowItems);

        ObjectNode technicalGoalPerformanceProps = mapper.createObjectNode().set("desiredAngularResolution", desiredAngularResolution);
        technicalGoalPerformanceProps.set("desiredLargestScale", desiredLargestScale);
        technicalGoalPerformanceProps.set("spectralWindow", spectralWindow);

        ObjectNode technicalGoalPerformance = mapper.createObjectNode().put("type","object").put("title","performance")
                .set("properties", technicalGoalPerformanceProps);


        ObjectNode technicalGoal = mapper.createObjectNode()
                .put("type", "object")
                .put("title", "Technical Goal")
                .set("properties", mapper.createObjectNode().set("performance", technicalGoalPerformance));

        schemaProperties.set("title", titleNode);
        schemaProperties.set("organization_name", organisationNode);
        schemaProperties.set("organization_address", orgAddr);
        schemaProperties.set("person_fullName", piName);
        schemaProperties.set("person_eMail", eMail);
        schemaProperties.set("source", sourceNode);
        schemaProperties.set("technicalGoal", technicalGoal);

        try {
            return (mapper.writeValueAsString(schemaProperties));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
