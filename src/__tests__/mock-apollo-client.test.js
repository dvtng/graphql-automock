import gql from "graphql-tag";
import { mockApolloClient } from "../mock-apollo-client";
import { types } from "./types";
import { SchemaController } from "../schema-controller";

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

it("allows client to be controlled", async () => {
  const controller = new SchemaController();
  const mockedClient = mockApolloClient({ schema: types, controller });

  let result = null;
  mockedClient
    .query({
      query: gql`
        {
          me {
            id
          }
        }
      `
    })
    .then(_result => {
      result = _result;
    });

  expect(result).toBe(null);

  // wait 1000ms
  await new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });

  expect(result).toBe(null);

  await controller.run();

  expect(result.data.me.id).toEqual("me.id");
});
