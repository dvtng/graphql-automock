import React from "react";
import { ApolloProvider } from "react-apollo";
import { mockApolloClient } from "./mock-apollo-client";

export const MockApolloProvider = ({ schema, mocks, children }) => {
  const mockedClient = mockApolloClient({ schema, mocks });
  return <ApolloProvider client={mockedClient}>{children}</ApolloProvider>;
};
