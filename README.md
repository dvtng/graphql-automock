# ⭐️ graphql-automock ⭐️

**Automock GraphQL schemas for better testing.**

## Getting started

Simply pass your GraphQL type definitions to `mockSchema` and
you're ready to go:

```javascript
import { mockSchema } from "graphql-automock";
import { graphql } from "graphql";

const types = `
  type Query {
    recentPosts: [Post!]!
  }

  type Post {
    id: ID!
    content: String!
    likes: Int!
  }
`;

const mocked = mockSchema(types);

graphql(
  mocked,
  `
    query {
      recentPosts {
        id
        content
        likes
      }
    }
  `
);
```

Without any further configuration, this query will return:

```json
{
  "data": {
    "recentPosts": [
      {
        "id": "recentPosts.0.id",
        "content": "recentPosts.0.content",
        "likes": 2
      },
      {
        "id": "recentPosts.1.id",
        "content": "recentPosts.1.content",
        "likes": 2
      }
    ]
  }
}
```

## Deterministic mocking

To ensure that tests are reliable, the values generated by graphql-automock
are 100% deterministic. The following default values are used:

- **Boolean**: `true`
- **Int**: `2`
- **Float**: `3.14`
- **String**: Path to value
- **ID**: Path to value
- **Enum**: The first enum value, sorted alphabetically by name
- **Interface**: The first possible implementation, sorted alphabetically by name
- **Union**: The first possible member type, sorted alphabetically by name
- **List length**: `2`

## Customizing mocks

Automatically mocking the entire schema with sensible, deterministic data allows test code to customize _only the data that affects the test_. This results in test code that is more concise and easier to understand:

```javascript
test("likes count is hidden when there are no likes", () => {
  // Set up test data
  const mocked = mockSchema({
    schema: types,
    mocks: {
      Post: () => ({
        likes: 0 // Only the likes field is customized
      })
    }
  });

  // Continue with test...
});
```

## API Reference

### mockSchema

```javascript
function mockSchema(schema: String | GraphQLSchema): GraphQLSchema;

function mockSchema({
  schema: String | GraphQLSchema,
  mocks: { [String]: MockResolverFn }
}): GraphQLSchema;
```

### mockApolloClient

```javascript
function mockApolloClient(schema: String | GraphQLSchema): ApolloClient;

function mockApolloClient({
  schema: String | GraphQLSchema,
  mocks: { [String]: MockResolverFn }
}): ApolloClient;
```

### type MockResolverFn

```javascript
type MockResolverFn = (source, args, context, info) => any;
```
