import gql from "graphql-tag";
import { mockApolloClient } from "../mock-apollo-client";
import { types } from "./types";

it("creates a queryable apollo client", async () => {
  const mockedClient = mockApolloClient(types);
  const result = await mockedClient.query({
    query: gql`
      {
        me {
          id
        }
      }
    `
  });

  expect(result.data.me.id).toEqual("me.id");
});
