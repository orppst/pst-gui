qu# pst-gui Project

[![main build](https://github.com/orppst/pst-gui/actions/workflows/gradle.yml/badge.svg)](https://github.com/orppst/pst-gui/actions/workflows/gradle.yml/)


This project uses Quarkus - If you want to learn more about Quarkus, please visit its website: https://quarkus.io/ .

Note that there is a separate [README](src/main/webui/README.md) for the client side browser application that makes up the 
majority of this component.

## Optional third party software

You will need to install `latexmk` on your local environment should you wish to test the Justifications LaTeX 
functionality when developing i.e., producing a PDF output of the Justifications. `latexmk` will be installed
on the server for production.

## Running the application in dev mode

You can run your application in dev mode that enables live coding using:
```shell script
./gradlew quarkusDev
```

> **_NOTE:_**  Quarkus now ships with a Dev UI, which is available in dev mode only at http://localhost:8080/q/dev/.

## Packaging and running the application

The application can be packaged using:
```shell script
./gradlew build
```
It produces the `quarkus-run.jar` file in the `build/quarkus-app/` directory.
Be aware that it’s not an _über-jar_ as the dependencies are copied into the `build/quarkus-app/lib/` directory.

The application is now runnable using `java -jar build/quarkus-app/quarkus-run.jar`.

If you want to build an _über-jar_, execute the following command:
```shell script
./gradlew build -Dquarkus.package.type=uber-jar
```

The application, packaged as an _über-jar_, is now runnable using `java -jar build/*-runner.jar`.

## Creating a native executable

You can create a native executable using: 
```shell script
./gradlew build -Dquarkus.package.type=native
```

Or, if you don't have GraalVM installed, you can run the native executable build in a container using: 
```shell script
./gradlew build -Dquarkus.package.type=native -Dquarkus.native.container-build=true
```

You can then execute your native executable with: `./build/pst-gui-0.1-runner`

If you want to learn more about building native executables, please consult https://quarkus.io/guides/gradle-tooling.



