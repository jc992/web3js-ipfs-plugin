const webpack = require("webpack");

// TODO:research and see fix for issue below to allow cypress to run tests on a browser environment.
// happens with helia, libp2p, @libp2p/tcp, @chainsafe/libp2p-noise, @chainsafe/libp2p-yamux, blockstore-core, datastore-core, @helia/unixfs
/**
 * Error: Webpack Compilation Error
 * Module not found: Error: Package path . is not exported from package /Users/user/Documents/Projects/web3js-ipfs-plugin/node_modules/helia
 * (see exports field in /Users/user/Documents/Projects/web3js-ipfs-plugin/node_modules/helia/package.json)
 */
module.exports = {
  mode: "development",
  resolve: {
    extensions: [".ts", ".js"],
    fallback: {
      path: require.resolve("path-browserify"),
      os: require.resolve("os-browserify/browser"),
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
    },
    modules: ["src", "node_modules"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: "ts-loader",
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: "process/browser",
      path: "path-browserify",
      os: "os-browserify/browser",
      crypto: "crypto-browserify",
    }),
  ],
};
