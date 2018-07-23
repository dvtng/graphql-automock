export const types = `
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
