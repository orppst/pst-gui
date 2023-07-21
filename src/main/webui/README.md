Notes
-----

Using yarn for package management

Using https://vitejs.dev for build/dev management

Client side (browser) code written in Typescript using React https://www.typescriptlang.org/docs/handbook/react.html

Using https://github.com/fabien0102/openapi-codegen to generate code from the openapi spec of the api

```shell
yarn run gen
```
will regenerate the code in [src/generated](src/generated) - this will require the API component to be up and running at the time. The code is checked in to version control as parts of it are expected to be hand edited anyway.


the generated code uses https://github.com/tanstack/query

Other client side libraries used

* https://reactrouter.com/ - see https://tkdodo.eu/blog/react-query-meets-react-router

## Misc

* see https://github.com/quarkiverse/quarkus-quinoa/issues/299 for issues regarding serving 
off non-root deployment url

* https://github.com/brillout/awesome-react-components 


