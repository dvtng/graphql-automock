import React from "react";
import { Query } from "react-apollo";
import TestRenderer from "react-test-renderer";
import gql from "graphql-tag";
import { MockApolloProvider } from "../mock-apollo-provider";
import { types } from "./types";

it("creates a working apollo provider", async () => {
  const query = gql`
    {
      me {
        id
      }
    }
  `;
  const root = TestRenderer.create(
    <MockApolloProvider schema={types}>
      <Query query={query}>
        {({ data, loading }) => (loading ? "loading" : data.me.id)}
      </Query>
    </MockApolloProvider>
  );

  expect(root.toJSON()).toEqual("loading");

  await Promise.resolve();

  expect(root.toJSON()).toEqual("me.id");
});
