plugins {
    id("org.orph2020.pst.common-plugin")
}

version = "0.1"

dependencies {
    implementation("io.quarkus:quarkus-resteasy-reactive-jackson")
    implementation("io.quarkus:quarkus-rest-client-reactive-jackson")
    implementation("io.quarkiverse.quinoa:quarkus-quinoa:1.2.5")
    implementation("io.quarkus:quarkus-websockets")
    implementation("io.quarkus:quarkus-smallrye-jwt")
    implementation("io.quarkus:quarkus-oidc")
    implementation("io.quarkus:quarkus-arc")
    implementation("io.quarkus:quarkus-resteasy-reactive")
//    implementation("io.quarkus:quarkus-oidc")
    testImplementation("io.rest-assured:rest-assured")
    testImplementation("io.quarkiverse.quinoa:quarkus-quinoa-testing:1.2.5")
}

