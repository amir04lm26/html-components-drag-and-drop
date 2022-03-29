const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanPlugin = require("clean-webpack-plugin");

module.exports = {
  mode: "production",
  entry: "./src/app.ts",
  output: {
    // filename: "bundle.js",
    filename: "bundle.[contenthash].js",
    path: path.resolve(__dirname, "dist"),
  },
  devtool: false,
  // NOTE: applies to per file level
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  // NOTE: applies to the general workflow of the webpack build
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html",
    }),
    new CleanPlugin.CleanWebpackPlugin(),
  ],
};
