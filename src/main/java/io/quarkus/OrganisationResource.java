package io.quarkus;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Set;

@Path("/organisations")
public class OrganisationResource {

    @GET
    public Set<String> getOrganisations() {
        Set <String> orgList = Collections.newSetFromMap(Collections.synchronizedMap(new LinkedHashMap<>()));
        orgList.add(new String("University of Manchester"));
        orgList.add(new String("Another organisation"));
        orgList.add(new String("Another organisation2"));
        orgList.add(new String("Another organisation3"));
        return orgList;
    }
}
