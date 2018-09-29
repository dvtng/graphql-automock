import React, { Component } from "react";
import { ApolloProvider } from "react-apollo";
import { mockApolloClient } from "./mock-apollo-client";
import { Controller } from "./controller";

// Automatically create a singleton controller for MockApolloProvider
// to make testing easier
export let controller = new Controller();

export class MockApolloProvider extends Component {
  constructor(props, ...args) {
    super(props, ...args);

    if (!props.controller) {
      controller = new Controller();
    }

    this.client = mockApolloClient({
      schema: props.schema,
      mocks: props.mocks,
      controller: props.controller || controller
    });
  }

  render() {
    const { children } = this.props;
    return <ApolloProvider client={this.client}>{children}</ApolloProvider>;
  }
}
