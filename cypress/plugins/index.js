const webpackPreprocessor = require("@cypress/webpack-preprocessor");
const webpackOptions = require("../webpack.config.js");
const fs = require("fs");

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  on("task", {
    readFileMaybe(filename) {
      if (fs.existsSync(filename)) {
        return fs.readFileSync(filename);
      }

      return null;
    },
  });
  on("file:preprocessor", webpackPreprocessor({ webpackOptions }));
  return config;
};
