const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const PORT = 3000;

module.exports = {
  mode: "development",
  entry: "./src/app.ts",
  output: {
      // filename: "bundle.js",
    filename: "bundle.[contenthash].js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "",
  },
  devtool: "inline-source-map",
  devServer: {
    port: PORT,
    static: {
      directory: path.join(__dirname, "dist"),
    },
    devMiddleware: {
      writeToDisk: true,
    },
  },
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
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html",
    }),
  ],
};
