import React from "react";
import { ApolloProvider } from "react-apollo";
import { mockApolloClient } from "./mock-apollo-client";

export const MockApolloProvider = params => {
  const mockedClient = mockApolloClient(params);
  return (
    <ApolloProvider client={mockedClient}>{params.children}</ApolloProvider>
  );
};
