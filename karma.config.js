const path = require("path");
const { config } = require("dotenv");

const outputPath = path.join(__dirname, "_karma_webpack_");
const webpack = require("webpack");

config()

const webpackConfig = {
  mode: "development",
  output: {
    path: outputPath,
  },
  stats: {
    modules: false,
    colors: true,
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: [/node_modules/],
      },
    ],
  },
  externals: {
    fs: "commonjs fs",
    path: "commonjs path",
    net: "commonjs net",
  },
  resolve: {
    extensions: [".ts", ".js"],
    modules: [path.join(__dirname, "node_modules")],
    fallback: {
      assert: false,
      fs: false,
      constants: false,
      url: false,
      path: require.resolve("path-browserify"),
      os: require.resolve("os-browserify/browser"),
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: "process/browser",
      path: "path-browserify",
      os: "os-browserify/browser",
      crypto: "crypto-browserify",
    }),
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(process.env),
    }),
  ],
  watch: false,
  optimization: {
    runtimeChunk: "single",
    splitChunks: {
      chunks: "all",
      minSize: 0,
      cacheGroups: {
        commons: {
          name: "commons",
          chunks: "initial",
          minChunks: 1,
        },
      },
    },
  },
};
module.exports = function (config) {
  config.set({
    frameworks: ["webpack", "jasmine"],
    plugins: ["karma-webpack", "karma-jasmine", "karma-chrome-launcher"],
    browsers: ["ChromeHeadless"],
    basePath: "",
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    singleRun: true,
    port: 9876,
    concurrency: 10,
    files: [
      path.join(".", "karma.setup.js"),
      path.join("test", "**/*.e2e-spec.ts"),
    ],
    preprocessors: {
      [path.join(".", "karma.setup.js")]: ["webpack"],
      [path.join("test", "**/*.e2e-spec.ts")]: ["webpack"],
    },
    webpack: webpackConfig,
  });
};
