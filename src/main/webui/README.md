Notes
-----

Using npm for package management

Using https://vitejs.dev for build/dev management

Client side (browser) code written in Typescript using the https://mantine.dev react component library

Using https://github.com/fabien0102/openapi-codegen to generate code from the openapi spec of the api

```shell
npm run gen
```
will regenerate the code in [src/generated](src/generated) - this will require the API component to be up and running at the time. The code is checked in to version control as parts of it are expected to be hand edited anyway.

the generated code uses https://github.com/tanstack/query

*Note* that the autogenerated [proposalToolSchemas.ts](src%2Fgenerated%2FproposalToolSchemas.ts) file needs some further
manual editing to add some necessary type information - this is done by applying the [Add_@types.patch](Add_%40types.patch)
file with 

```shell
patch src/generated/proposalToolSchemas.ts Add_@types.patch
```

To create a new patch file

```shell
cd src/generated;diff -Naur proposalToolSchemas.ts.orig proposalToolSchemas.ts > ../../Add_@types.patch 
```

Other client side libraries used

* https://reactrouter.com/ - see https://tkdodo.eu/blog/react-query-meets-react-router

## Security

follows  https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps-14#name-token-mediating-backend architecture where the refresh token is not exposed to the javascript.

## Misc

* see https://github.com/quarkiverse/quarkus-quinoa/issues/299 for issues regarding serving 
off non-root deployment url

* https://github.com/brillout/awesome-react-components 


