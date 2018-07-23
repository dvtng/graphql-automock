const VisualizerPlugin = require("webpack-visualizer-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");

module.exports = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",

  entry: "./src/index.js",

  output: {
    library: "graphql-automock",
    libraryTarget: "umd",
    filename: "index.js"
  },

  module: {
    rules: [{ test: /\.js$/, use: "babel-loader" }]
  },

  performance: {
    hints: false
  },

  plugins: [
    new CleanWebpackPlugin(["dist"]),
    process.env.ANALYZE_BUILD === "true" ? new VisualizerPlugin() : () => {}
  ]
};
