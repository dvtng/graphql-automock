import { ApolloClient } from "apollo-client";
import { ApolloLink, Observable } from "apollo-link";
import { InMemoryCache } from "apollo-cache-inmemory";
import { graphql, print } from "graphql";
import { mockSchema } from "./mock-schema";
import { RUNNING } from "./schema-controller";

const controllerLink = controller =>
  new ApolloLink((operation, forward) => {
    return new Observable(observer => {
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
  });

export const mockApolloClient = params => {
  const mockedSchema = mockSchema(params);

  const schemaLink = new ApolloLink(operation => {
    return new Observable(observer => {
      graphql(
        mockedSchema,
        print(operation.query),
        operation.getContext,
        operation.variables
      ).then(result => {
        observer.next(result);
        observer.complete();
      });
    });
  });

  const mockedClient = new ApolloClient({
    link: params.controller
      ? controllerLink(params.controller).concat(schemaLink)
      : schemaLink,
    cache: new InMemoryCache()
  });

  return mockedClient;
};
