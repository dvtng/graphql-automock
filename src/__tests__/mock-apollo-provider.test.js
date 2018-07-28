import React from "react";
import { Query } from "react-apollo";
import TestRenderer from "react-test-renderer";
import gql from "graphql-tag";
import { MockApolloProvider } from "../mock-apollo-provider";
import { SchemaController } from "../schema-controller";
import { types } from "./types";

const TestComponent = () => {
  const query = gql`
    {
      me {
        id
      }
    }
  `;
  return (
    <Query query={query}>
      {({ data, loading }) => (loading ? "loading" : data.me.id)}
    </Query>
  );
};

it("creates a working apollo provider", async () => {
  const controller = new SchemaController();
  const root = TestRenderer.create(
    <MockApolloProvider schema={types} controller={controller}>
      <TestComponent />
    </MockApolloProvider>
  );

  expect(root.toJSON()).toEqual("loading");

  await controller.run();

  expect(root.toJSON()).toEqual("me.id");
});
