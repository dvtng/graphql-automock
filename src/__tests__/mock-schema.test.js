import { graphql } from "graphql";
import { mockSchema } from "../mock-schema";

const types = `
  type Query {
    me: User
    post(id: ID!): Post
    recentPosts: [Post!]!
  }

  interface User {
    id: ID!
  }

  type ActiveUser implements User {
    id: ID!
    avatar: String
    displayName: String
  }

  type DeletedUser implements User {
    id: ID!
  }

  enum PostStatus {
    DRAFT
    PUBLISHED
    ARCHIVED
  }

  type Post {
    id: ID!
    content: Content!
    status: PostStatus!
  }

  union Content = TextContent | ImageContent

  type TextContent {
    text: String!
  }

  type ImageContent {
    url: String!
  }
`;

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
