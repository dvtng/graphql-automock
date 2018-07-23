import { mockSchema } from "./mock-schema";
import { ApolloClient } from "apollo-client";
import { SchemaLink } from "apollo-link-schema";
import { InMemoryCache } from "apollo-cache-inmemory";

export const mockApolloClient = params => {
  const mockedSchema = mockSchema(params);
  const mockedClient = new ApolloClient({
    link: new SchemaLink({ schema: mockedSchema }),
    cache: new InMemoryCache()
  });
  return mockedClient;
};
