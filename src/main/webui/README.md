Using yarn for package management

Using https://vitejs.dev for build/dev management

Using https://github.com/fabien0102/openapi-codegen to generate code from the openapi spec of the api

```shell
yarn run gen
```
will regenerate the code in [src/generated](src/generated) - this will require the API component to be up and running at the time. The code is checked in to version control as parts of it are expected to be hand edited anyway.


see https://github.com/quarkiverse/quarkus-quinoa/issues/299 for issues regarding serving 
off non-root deployment url