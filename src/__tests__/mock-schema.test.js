import { graphql } from "graphql";
import { mockSchema } from "../mock-schema";
import { types } from "./types";
import { SchemaController } from "../schema-controller";

it("provides default mocks", async () => {
  const mockedSchema = mockSchema(types);
  const result = await graphql(
    mockedSchema,
    `
      {
        me {
          __typename
          ... on ActiveUser {
            displayName
          }
        }
        post(id: "1") {
          content {
            __typename
            ... on TextContent {
              text
            }
            ... on ImageContent {
              url
            }
          }
        }
        recent: recentPosts {
          id
          status
        }
      }
    `
  );

  expect(result).toEqual({
    data: {
      me: {
        __typename: "ActiveUser",
        displayName: "me.displayName"
      },
      post: {
        content: {
          __typename: "ImageContent",
          url: "post.content.url"
        }
      },
      recent: [
        {
          id: "recent.0.id",
          status: "ARCHIVED"
        },
        {
          id: "recent.1.id",
          status: "ARCHIVED"
        }
      ]
    }
  });
});

it("allows override of mocks", async () => {
  const mockedSchema = mockSchema({
    schema: types,
    mocks: {
      Content: () => ({
        __typename: "TextContent"
      }),
      User: () => ({
        __typename: "DeletedUser"
      }),
      PostStatus: (parent, args, context, info) => {
        return info.path.prev.key === 0 ? "DRAFT" : "PUBLISHED";
      }
    }
  });
  const result = await graphql(
    mockedSchema,
    `
      {
        me {
          __typename
          ... on ActiveUser {
            displayName
          }
        }
        post(id: "1") {
          content {
            __typename
            ... on TextContent {
              text
            }
            ... on ImageContent {
              url
            }
          }
        }
        recent: recentPosts {
          id
          status
        }
      }
    `
  );

  expect(result).toEqual({
    data: {
      me: {
        __typename: "DeletedUser"
      },
      post: {
        content: {
          __typename: "TextContent",
          text: "post.content.text"
        }
      },
      recent: [
        {
          id: "recent.0.id",
          status: "DRAFT"
        },
        {
          id: "recent.1.id",
          status: "PUBLISHED"
        }
      ]
    }
  });
});

it("mocks mutations", async () => {
  const mockedSchema = mockSchema(types);
  const result = await graphql(
    mockedSchema,
    `
      mutation {
        createPost(postInput: { imageUrl: "foo" }) {
          id
          content {
            ... on ImageContent {
              url
            }
          }
        }
      }
    `
  );

  expect(result).toEqual({
    data: {
      createPost: {
        id: "createPost.id",
        content: {
          url: "createPost.content.url"
        }
      }
    }
  });
});

it("allows schema to be controlled", async () => {
  const controller = new SchemaController();
  const mockedSchema = mockSchema({
    schema: types,
    controller
  });

  let result = null;
  graphql(
    mockedSchema,
    `
      {
        me {
          id
        }
        post(id: "1") {
          id
        }
      }
    `
  ).then(_result => (result = _result));

  // wait 100ms
  await new Promise(resolve => {
    setTimeout(resolve, 100);
  });

  expect(result).toBe(null);

  await controller.run();

  expect(result).toEqual({
    data: {
      me: {
        id: "me.id"
      },
      post: {
        id: "post.id"
      }
    }
  });
});
