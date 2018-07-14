import { buildSchema } from "graphql/utilities";
import {
  GraphQLInterfaceType,
  GraphQLUnionType,
  GraphQLEnumType,
  GraphQLSchema
} from "graphql/type";
import { addMockFunctionsToSchema } from "graphql-tools";

const printPath = path => {
  return path.prev ? `${printPath(path.prev)}.${path.key}` : path.key;
};

const lexicalFirst = list => {
  return list.reduce((first, current) => {
    return current < first ? current : first;
  }, list[0]);
};

export const mockSchema = params => {
  // shorthand: mockSchema(schema)
  if (typeof params === "string" || params instanceof GraphQLSchema) {
    return mockSchema({ schema: params });
  }

  const { mocks = {} } = params;
  const schema =
    typeof params.schema === "string"
      ? buildSchema(params.schema)
      : params.schema;

  if (schema instanceof GraphQLSchema === false) {
    throw new Error(`Must provide a valid schema, but received ${schema}`);
  }

  const defaultMocks = {
    Boolean: () => true,
    Float: () => 3.14,
    ID: (parent, args, context, info) => {
      return printPath(info.path);
    },
    Int: () => 2,
    String: (parent, args, context, info) => {
      return printPath(info.path);
    }
  };

  Object.entries(schema.getTypeMap()).forEach(([typename, type]) => {
    // Ignore built-in types
    if (typename.startsWith("__")) {
      return;
    }

    if (
      type instanceof GraphQLInterfaceType ||
      type instanceof GraphQLUnionType
    ) {
      defaultMocks[typename] = () => ({
        __typename: lexicalFirst(schema.getPossibleTypes(type))
      });
    }

    if (type instanceof GraphQLEnumType) {
      defaultMocks[typename] = () =>
        lexicalFirst(type.getValues().map(x => x.value));
    }
  });

  addMockFunctionsToSchema({
    preserveResolvers: false,
    schema,
    mocks: Object.assign(defaultMocks, mocks)
  });

  return schema;
};
