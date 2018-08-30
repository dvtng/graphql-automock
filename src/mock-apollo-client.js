import { ApolloClient } from "apollo-client";
import { ApolloLink, Observable } from "apollo-link";
import { SchemaLink } from "apollo-link-schema";
import { InMemoryCache } from "apollo-cache-inmemory";
import { mockSchema } from "./mock-schema";
import { RUNNING } from "./schema-controller";

const controllerLink = controller =>
  new ApolloLink((operation, forward) => {
    const observable = new Observable(observer => {
      controller._beforeQuery();
      controller._when(RUNNING).then(controllerState => {
        if (controllerState.networkError) {
          observer.error(controllerState.networkError());
          controller._afterQuery();
          return;
        }

        forward(operation).subscribe({
          next: (...args) => observer.next(...args),
          error: (...args) => observer.error(...args),
          complete: (...args) => {
            observer.complete(...args);
            controller._afterQuery();
          }
        });
      });
    });
    return observable;
  });

export const mockApolloClient = params => {
  const mockedSchema = mockSchema(params);
  const schemaLink = new SchemaLink({ schema: mockedSchema });
  const mockedClient = new ApolloClient({
    link: params.controller
      ? controllerLink(params.controller).concat(schemaLink)
      : schemaLink,
    cache: new InMemoryCache()
  });
  return mockedClient;
};
