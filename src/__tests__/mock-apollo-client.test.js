import gql from "graphql-tag";
import { ApolloError } from "apollo-client";
import { mockApolloClient } from "../mock-apollo-client";
import { types } from "./types";
import { Controller } from "../controller";

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
  const controller = new Controller();
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

it("allows client to be controlled with a network error", async () => {
  const controller = new Controller();
  const mockedClient = mockApolloClient({ schema: types, controller });

  const result = mockedClient
    .query({
      query: gql`
        {
          me {
            id
          }
        }
      `
    })
    .catch(err => err);

  await controller.run({
    networkError: () => new Error("Disconnected")
  });

  expect(result).resolves.toEqual(
    new ApolloError({
      networkError: new Error("Disconnected")
    })
  );
});
