plugins {
    id("org.orph2020.pst.common-plugin")
}

version = "1.0"

dependencies {
    implementation("org.orph2020.pst:pst-lib")
    implementation("io.quarkus:quarkus-rest-jackson")
    implementation("io.quarkus:quarkus-rest-client-jackson")
    implementation("io.quarkiverse.quinoa:quarkus-quinoa:2.7.2")
    implementation("io.quarkus:quarkus-reactive-routes")
    implementation("io.quarkus:quarkus-websockets")
    implementation("io.quarkus:quarkus-smallrye-jwt")
    implementation("io.quarkus:quarkus-oidc")
//    implementation("io.quarkus:quarkus-rest-client-oidc-filter")  // https://quarkus.io/guides/security-openid-connect-client
//    implementation("io.quarkus:quarkus-oidc-token-propagation-reactive")  // https://quarkus.io/guides/security-openid-connect


//    implementation("io.quarkus:quarkus-keycloak-admin-client") // https://quarkus.io/guides/security-keycloak-admin-client
    implementation("io.quarkus:quarkus-arc")
    implementation("io.quarkus:quarkus-rest")
    testImplementation("io.rest-assured:rest-assured")
    testImplementation("io.quarkiverse.quinoa:quarkus-quinoa-testing:2.7.2")
}

